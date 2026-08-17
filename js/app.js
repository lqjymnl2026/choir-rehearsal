// ============================================================
//  诗班排练中心 - Choir Rehearsal App
//  v2：系统排练流程 · 歌谱/音频上传 · 定位打卡考勤 · MP3录音
// ============================================================

(() => {
  'use strict';

  const state = {
    currentUser: null,
    activeTab: 'schedule',
    mediaRecorder: null,
    audioChunks: [],
    recordingTimer: null,
    recordingSeconds: 0,
    playbackIntervals: new Map(),
    pendingSongs: [],
    editingId: null,
    pendingHwSongs: [],
    pendingHwManual: { score: null, audio: null },
  };

  const VOICE_LABELS = { soprano:'女高音', alto:'女低音', tenor:'男高音', bass:'男低音' };

  // ---------- localStorage helpers ----------
  function store(key, value) { localStorage.setItem('choir_' + key, JSON.stringify(value)); }
  function load(key, fallback) { try { const r = localStorage.getItem('choir_' + key); return r ? JSON.parse(r) : fallback; } catch { return fallback; } }

  function getMembers() { return load('members', []); }
  function saveMembers(m) { store('members', m); }
  function getRehearsals() {
    // 初始数据为空：不再内置任何歌曲/排练（旧版默认 r1/r2 一并清除）
    const rs = load('rehearsals', []);
    return rs.filter(r => r.id !== 'r1' && r.id !== 'r2');
  }
  function saveRehearsals(r) { store('rehearsals', r); }
  function getHomework() { return load('homework', []); }
  function persistHomework(h) { store('homework', h); }
  function getRecordings() { return load('recordings', []); }
  function saveRecordings(r) { store('recordings', r); }
  function getCheckins() { return load('checkins', {}); }
  function saveCheckins(c) { store('checkins', c); }
  function getVenue() { return load('venue', { name:'', lat:null, lng:null, radius:500 }); }
  function persistVenue(v) { store('venue', v); }
  function getAttendance() { return load('attendance', []); }
  function saveAttendance(a) { store('attendance', a); }
  function getRepertoire() { return load('repertoire', { Q1:[], Q2:[], Q3:[], Q4:[] }); }
  function saveRepertoire(r) { store('repertoire', r); }
  function getLessonSettings() { return load('lesson_settings', { startLesson: 1, currentLesson: null }); }
  function saveLessonSettings(s) { store('lesson_settings', s); }

  function fmt(d) { return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`; }
  function todayStr() { return fmt(new Date()); }
  function uuid() { return Date.now().toString(36) + Math.random().toString(36).slice(2,8); }
  function esc(s) { return String(s==null?'':s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
  function toast(msg) { const el = document.getElementById('toast'); el.textContent = msg; el.classList.remove('hidden'); setTimeout(() => el.classList.add('hidden'), 3000); }
  function showModal(title, bodyHtml) { document.getElementById('modal-title').textContent = title; document.getElementById('modal-body').innerHTML = bodyHtml; document.getElementById('modal-overlay').classList.remove('hidden'); }
  function hideModal() { document.getElementById('modal-overlay').classList.add('hidden'); }
  function formatDuration(s) { return `${String(Math.floor(s/60)).padStart(2,'0')}:${String(s%60).padStart(2,'0')}`; }
  function haversine(lat1, lon1, lat2, lon2) {
    const R = 6371000, rad = x => x * Math.PI / 180;
    const dLat = rad(lat2 - lat1), dLon = rad(lon2 - lon1);
    const a = Math.sin(dLat/2)**2 + Math.cos(rad(lat1)) * Math.cos(rad(lat2)) * Math.sin(dLon/2)**2;
    return Math.round(2 * R * Math.asin(Math.sqrt(a)));
  }

  // ---------- 基督教节期选歌提示 ----------
  function easterDate(year) {
    const a = year % 19, b = Math.floor(year/100), c = year % 100;
    const d = Math.floor(b/4), e = b % 4, f = Math.floor((b+8)/25), g = Math.floor((b-f+1)/3);
    const h = (19*a + b - d - g + 15) % 30, i = Math.floor(c/4), k = c % 4;
    const l = (32 + 2*e + 2*i - h - k) % 7, m = Math.floor((a + 11*h + 22*l)/451);
    const mon = Math.floor((h + l - 7*m + 114)/31), day = ((h + l - 7*m + 114) % 31) + 1;
    return new Date(year, mon-1, day);
  }
  function dateIn(d, m1, d1, m2, d2) {
    const t = d.getTime(), a = new Date(d.getFullYear(), m1-1, d1).getTime(), b = new Date(d.getFullYear(), m2-1, d2).getTime();
    return t >= a && t <= b;
  }
  function getSeasonHint(date) {
    const y = date.getFullYear();
    const easter = easterDate(y);
    const ashW = new Date(easter); ashW.setDate(easter.getDate() - 46);   // 大斋期开始
    const palm = new Date(easter); palm.setDate(easter.getDate() - 7);     // 受难周开始
    const pent = new Date(easter); pent.setDate(easter.getDate() + 49);    // 圣灵降临节
    const ranges = [
      { name:'新年·新恩典', icon:'fa-star', from:[1,1], to:[1,15], songs:['奇异恩典','我知谁掌管明天','如鹰展翅上腾','一生的奉献'], tips:'新年立志、数算恩典，选「新恩典·奉献·跟从」主题诗歌' },
      { name:'显现期·传福音', icon:'fa-sun', from:[1,16], to:[ashW.getMonth()+1, ashW.getDate()-1], songs:['耶稣爱你','赞美之泉','差遣我','荣耀归于真神'], tips:'传扬福音、见证主名，选「呼召·差遣·见证」主题诗歌' },
      { name:'大斋期·预备', icon:'fa-cross', from:[ashW.getMonth()+1, ashW.getDate()], to:[palm.getMonth()+1, palm.getDate()-1], songs:['十架的爱','宝架清影','仰望十架','活出基督'], tips:'省察悔改、预备心灵，选「十架·悔改·跟从」主题诗歌' },
      { name:'受难周·十架七言', icon:'fa-hands-praying', from:[palm.getMonth()+1, palm.getDate()], to:[easter.getMonth()+1, easter.getDate()-1], songs:['十架的爱','颂赞主权之羔羊','宝架清影','仰望十架'], tips:'默想十架救恩，选曲庄重深沉' },
      { name:'复活节', icon:'fa-church', from:[easter.getMonth()+1, easter.getDate()], to:[easter.getMonth()+1, easter.getDate()+6], songs:['荣耀归主名','祢是荣耀君王','赞美主','基督复活'], tips:'庆祝基督复活，选「得胜·喜乐·盼望」主题诗歌' },
      { name:'复活期·圣灵降临', icon:'fa-fire', from:[easter.getMonth()+1, easter.getDate()+7], to:[pent.getMonth()+1, pent.getDate()-1], songs:['圣灵请你来','恩典之路','差遣我','耶和华祝福满满'], tips:'等候圣灵、回应呼召' },
      { name:'圣灵降临节', icon:'fa-fire', from:[pent.getMonth()+1, pent.getDate()], to:[pent.getMonth()+1, pent.getDate()+6], songs:['圣灵请你来','神的应许永不落空','差遣我'], tips:'圣灵降临带来能力与恩赐' },
      { name:'圣灵降临期·成长', icon:'fa-leaf', from:[pent.getMonth()+1, pent.getDate()+7], to:[10,31], songs:['磐石耶稣','一切歌颂赞美','荣耀归主名','如鹰展翅上腾'], tips:'灵命成长、敬拜生活，可按周主题自由选曲' },
      { name:'感恩月', icon:'fa-heart', from:[11,1], to:[11,20], songs:['一生的奉献','我知谁掌管明天','活出基督','恩典之路'], tips:'数算主恩、感恩奉献' },
      { name:'感恩节', icon:'fa-heart', from:[11,21], to:[11,30], songs:['荣耀归主名','一生的奉献','赞美之泉'], tips:'感恩赞美，见证主恩' },
      { name:'将临期', icon:'fa-hourglass', from:[12,1], to:[12,24], songs:['以马内利来临歌','普世欢腾','平安夜','你们要赞美耶和华'], tips:'预备心灵、等候救主降临，选「盼望·预备」主题' },
      { name:'圣诞期', icon:'fa-star', from:[12,25], to:[12,31], songs:['平安夜','普世欢腾','新生王歌','马槽歌','听啊天使高声唱'], tips:'圣诞赞美会曲目：喜乐荣耀、节目串联' }
    ];
    for (const r of ranges) {
      if (dateIn(date, r.from[0], r.from[1], r.to[0], r.to[1])) return r;
    }
    return null;
  }
  function renderSeasonHint() {
    const season = getSeasonHint(new Date());
    if (!season) return '';
    return `
      <div class="card" style="border-left:4px solid var(--warning);padding:16px 20px;margin-top:12px;">
        <div class="card-title" style="font-size:15px;"><i class="fas ${season.icon}" style="color:#B7791F;"></i> 当前节期：${season.name} · 选歌提示</div>
        <div style="font-size:13px;color:var(--text-muted);margin:6px 0;">${season.tips}</div>
        <div style="display:flex;flex-wrap:wrap;gap:6px;margin-top:6px;">
          ${season.songs.map(x => `<span class="song-tag2">${x}</span>`).join('')}
        </div>
        ${state.currentUser && state.currentUser.role === 'conductor' ? `<button class="btn btn-small btn-primary" style="margin-top:10px;width:auto;" onclick="app.addRehearsal()"><i class="fas fa-plus"></i> 按节期新增排练/献唱</button>` : ''}
      </div>`;
  }

  // ---------- IndexedDB 文件存储（歌谱/音频） ----------
  function openFileDB() {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) { reject(new Error('no indexedDB')); return; }
      const req = indexedDB.open('choir_files_db', 1);
      req.onupgradeneeded = e => { const db = e.target.result; if (!db.objectStoreNames.contains('files')) db.createObjectStore('files'); };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error);
    });
  }
  function dbPut(id, blob) {
    return openFileDB().then(db => new Promise((res, rej) => {
      const tx = db.transaction('files', 'readwrite');
      tx.objectStore('files').put(blob, id);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    }));
  }
  function dbGet(id) {
    return openFileDB().then(db => new Promise((res, rej) => {
      const tx = db.transaction('files', 'readonly');
      const req = tx.objectStore('files').get(id);
      req.onsuccess = () => res(req.result || null);
      req.onerror = () => rej(req.error);
    }));
  }
  function dbDel(id) {
    return openFileDB().then(db => new Promise((res, rej) => {
      const tx = db.transaction('files', 'readwrite');
      tx.objectStore('files').delete(id);
      tx.oncomplete = () => res();
      tx.onerror = () => rej(tx.error);
    }));
  }

  // ---------- MP3 录音 ----------
  function pickMime() {
    try {
      if (window.MediaRecorder) {
        if (MediaRecorder.isTypeSupported('audio/mpeg')) return 'audio/mpeg';
        if (MediaRecorder.isTypeSupported('audio/mp4')) return 'audio/mp4';
        if (MediaRecorder.isTypeSupported('audio/webm;codecs=opus')) return 'audio/webm;codecs=opus';
        if (MediaRecorder.isTypeSupported('audio/webm')) return 'audio/webm';
      }
    } catch (e) {}
    return '';
  }
  async function encodeToMp3(blob) {
    if (blob.type === 'audio/mpeg' || blob.type === 'audio/mp3') return blob;
    if (!window.lamejs) { console.warn('lamejs 未加载，保持原格式'); return blob; }
    try {
      const arrayBuffer = await blob.arrayBuffer();
      const Ctx = window.AudioContext || window.webkitAudioContext;
      const audioCtx = new Ctx();
      const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer);
      const channels = Math.min(2, audioBuffer.numberOfChannels);
      const sampleRate = audioBuffer.sampleRate;
      const encoder = new lamejs.Mp3Encoder(channels, sampleRate, 128);
      const parts = [];
      const to16 = f32 => {
        const s = new Int16Array(f32.length);
        for (let i = 0; i < f32.length; i++) {
          const v = Math.max(-1, Math.min(1, f32[i]));
          s[i] = v < 0 ? v * 0x8000 : v * 0x7FFF;
        }
        return s;
      };
      const left = audioBuffer.getChannelData(0);
      const right = channels > 1 ? audioBuffer.getChannelData(1) : null;
      const block = 1152;
      for (let i = 0; i < left.length; i += block) {
        const l = to16(left.subarray(i, i + block));
        const buf = right ? encoder.encodeBuffer(l, to16(right.subarray(i, i + block))) : encoder.encodeBuffer(l);
        if (buf.length > 0) parts.push(buf);
      }
      const end = encoder.flush();
      if (end.length > 0) parts.push(end);
      if (audioCtx.close) audioCtx.close();
      return new Blob(parts, { type: 'audio/mpeg' });
    } catch (e) {
      console.warn('MP3 编码失败，退回原格式', e);
      return blob;
    }
  }

  // ---------- 本周教案（来自 plans-data.js） ----------
  function currentPlanWeek() {
    if (typeof PLANS_DATA === 'undefined' || !PLANS_DATA.WEEKS) return null;
    const now = new Date();
    const weekOfYear = Math.ceil((now - new Date(now.getFullYear(), 0, 1)) / (7 * 24 * 60 * 60 * 1000));
    return PLANS_DATA.WEEKS[Math.min(Math.max(weekOfYear, 1), 48) - 1] || PLANS_DATA.WEEKS[0];
  }

  function init() { bindLogin(); bindTabs(); bindModal(); bindLogout(); restoreSession(); }

  function bindLogin() {
    document.querySelectorAll('.role-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        document.querySelectorAll('.role-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
      });
    });
    document.getElementById('login-btn').addEventListener('click', doLogin);
    document.getElementById('register-btn').addEventListener('click', () => openRegister(document.getElementById('login-name').value.trim()));
    document.getElementById('login-name').addEventListener('keydown', e => { if (e.key==='Enter') doLogin(); });
  }

  function enterApp(user) {
    state.currentUser = user;
    store('session', { name: user.name, role: user.role, voicePart: user.voicePart });
    document.getElementById('login-page').classList.remove('active');
    document.getElementById('app').classList.add('active');
    if (user.role === 'conductor') document.body.classList.add('is-conductor');
    const partLabel = user.role === 'conductor' ? '指挥' : (VOICE_LABELS[user.voicePart] || '');
    document.getElementById('user-info').textContent = `${user.name} · ${partLabel}`;
    renderAll();
  }

  function restoreSession() {
    const saved = load('session', null);
    if (!saved || !saved.name) return;
    const members = getMembers();
    let user = { name: saved.name, role: saved.role, voicePart: saved.voicePart || '' };
    if (saved.role === 'student') {
      const m = members.find(x => x.name === saved.name && x.role === 'student');
      if (m) user.voicePart = m.voicePart || user.voicePart;
    }
    enterApp(user);
  }

  function doLogin() {
    const name = document.getElementById('login-name').value.trim();
    if (!name) { toast('请输入姓名'); return; }
    const activeRole = document.querySelector('.role-btn.active').dataset.role;
    const members = getMembers();
    if (activeRole === 'conductor') {
      const m = members.find(x => x.name === name && x.role === 'conductor');
      const user = { name, role: 'conductor', voicePart: '' };
      if (!m) { members.push({ name, voicePart: '', phone:'', role: 'conductor' }); saveMembers(members); }
      enterApp(user);
      return;
    }
    // 学员：凭姓名直接登录（声部在注册时确定）
    const m = members.find(x => x.name === name && x.role === 'student');
    if (!m) {
      toast('未找到该学员，请先注册');
      openRegister(name);
      return;
    }
    enterApp({ name, role: 'student', voicePart: m.voicePart || 'soprano' });
  }

  function openRegister(prefillName) {
    showModal('学员注册', `
      <label>姓名</label>
      <input type="text" id="reg-name" value="${esc(prefillName||'')}" placeholder="请输入真实姓名">
      <label>声部</label>
      <select id="reg-part">
        <option value="soprano">女高音 Soprano</option>
        <option value="alto">女低音 Alto</option>
        <option value="tenor">男高音 Tenor</option>
        <option value="bass">男低音 Bass</option>
      </select>
      <label>手机号</label>
      <input type="tel" id="reg-phone" placeholder="请输入手机号" autocomplete="off">
      <button class="btn btn-primary" onclick="app.saveRegister()" style="width:100%;margin-top:10px;"><i class="fas fa-user-plus"></i> 注册并进入</button>
      <div style="font-size:12px;color:var(--text-muted);margin-top:8px;">注册后每次凭姓名即可登录</div>`);
  }

  function saveRegister() {
    const name = document.getElementById('reg-name').value.trim();
    const part = document.getElementById('reg-part').value;
    const phone = document.getElementById('reg-phone').value.trim();
    if (!name) { toast('请输入姓名'); return; }
    if (!/^[0-9\-+ ]{6,}$/.test(phone)) { toast('请输入正确的手机号'); return; }
    const members = getMembers();
    if (members.find(m => m.name === name && m.role === 'student')) { toast('该姓名已注册，请直接登录'); return; }
    members.push({ name, voicePart: part, phone, role: 'student' });
    saveMembers(members);
    hideModal();
    toast('注册成功！');
    enterApp({ name, role: 'student', voicePart: part });
  }

  function bindLogout() {
    document.getElementById('logout-btn').addEventListener('click', () => {
      state.currentUser = null;
      store('session', null);
      document.body.classList.remove('is-conductor');
      document.getElementById('app').classList.remove('active');
      document.getElementById('login-page').classList.add('active');
    });
  }

  function bindTabs() {
    document.querySelectorAll('.tab-btn').forEach(btn => { btn.addEventListener('click', () => switchTab(btn.dataset.tab)); });
  }
  function switchTab(tab) {
    state.activeTab = tab;
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === tab));
    document.querySelectorAll('.tab-content').forEach(c => c.classList.toggle('active', c.id === 'tab-' + tab));
    renderAll();
  }
  function bindModal() {
    document.querySelector('.modal-close').addEventListener('click', hideModal);
    document.getElementById('modal-overlay').addEventListener('click', e => { if (e.target === e.currentTarget) hideModal(); });
  }

  function renderAll() {
    if (!state.currentUser) return;
    renderSchedule();
    renderPractice();
    renderCheckin();
    renderRecordings();
    if (state.currentUser.role === 'conductor') { renderManage(); renderReview(); }
  }

  // ============================================================
  //  TAB: 排练日程（系统化排练流程 + 曲目歌谱/音频）
  // ============================================================
  async function renderSchedule() {
    const container = document.getElementById('tab-schedule');
    const rehearsals = getRehearsals();
    const isCond = state.currentUser.role === 'conductor';

    // 学员只看当次（最近一次）排练内容；指挥看全部
    let display = rehearsals;
    if (!isCond && rehearsals.length) {
      const today = todayStr();
      const upcoming = rehearsals.filter(r => r.date >= today).sort((a,b) => a.date.localeCompare(b.date));
      const past = rehearsals.filter(r => r.date < today).sort((a,b) => b.date.localeCompare(a.date));
      const current = upcoming[0] || past[0];
      display = current ? [current] : [];
    }

    // 预加载附件 URL
    const urls = new Map();
    for (const r of rehearsals) {
      (r.songs || []).forEach((s, idx) => {
        ['score','audio'].forEach(async kind => {
          if (s[kind] && s[kind].fid) {
            dbGet(s[kind].fid).then(blob => { if (blob) urls.set(`${r.id}|${idx}|${kind}`, URL.createObjectURL(blob)); }).catch(()=>{});
          }
        });
      });
    }
    // 等待一小会儿让首个附件加载（不影响整体渲染）
    await new Promise(r => setTimeout(r, 120));

    let html = `<div class="section-title"><i class="fas fa-calendar-alt"></i> 排练日程</div>`;

    // 系统化 90 分钟排练流程（含本周教案）
    html += renderRehearsalFlow();

    // 本周教案（学员端重点查看）
    html += renderThisWeekPlan();

    // 节期选歌提示
    html += renderSeasonHint();

    // 排练总要求
    if (typeof PLANS_DATA !== 'undefined' && PLANS_DATA.REHEARSAL_RULES) {
      html += `<div class="card" style="margin-top:12px;padding:16px 20px;">
        <div class="card-title" style="font-size:15px;"><i class="fas fa-clipboard-check" style="color:var(--primary);"></i> 排练总要求</div>
        <div class="flow-rules">${PLANS_DATA.REHEARSAL_RULES.slice(0,4).map(r => `<span><i class="fas ${r.icon}"></i> ${r.title}：${r.desc}</span>`).join('')}</div>
      </div>`;
    }

    if (isCond) html += `<button class="btn btn-primary" style="width:auto;margin:16px 0;" onclick="app.addRehearsal()"><i class="fas fa-plus"></i> 新增排练 / 献唱</button>`;

    if (!rehearsals.length) {
      html += `<div class="empty-state"><i class="fas fa-calendar-plus"></i><p>${isCond ? '暂无排练日程。指挥可点击「新增排练 / 献唱」自由添加，歌曲与歌谱、音频均可自定义上传（无需系统生成）。' : '暂无排练日程，请等待指挥发布。'}</p></div>`;
    } else if (!isCond) {
      html += `<div style="font-size:12px;color:var(--text-muted);margin-bottom:6px;"><i class="fas fa-info-circle"></i> 仅显示最近一次排练内容</div>`;
    }

    display.forEach(r => {
      html += `
        <div class="rehearsal-card">
          <span class="date-badge"><i class="fas fa-calendar-day"></i> ${esc(r.date)}</span>
          ${r.rtype && r.rtype !== '排练' ? `<span class="rtype-badge rtype-${r.rtype==='献唱'?'sing':(r.rtype==='赞美会'?'praise':'other')}"><i class="fas ${r.rtype==='献唱'?'fa-microphone':(r.rtype==='赞美会'?'fa-church':'fa-flag')}"></i> ${esc(r.rtype)}</span>` : ''}
          <h3>${esc(r.title)}</h3>
          <div class="meta"><i class="fas fa-clock"></i> ${esc(r.time)} &nbsp; <i class="fas fa-map-marker-alt"></i> ${esc(r.location)}</div>
          <p style="font-size:14px;color:var(--text-muted);margin-bottom:8px;">${esc(r.notes || '')}</p>
          <div style="font-weight:600;font-size:13px;margin-bottom:6px;color:var(--primary);"><i class="fas fa-music"></i> 曲目与材料</div>
          <ul class="song-list">
            ${(r.songs||[]).map((s, idx) => renderSongItem(r, s, idx, isCond, urls)).join('')}
          </ul>
          ${isCond ? `<div style="margin-top:12px;display:flex;gap:6px;"><button class="btn btn-small btn-outline" onclick="app.editRehearsal('${r.id}')"><i class="fas fa-edit"></i> 编辑</button><button class="btn btn-small btn-danger" onclick="app.deleteRehearsal('${r.id}')"><i class="fas fa-trash"></i> 删除</button></div>` : ''}
        </div>`;
    });

    // 查看全年教案按钮
    html += `<div style="text-align:center;margin-top:20px;"><a href="plans.html" class="btn btn-outline" style="text-decoration:none;"><i class="fas fa-book"></i> 查看全年48周详细教案</a></div>`;

    container.innerHTML = html;
  }

  function renderSongItem(r, s, idx, isCond, urls) {
    const scoreUrl = urls.get(`${r.id}|${idx}|score`);
    const audioUrl = urls.get(`${r.id}|${idx}|audio`);
    const del = kind => isCond ? `<button class="att-del" onclick="app.deleteAttachment('${r.id}',${idx},'${kind}')" title="删除">×</button>` : '';
    let att = '';
    if (s.score) {
      att += `<span class="att-chip"><i class="fas fa-file-image"></i> 歌谱 <a class="att-link" onclick="app.viewAttachment('${r.id}',${idx},'score')">${esc(s.score.name||'查看')}</a>${del('score')}</span>`;
    } else if (isCond) {
      att += `<label class="att-upload"><i class="fas fa-upload"></i> 上传歌谱<input type="file" accept="image/*,.pdf,application/pdf" style="display:none" onchange="app.uploadAttachment('${r.id}',${idx},'score',this.files[0])"></label>`;
    }
    if (s.audio) {
      att += `<span class="att-chip att-audio"><i class="fas fa-headphones"></i> 范唱 ${audioUrl ? `<audio controls src="${audioUrl}" style="height:32px;max-width:220px;"></audio>` : `<a class="att-link" onclick="app.viewAttachment('${r.id}',${idx},'audio')">播放</a>`}${del('audio')}</span>`;
    } else if (isCond) {
      att += `<label class="att-upload"><i class="fas fa-upload"></i> 上传音频<input type="file" accept="audio/*" style="display:none" onchange="app.uploadAttachment('${r.id}',${idx},'audio',this.files[0])"></label>`;
    }
    return `<li><i class="fas fa-file-audio"></i> ${esc(s.name)} <span style="color:var(--text-muted);font-size:12px;">${esc(s.type||'')}</span>${att ? `<div class="song-att">${att}</div>` : ''}</li>`;
  }

  // ---------- 本周教案卡片（学员端查看） ----------
  function renderThisWeekPlan() {
    if (typeof PLANS_DATA === 'undefined' || !PLANS_DATA.LESSONS) return '';
    const wk = currentPlanWeek();
    if (!wk) return '';
    let st = null;
    try { st = JSON.parse(localStorage.getItem('choir_lesson_settings') || 'null'); } catch (e) {}
    const lessonId = (st && st.currentLesson) ? st.currentLesson : wk.lesson.id;
    const lesson = PLANS_DATA.LESSONS[Math.min(Math.max(lessonId, 1), 52) - 1];
    return `
      <div class="card" style="border-left:4px solid var(--success);padding:18px 20px;margin-top:12px;">
        <div class="card-title" style="font-size:16px;"><i class="fas fa-book-open" style="color:var(--success);"></i> 本周教案 · W${wk.weekNum} ${esc(wk.label)}</div>
        <div style="font-size:13px;color:var(--text-muted);margin:8px 0;">课次：<strong>${lesson.title}</strong> · ${esc(lesson.focus)}</div>
        <div style="font-size:13px;"><i class="fas fa-bible" style="color:var(--primary);"></i> 灵修：${esc(wk.devotion.verse)}（${esc(wk.devotion.theme)}）</div>
        <div style="font-size:13px;margin-top:6px;"><i class="fas fa-fire" style="color:#E17055;"></i> 练声曲：${lesson.vocalise.map(v=>esc(v.title)).join('、')}</div>
        <div style="font-size:13px;margin-top:6px;"><i class="fas fa-eye" style="color:#0984E3;"></i> 简谱视唱：${esc(lesson.sightReading.title)}（${esc(lesson.sightReading.key)} · ${esc(lesson.sightReading.meter)}）</div>
        ${wk.songs && wk.songs.length ? `<div style="font-size:13px;margin-top:6px;"><i class="fas fa-music" style="color:var(--accent);"></i> 本周曲目：${wk.songs.map(s=>esc(s.title)).join('、')}</div>` : ''}
        <a href="plans.html" style="display:inline-block;margin-top:10px;font-size:12.5px;color:var(--primary);">查看完整教案 →</a>
      </div>`;
  }

  // ---------- 系统化排练流程（含本周教案详细内容） ----------
  function renderRehearsalFlow() {
    const wk = currentPlanWeek();
    // 热身/视唱课次：默认按教案周次；指挥在后台选「当前课次」则优先
    let warm = null, solf = null;
    if (wk) {
      warm = { title: wk.lesson ? wk.lesson.title : '', vocalise: wk.warmup.vocal };
      solf = { title: wk.lesson ? wk.lesson.title : '', rhythm: wk.solfege.rhythm, interval: wk.solfege.interval, sightReading: wk.solfege.sightReading };
    }
    let lessonBadge = '';
    if (typeof PLANS_DATA !== 'undefined' && PLANS_DATA.LESSONS) {
      const st = getLessonSettings();
      if (st.currentLesson) {
        const L = PLANS_DATA.LESSONS[Math.min(Math.max(st.currentLesson, 1), 52) - 1];
        warm = { title: L.title, vocalise: L.vocalise };
        solf = { title: L.title, rhythm: L.rhythm, interval: L.interval, sightReading: L.sightReading };
        lessonBadge = `<div style="font-size:12px;color:#B7791F;background:#FFF8E7;border:1px solid #F3D9A4;border-radius:8px;padding:5px 10px;margin-top:6px;"><i class="fas fa-book-reader"></i> 本周热身/视唱课次：<strong>${L.title}</strong>（指挥后台选用）</div>`;
      } else if (wk) {
        lessonBadge = `<div style="font-size:12px;color:var(--text-muted);margin-top:6px;"><i class="fas fa-book-reader"></i> 热身/视唱课次：<strong>${esc(warm.title)}</strong>（指挥可在「管理」选课）</div>`;
      }
    }
    let weekHtml = '';
    if (wk) {
      weekHtml = `
        <div style="display:flex;align-items:center;gap:8px;flex-wrap:wrap;margin:10px 0 14px;padding:10px 14px;background:#F4F0FF;border-radius:10px;">
          <span class="type-badge" style="background:${(PLANS_DATA.WEEK_TYPE_COLORS[wk.type]||'#6C5CE7')};color:#fff;padding:2px 10px;border-radius:10px;font-size:11px;font-weight:700;">W${wk.weekNum} ${PLANS_DATA.WEEK_TYPE_LABELS[wk.type]||''}</span>
          <span style="font-size:13px;font-weight:600;">${esc(wk.label)}</span>
          <a href="plans.html" style="margin-left:auto;font-size:12px;color:var(--primary);">查看本周教案 →</a>
        </div>`;
    }

    return `
    <div class="card" style="border-left:4px solid var(--accent);padding:20px;">
      <div class="card-title" style="font-size:18px;"><i class="fas fa-clock" style="color:var(--accent);"></i> 排练流程 · 90分钟</div>
      <div style="font-size:13px;color:var(--text-muted);margin-bottom:8px;">每次排练按以下五个环节系统进行，点击展开查看详细内容</div>
      ${lessonBadge}
      ${weekHtml}
      <div class="flow-timeline">
        ${flowItem('0:00-0:05','灵修祷告','#E17055','fa-pray', flowDevotion(wk))}
        ${flowItem('0:05-0:20','热身练声','#6C5CE7','fa-fire', flowWarmup(wk, warm))}
        ${flowItem('0:20-0:30','视唱练耳','#0984E3','fa-book-reader', flowSolfege(wk, solf))}
        ${flowItem('0:30-1:20','曲目排练','#FDCB6E','fa-music', flowRehearsal(wk))}
        ${flowItem('1:20-1:30','串联录音','#00B894','fa-microphone-alt', flowRecord(wk))}
      </div>
    </div>`;
  }

  function flowItem(time, label, color, icon, detail) {
    return `
      <div class="flow-item" onclick="this.classList.toggle('expanded')">
        <div class="flow-dot" style="background:${color};"></div>
        <div class="flow-info">
          <div class="flow-time">${time}</div>
          <div class="flow-label">${label}</div>
        </div>
        <div class="flow-detail">${detail}</div>
      </div>`;
  }

  function flowDevotion(wk) {
    if (wk) return `
      <p><strong>经文：</strong>${esc(wk.devotion.verse)}</p>
      <p style="font-style:italic;color:var(--text-muted);">“${esc(wk.devotion.text)}”</p>
      <p><strong>分享主题：</strong>${esc(wk.devotion.theme)}</p>
      <p><strong>灵修分享要点：</strong></p>
      <ul>${(wk.devotion.sharing||[]).slice(0,3).map(s=>`<li>${esc(s)}</li>`).join('')}</ul>
      <p><strong>配合诗歌：</strong>《${esc(wk.devotion.song)}》</p>
      <p><strong>祷告方向：</strong>${esc(wk.devotion.prayer)}</p>`;
    return `<p><strong>经文宣读</strong>— 简短灵修分享（主题/要点）— 为排练与事奉祷告 — 配合诗歌回应</p>`;
  }

  function flowWarmup(wk, warm) {
    let vocal = `<p><strong>声乐练习（8分钟）</strong>— 哼鸣、音阶琶音、元音转换、连音/跳音/顿音</p>`;
    if (warm && warm.vocalise && warm.vocalise.length) {
      vocal = `<p><strong>练声曲（8分钟 · ${esc(warm.title)} · 附简谱）</strong></p>` + warm.vocalise.map(v => `
        <div class="vocalise-item" style="margin-top:8px;">
          <div class="v-title" style="font-size:12.5px;font-weight:700;color:var(--primary);">${v.id} ${esc(v.title)}（${esc(v.key)} · ${esc(v.meter)} · ${esc(v.tempo)} · ${esc(v.vowel)}）</div>
          <div class="jianpu">${v.jianpu.map(l=>`<div class="jp-line">${esc(l)}</div>`).join('')}</div>
          <div class="v-method" style="font-size:11.5px;color:var(--text-muted);">${esc(v.method)}</div>
        </div>`).join('');
    } else if (wk) {
      vocal = wk.warmup.vocal.map(v => `
        <div class="vocalise-item" style="margin-top:8px;">
          <div class="v-title" style="font-size:12.5px;font-weight:700;color:var(--primary);">${v.id} ${esc(v.title)}（${esc(v.key)} · ${esc(v.meter)} · ${esc(v.tempo)} · ${esc(v.vowel)}）</div>
          <div class="jianpu">${v.jianpu.map(l=>`<div class="jp-line">${esc(l)}</div>`).join('')}</div>
          <div class="v-method" style="font-size:11.5px;color:var(--text-muted);">${esc(v.method)}</div>
        </div>`).join('');
    }
    return `
      <p><strong>身体热身（3分钟）</strong>— 活动肩颈腰背、手臂伸展、手腕脚踝</p>
      <p><strong>呼吸训练（4分钟）</strong>— 腹式呼吸、慢吸慢呼、弹跳气息</p>
      ${vocal}
      <p><strong>合唱热身</strong>— 和弦调音、各声部独立起音、节奏统一进入</p>`;
  }

  function flowSolfege(wk, solf) {
    const src = solf || (wk ? { title: wk.lesson?wk.lesson.title:'', rhythm: wk.solfege.rhythm, interval: wk.solfege.interval, sightReading: wk.solfege.sightReading } : null);
    if (src) return `
      <p style="font-size:12px;color:var(--text-muted);"><i class="fas fa-book-reader"></i> ${esc(src.title)}</p>
      <p><strong>节奏训练：</strong>${esc(src.rhythm.name)}</p>
      <div class="jianpu" style="margin:4px 0;">${esc(src.rhythm.jianpu)}</div>
      <p><strong>音程/和弦训练：</strong>${esc(src.interval)}</p>
      <p><strong>简谱视唱：</strong>${esc(src.sightReading.title)}（${esc(src.sightReading.key)} · ${esc(src.sightReading.meter)} · ${esc(src.sightReading.tempo)}）</p>
      <div class="jianpu" style="margin:4px 0;">${src.sightReading.jianpu.map(l=>`<div class="jp-line">${esc(l)}</div>`).join('')}</div>
      <p style="font-size:12px;color:var(--text-muted);">${esc(src.sightReading.target||'')}</p>`;
    return `
      <p><strong>节奏训练</strong>— 四分/八分、附点、切分、三连音、弱起</p>
      <p><strong>音程听辨与构唱</strong>— 大小二/三度、纯四五度、六/七度、八度</p>
      <p><strong>新曲目片段视唱</strong>— 用简谱视唱本周曲目 4-8 小节</p>`;
  }

  function flowRehearsal(wk) {
    let detail = `
      <p><strong>学习新曲目（30分钟）</strong>— 浏览范唱 → 分声部学唱 → 合排（慢→原速）→ 纠正音准节奏咬字</p>
      <p><strong>精排已学曲目（20分钟）</strong>— 力度变化、表情处理、声部平衡融合、艺术打磨</p>`;
    if (wk && wk.rehearsalDetail && wk.rehearsalDetail.length) {
      detail = wk.rehearsalDetail.map(r => `<p><strong>${esc(r.time)} ${esc(r.phase)}</strong>${r.title?`：《${esc(r.title)}》`:''}${r.content?` — ${esc(r.content)}`:''}</p>`).join('');
      if (wk.songReqs && wk.songReqs.length) {
        detail += `<p><strong>曲目排练要求：</strong>${wk.songReqs.slice(0,2).map(sr => `《${esc(sr.title)}》[${sr.reqs.map(q=>q.text).join('；')}]`).join('<br>')}</p>`;
      }
    }
    return detail;
  }

  function flowRecord(wk) {
    return `
      <p>全曲连贯演唱 1-2 遍</p>
      <p>指挥总结点评：表扬进步，指出改进</p>
      <p>录制留档复习（MP3）</p>
      <p>布置在家练习作业与打卡要求</p>`;
  }

  // ============================================================
  //  TAB: 练习作业
  // ============================================================
  function renderPractice() {
    const container = document.getElementById('tab-practice');
    const isCond = state.currentUser.role === 'conductor';
    const homework = getHomework();

    let html = `<div class="section-title"><i class="fas fa-book-open"></i> ${isCond ? '作业管理' : '练习作业'}</div>`;
    if (isCond) html += `<button class="btn btn-primary" style="width:auto;margin-bottom:16px;" onclick="app.addHomework()"><i class="fas fa-plus"></i> 布置作业</button>`;
    if (!homework.length) html += `<div class="empty-state"><i class="fas fa-clipboard-list"></i><p>暂无作业</p></div>`;

    homework.forEach(hw => {
      const recordings = getRecordings().filter(r => r.homeworkId === hw.id);
      const myRecording = !isCond ? recordings.find(r => r.userName === state.currentUser.name) : null;
      const dueDate = hw.dueDate || '无截止日期';
      let statusClass = 'not-submitted', statusText = '未提交';
      if (isCond) {
        const members = getMembers().filter(m => m.role === 'student');
        statusText = `${recordings.length}/${members.length} 已提交`;
        statusClass = recordings.length > 0 ? 'submitted' : 'not-submitted';
      } else if (myRecording) { statusClass = 'submitted'; statusText = '已提交'; }
      else { statusClass = 'pending'; statusText = hw.dueDate && hw.dueDate < todayStr() ? '已逾期' : '待完成'; }

      html += `
        <div class="homework-item">
          <div class="hw-header"><span class="hw-title">${esc(hw.title)}</span><span class="hw-status ${statusClass}">${statusText}</span></div>
          <div class="hw-desc">
            <div><i class="fas fa-info-circle"></i> ${esc(hw.description||'')}</div>
            ${hw.songs && hw.songs.length ? `<div style="margin-top:6px;"><i class="fas fa-music"></i> 曲目：${hw.songs.map((s,si)=>`${esc(s.name)}${s.score?` <a class="att-link" onclick="app.viewHwAttachment('${hw.id}',${si},'score')">[歌谱]</a>`:''}${s.audio?` <a class="att-link" onclick="app.viewHwAttachment('${hw.id}',${si},'audio')">[音频]</a>`:''}`).join('；')}</div>` : ''}
            <div style="margin-top:4px;"><i class="fas fa-hourglass-half"></i> 截止：${esc(dueDate)}</div>
          </div>
          ${!isCond ? (myRecording ? `
            <div style="display:flex;gap:6px;flex-wrap:wrap;">
              <audio controls src="${myRecording.blobUrl}" style="flex:1;min-width:200px;height:40px;"></audio>
              <button class="btn btn-small btn-outline" onclick="app.deleteRecording('${myRecording.id}',null)"><i class="fas fa-redo"></i> 重录</button>
            </div>
          ` : `<button class="btn btn-small btn-primary" onclick="app.startRecordingFor('${hw.id}','${esc(hw.title).replace(/'/g,"\\'")}')"><i class="fas fa-microphone"></i> 录音提交（MP3）</button>`) : `
            <div style="margin-top:8px;display:flex;gap:6px;">
              <button class="btn btn-small btn-outline" onclick="app.reviewHomework('${hw.id}')"><i class="fas fa-headphones"></i> 听录音 (${recordings.length})</button>
              <button class="btn btn-small btn-danger" onclick="app.deleteHomework('${hw.id}')"><i class="fas fa-trash"></i></button>
            </div>`}
        </div>`;
    });
    container.innerHTML = html;
  }

  // ============================================================
  //  TAB: 打卡（排练定位考勤 + 每日练习打卡）
  // ============================================================
  function renderCheckin() {
    const container = document.getElementById('tab-checkin');
    const me = state.currentUser;

    // 指挥无需打卡：只查看今日考勤概览
    if (me.role === 'conductor') {
      const att = getAttendance();
      const today = todayStr();
      const todayAtt = att.filter(a => a.date === today);
      const students = getMembers().filter(m => m.role === 'student');
      const absent = students.filter(m => !todayAtt.some(a => a.name === m.name));
      container.innerHTML = `
        <div class="section-title"><i class="fas fa-check-circle"></i> 排练考勤</div>
        <div class="card" style="border-left:4px solid var(--primary);">
          <div class="card-title"><i class="fas fa-user-shield"></i> 指挥无需打卡</div>
          <div style="font-size:13px;color:var(--text-muted);margin:6px 0;">指挥不需要定位打卡；考勤管理（补录/标记/导出学员册）请到「管理」页。</div>
        </div>
        <div class="card">
          <div class="card-title"><i class="fas fa-map-pin"></i> 今日签到（${today}）· ${todayAtt.length} 人</div>
          ${todayAtt.length ? todayAtt.map(a => `<div style="padding:6px 0;border-bottom:1px dashed var(--border);font-size:13px;">✅ ${esc(a.name)} · ${VOICE_LABELS[a.voicePart]||''} · ${esc(a.time)} · ${esc(a.status)}</div>`).join('') : `<div class="empty-state"><i class="fas fa-calendar-check"></i><p>今日暂无签到</p></div>`}
        </div>
        <div class="card">
          <div class="card-title"><i class="fas fa-user-clock"></i> 未签到学员（${absent.length} 人）</div>
          ${absent.length ? absent.map(m => `<div style="padding:5px 0;font-size:13px;color:var(--text-muted);">— ${esc(m.name)}（${VOICE_LABELS[m.voicePart]||''}）</div>`).join('') : '<div style="font-size:13px;color:var(--success);">全部已签到 ✅</div>'}
        </div>`;
      return;
    }

    const venue = getVenue();
    const att = getAttendance();
    const today = todayStr();
    const myToday = att.find(a => a.date === today && a.name === me.name);
    const checkins = getCheckins();
    const userCheckins = checkins[me.name] || [];
    const now = new Date();
    let streak = 0;
    for (let i = 0; i < 365; i++) { const d = new Date(now); d.setDate(now.getDate() - i); if (userCheckins.includes(fmt(d))) streak++; else break; }
    const year = now.getFullYear(), month = now.getMonth();
    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    // 今日定位考勤卡片
    let attCard = '';
    if (myToday) {
      const ok = myToday.status === '已到排练现场' || myToday.status === '已打卡';
      attCard = `
        <div class="card" style="border-left:4px solid ${ok?'var(--success)':'var(--danger)'};">
          <div class="card-title"><i class="fas fa-map-pin"></i> 今日排练考勤</div>
          <div style="font-size:14px;margin:6px 0;">✅ 已打卡 <span style="color:var(--text-muted);">${myToday.time}</span></div>
          <div style="font-size:13px;color:${ok?'var(--success)':'var(--danger)'};font-weight:600;">${esc(myToday.status)}${myToday.distance!=null?`（距离排练地点 ${myToday.distance}m）`:''}</div>
        </div>`;
    } else {
      attCard = `
        <div class="card" style="border-left:4px solid var(--primary);">
          <div class="card-title"><i class="fas fa-map-pin"></i> 今日排练定位打卡</div>
          <div style="font-size:13px;color:var(--text-muted);margin:6px 0;">排练地点：<strong>${esc(venue.name||'未设置')}</strong>${venue.lat!=null?`（半径 ${venue.radius||500} 米内有效）`:'（指挥尚未设置地点，打卡仅记录位置）'}</div>
          <button class="btn btn-success" onclick="app.checkinToday()"><i class="fas fa-location-dot"></i> 定位打卡</button>
          <div style="font-size:12px;color:var(--text-muted);margin-top:8px;">点击后请允许浏览器获取定位；在排练地点范围内打卡为有效考勤。</div>
        </div>`;
    }

    // 练习打卡日历
    let calHtml = `<div class="checkin-calendar">`;
    ['日','一','二','三','四','五','六'].forEach(d => { calHtml += `<div class="checkin-day empty"><span class="day-label">${d}</span></div>`; });
    for (let i = 0; i < firstDay; i++) calHtml += `<div class="checkin-day empty"></div>`;
    for (let d = 1; d <= daysInMonth; d++) {
      const ds = `${year}-${String(month+1).padStart(2,'0')}-${String(d).padStart(2,'0')}`;
      const cls = ds === today ? 'checkin-day today' : (userCheckins.includes(ds) ? 'checkin-day checked' : 'checkin-day');
      calHtml += `<div class="${cls}" onclick="app.toggleCheckin('${ds}')">${d}</div>`;
    }
    calHtml += `</div>`;

    container.innerHTML = `
      <div class="section-title"><i class="fas fa-check-circle"></i> 排练考勤 · 练习打卡</div>
      ${attCard}
      <div class="checkin-streak"><div class="streak-num">${streak}</div><div class="streak-label">连续练习打卡天数 🔥</div></div>
      <div class="stats-grid"><div class="stat-card"><div class="stat-num">${userCheckins.length}</div><div class="stat-label">本月练习打卡</div></div><div class="stat-card"><div class="stat-num">${streak}</div><div class="stat-label">最长连续</div></div></div>
      <div class="card"><div class="card-title"><i class="fas fa-calendar"></i> 在家练习打卡 ${year}年${month+1}月（点击日期补卡）</div>${calHtml}</div>`;
  }

  // ============================================================
  //  TAB: 录音（MP3）
  // ============================================================
  function renderRecordings() {
    const container = document.getElementById('tab-recordings');
    const recordings = getRecordings();
    const isCond = state.currentUser.role === 'conductor';
    const myRecordings = recordings.filter(r => isCond || r.userName === state.currentUser.name);

    let html = `
      <div class="section-title"><i class="fas fa-microphone"></i> ${isCond ? '全部录音' : '我的录音'}（MP3）</div>
      <div class="recorder-panel">
        <div style="font-weight:600;margin-bottom:8px;">录制声部练习</div>
        <div class="recorder-btn" id="recorder-btn" onclick="app.toggleRecording()"><i class="fas fa-microphone"></i></div>
        <div class="recorder-timer" id="recorder-timer">00:00</div>
        <div class="recorder-controls">
          <button class="btn btn-small btn-outline" id="rec-upload-btn" onclick="app.uploadRecording(null)" disabled><i class="fas fa-upload"></i> 保存</button>
          <button class="btn btn-small btn-danger" id="rec-discard-btn" onclick="app.discardRecording()" disabled><i class="fas fa-trash"></i> 丢弃</button>
        </div>
        <input type="text" id="rec-title" placeholder="录音标题（如：奇异恩典-女高音）" style="width:100%;padding:8px 12px;border:2px solid var(--border);border-radius:8px;font-size:14px;margin-top:12px;">
        <div style="font-size:12px;color:var(--text-muted);margin-top:6px;"><i class="fas fa-info-circle"></i> 录音将自动转码为 MP3 格式</div>
      </div>`;

    if (!myRecordings.length) html += `<div class="empty-state"><i class="fas fa-music"></i><p>暂无录音</p></div>`;

    if (isCond) html += `<div class="filter-tabs"><button class="filter-tab active" onclick="app.filterRecordings(this,'all')">全部</button><button class="filter-tab" onclick="app.filterRecordings(this,'soprano')">女高</button><button class="filter-tab" onclick="app.filterRecordings(this,'alto')">女低</button><button class="filter-tab" onclick="app.filterRecordings(this,'tenor')">男高</button><button class="filter-tab" onclick="app.filterRecordings(this,'bass')">男低</button></div>`;

    myRecordings.sort((a, b) => b.ts - a.ts).forEach(r => {
      html += `
        <div class="recording-item" data-voice="${r.voicePart || ''}">
          <audio controls src="${r.blobUrl}" style="width:140px;height:36px;"></audio>
          <div class="rec-info">
            <div class="rec-title">${esc(r.title)}</div>
            <div class="rec-meta">${esc(r.userName)} · ${VOICE_LABELS[r.voicePart]||''} · ${esc(r.date)} · ${esc(r.duration)}${r.fileName?' · '+esc(r.fileName):''}</div>
          </div>
          <div class="rec-actions">
            <button class="btn btn-small btn-outline" onclick="app.downloadRecording('${r.id}')"><i class="fas fa-download"></i></button>
            <button class="btn btn-small btn-danger" onclick="app.deleteRecording('${r.id}',null)"><i class="fas fa-trash"></i></button>
          </div>
        </div>`;
    });
    container.innerHTML = html;
  }

  // ============================================================
  //  TAB: 管理 (指挥) — 成员 + 排练地点 + 考勤表
  // ============================================================
  function renderManage() {
    const container = document.getElementById('tab-manage');
    const members = getMembers().filter(m => m.role === 'student');
    const att = getAttendance();
    const checkins = getCheckins();
    const recordings = getRecordings();
    const venue = getVenue();

    let html = `
      <div class="section-title"><i class="fas fa-users-cog"></i> 成员管理</div>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-num">${members.length}</div><div class="stat-label">总人数</div></div>
        <div class="stat-card"><div class="stat-num">${recordings.length}</div><div class="stat-label">录音总数</div></div>
        <div class="stat-card"><div class="stat-num">${att.filter(a=>a.date===todayStr()&&a.status==='已到排练现场').length}</div><div class="stat-label">今日定位签到</div></div>
        <div class="stat-card"><div class="stat-num">${getHomework().length}</div><div class="stat-label">待完成作业</div></div>
      </div>
      <button class="btn btn-primary" style="width:auto;margin-bottom:16px;" onclick="app.addMember()"><i class="fas fa-user-plus"></i> 添加成员</button>`;

    // 年度曲目库（全年教案用）
    html += renderRepertoireSection();

    // 热身练声 & 视唱练耳：52课系列课程
    html += renderLessonSection();

    // 排练地点设置
    html += `
      <div class="card" style="border-left:4px solid var(--primary);">
        <div class="card-title"><i class="fas fa-map-pin"></i> 排练地点设置（定位打卡用）</div>
        <div style="display:grid;gap:8px;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));">
          <label>地点名称<input type="text" id="venue-name" value="${esc(venue.name||'')}" placeholder="如：教会一楼诗班室" style="margin-top:4px;"></label>
          <label>有效半径(米)<input type="number" id="venue-radius" value="${venue.radius||500}" min="100" step="50" style="margin-top:4px;"></label>
        </div>
        <div style="display:flex;gap:6px;margin-top:8px;flex-wrap:wrap;">
          <button class="btn btn-small btn-primary" onclick="app.useMyLocation()"><i class="fas fa-location-crosshairs"></i> 获取当前位置</button>
          <button class="btn btn-small btn-success" onclick="app.saveVenue()"><i class="fas fa-save"></i> 保存地点</button>
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin-top:8px;" id="venue-coords">${venue.lat!=null?`当前坐标：${venue.lat.toFixed(5)}, ${venue.lng.toFixed(5)}`:'尚未设置坐标'}</div>
      </div>`;

    // 考勤表（含考勤管理）
    html += `<div class="section-title" style="margin-top:24px;"><i class="fas fa-clipboard-list"></i> 排练考勤表（点击单元格可标记/取消）</div>`;
    html += renderAttendanceTable(att, members);

    // 学员详细统计
    html += renderStudentStats();

    // 成员分组
    ['soprano','alto','tenor','bass'].forEach(part => {
      const pm = members.filter(m => m.voicePart === part);
      if (!pm.length) return;
      html += `<div class="card"><div class="card-title"><i class="fas fa-users"></i> ${VOICE_LABELS[part]}</div>`;
      pm.forEach(m => {
        const mc = (checkins[m.name]||[]).filter(d=>d===todayStr()).length;
        const mr = recordings.filter(r=>r.userName===m.name).length;
        html += `<div style="display:flex;justify-content:space-between;align-items:center;padding:8px 0;border-bottom:1px solid var(--border);"><div><div style="font-weight:600;">${esc(m.name)}</div><div style="font-size:12px;color:var(--text-muted);">${m.phone?esc(m.phone)+' · ':''}练习打卡 ${mc>0?'✅':'—'} · 录音 ${mr} · 出勤 ${att.filter(a=>a.name===m.name).length}次</div></div><div style="display:flex;gap:4px;"><button class="btn btn-small btn-outline" onclick="app.showStudentDetail('${esc(m.name).replace(/'/g,"\\'")}')"><i class="fas fa-chart-line"></i> 详情</button><button class="btn btn-small btn-danger" onclick="app.removeMember('${esc(m.name).replace(/'/g,"\\'")}')"><i class="fas fa-trash"></i></button></div></div>`;
      });
      html += `</div>`;
    });
    container.innerHTML = html;
  }

  function renderAttendanceTable(att, members) {
    const dates = [...new Set(att.map(a => a.date))].sort().reverse();
    const students = members.filter(m => m.role === 'student');
    const cnt = n => n >= 5 ? '#00B894' : (n >= 3 ? '#FDCB6E' : '#E17055');
    let table = '';
    // 手动补录
    table += `<div class="card" style="border-left:4px solid var(--secondary);">
      <div class="card-title"><i class="fas fa-user-pen"></i> 考勤管理 · 手动补录</div>
      <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;">
        <input type="date" id="att-date" value="${todayStr()}">
        <select id="att-member">${students.map(m=>`<option value="${esc(m.name)}">${esc(m.name)}（${VOICE_LABELS[m.voicePart]||''}）</option>`).join('')}</select>
        <button class="btn btn-small btn-primary" onclick="app.manualAttendance()"><i class="fas fa-user-check"></i> 补录签到</button>
      </div>
      <div style="font-size:11.5px;color:var(--text-muted);margin-top:6px;">提示：点击表格中的 — / △ / ✓ 单元格，可手动标记或取消该学员当日考勤。</div>
    </div>`;
    if (!dates.length) {
      table += `<div class="empty-state"><i class="fas fa-clipboard-list"></i><p>暂无考勤记录。学员在「打卡」页定位打卡后自动生成，也可用上方「手动补录」添加。</p></div>`;
      return table;
    }
    table += `<div style="overflow-x:auto;"><table class="att-table">
      <tr><th>成员</th>${dates.map(d => `<th>${d.slice(5).replace('-','/')}</th>`).join('')}<th>出勤</th></tr>`;
    students.forEach(m => {
      const my = att.filter(a => a.name === m.name);
      table += `<tr><td>${esc(m.name)}<br><span style="font-size:11px;color:var(--text-muted);">${VOICE_LABELS[m.voicePart]||''}</span></td>`;
      dates.forEach(d => {
        const a = my.find(x => x.date === d);
        const ok = a && a.status === '已到排练现场';
        const title = a ? (a.status === '已到排练现场' ? '到场（点击取消）' : '异地/未定位（点击标记到场）') : '未签到（点击标记到场）';
        table += `<td class="att-cell ${ok?'att-ok':(a?'att-off':'')}" title="${title}" onclick="app.toggleAttendance('${d}','${esc(m.name).replace(/'/g,"\\'")}')">${ok?'✓':(a?'△':'—')}</td>`;
      });
      table += `<td style="font-weight:700;color:${cnt(my.length)};">${my.length}/${dates.length}</td></tr>`;
    });
    table += `</table></div>`;
    table += `<div style="display:flex;gap:6px;margin-top:10px;flex-wrap:wrap;">
      <button class="btn btn-small btn-outline" onclick="app.exportAttendance()"><i class="fas fa-file-csv"></i> 导出考勤CSV</button>
      <button class="btn btn-small btn-outline" onclick="app.exportRoster()"><i class="fas fa-users"></i> 导出学员册</button>
      <button class="btn btn-small btn-outline" onclick="window.print()"><i class="fas fa-print"></i> 打印</button>
      <span style="font-size:12px;color:var(--text-muted);align-self:center;">✓ 到场 · △ 异地/未定位 · — 未签到</span>
    </div>`;
    return table;
  }

  // ============================================================
  //  学员详细统计 / 考勤管理 / 导出学员册
  // ============================================================
  function renderStudentStats() {
    const members = getMembers().filter(m => m.role === 'student');
    const att = getAttendance();
    const checkins = getCheckins();
    const recordings = getRecordings();
    const homework = getHomework();
    let html = `<div class="section-title" style="margin-top:24px;"><i class="fas fa-chart-line"></i> 学员详细统计</div><div class="card">`;
    if (!members.length) html += `<div class="empty-state"><i class="fas fa-users"></i><p>暂无学员</p></div>`;
    members.forEach(m => {
      const myAtt = att.filter(a => a.name === m.name);
      const myCheck = (checkins[m.name] || []).length;
      const myRec = recordings.filter(r => r.userName === m.name);
      const hwCount = homework.filter(hw => recordings.some(r => r.homeworkId === hw.id && r.userName === m.name)).length;
      html += `<div class="stu-stat">
        <div style="flex:1;">
          <div style="font-weight:700;">${esc(m.name)} <span style="font-size:11px;color:var(--text-muted);font-weight:400;">${VOICE_LABELS[m.voicePart]||''}${m.phone?' · '+esc(m.phone):''}</span></div>
          <div style="font-size:11.5px;color:var(--text-muted);">出勤 ${myAtt.length}次 · 练习打卡 ${myCheck}天 · 录音 ${myRec.length} · 交作业 ${hwCount}</div>
        </div>
        <button class="btn btn-small btn-outline" onclick="app.showStudentDetail('${esc(m.name).replace(/'/g,"\\'")}')"><i class="fas fa-chart-line"></i> 详情</button>
      </div>`;
    });
    html += `</div>`;
    return html;
  }
  function showStudentDetail(name) {
    const m = getMembers().find(x => x.name === name);
    const att = getAttendance().filter(a => a.name === name);
    const checkins = (getCheckins()[name] || []).slice().sort().reverse();
    const recs = getRecordings().filter(r => r.userName === name).sort((a,b) => b.ts - a.ts);
    const homework = getHomework();
    const hwCount = homework.filter(hw => recs.some(r => r.homeworkId === hw.id)).length;
    const body = `
      <p style="font-size:15px;"><strong>${esc(name)}</strong> · ${VOICE_LABELS[m?.voicePart]||''}${m?.phone?` · ${esc(m.phone)}`:''}</p>
      <div class="stats-grid">
        <div class="stat-card"><div class="stat-num">${att.length}</div><div class="stat-label">出勤次数</div></div>
        <div class="stat-card"><div class="stat-num">${checkins.length}</div><div class="stat-label">练习打卡</div></div>
        <div class="stat-card"><div class="stat-num">${recs.length}</div><div class="stat-label">录音数</div></div>
        <div class="stat-card"><div class="stat-num">${hwCount}</div><div class="stat-label">交作业</div></div>
      </div>
      <div style="margin-top:12px;"><strong><i class="fas fa-clipboard-check"></i> 出勤记录（${att.length}）</strong>
        <ul style="margin:4px 0 0;padding-left:20px;font-size:13px;">${att.length ? att.slice().sort((a,b)=>b.date.localeCompare(a.date)).map(a => `<li>${esc(a.date)} ${esc(a.time)} · ${esc(a.status)}</li>`).join('') : '<li style="color:var(--text-muted)">暂无</li>'}</ul>
      </div>
      <div style="margin-top:10px;"><strong><i class="fas fa-book-open"></i> 练习打卡（${checkins.length}天）</strong>
        <div style="font-size:12.5px;color:var(--text-muted);margin-top:4px;">${checkins.length ? checkins.map(d=>d.slice(5)).join('、') : '暂无'}</div>
      </div>
      <div style="margin-top:10px;"><strong><i class="fas fa-microphone"></i> 录音（${recs.length}）</strong>
        <ul style="margin:4px 0 0;padding-left:20px;font-size:13px;">${recs.length ? recs.slice(0,10).map(r => `<li>${esc(r.date)} · ${esc(r.title)} · ${esc(r.duration)}${r.feedback?' · 💬 '+esc(r.feedback):''}</li>`).join('') : '<li style="color:var(--text-muted)">暂无</li>'}</ul>
      </div>`;
    showModal('学员详情：' + name, body);
  }
  function toggleAttendance(date, name) {
    const att = getAttendance();
    const i = att.findIndex(a => a.date === date && a.name === name);
    if (i >= 0) { att.splice(i, 1); toast('已取消 ' + name + ' 的考勤'); }
    else {
      const m = getMembers().find(x => x.name === name);
      att.push({ date, name, voicePart: m ? m.voicePart : '', time: '手动', status: '已到排练现场', manual: true });
      toast('已标记 ' + name + ' 到场');
    }
    saveAttendance(att); renderManage();
  }
  function manualAttendance() {
    const date = document.getElementById('att-date').value;
    const name = document.getElementById('att-member').value;
    if (!date || !name) { toast('请选择日期和学员'); return; }
    const att = getAttendance();
    if (att.some(a => a.date === date && a.name === name)) { toast('该学员当天已签到'); return; }
    const m = getMembers().find(x => x.name === name);
    att.push({ date, name, voicePart: m ? m.voicePart : '', time: '手动补录', status: '已到排练现场', manual: true });
    saveAttendance(att); toast('已补录 ' + name + '（' + date + '）'); renderManage();
  }
  function exportRoster() {
    const members = getMembers().filter(m => m.role === 'student');
    const att = getAttendance();
    const checkins = getCheckins();
    const recordings = getRecordings();
    const homework = getHomework();
    let csv = '\uFEFF姓名,声部,手机号,出勤次数,练习打卡天数,录音数,交作业数\n';
    members.forEach(m => {
      const hwCount = homework.filter(hw => recordings.some(r => r.homeworkId === hw.id && r.userName === m.name)).length;
      csv += `${m.name},${VOICE_LABELS[m.voicePart]||''},${m.phone||''},${att.filter(a=>a.name===m.name).length},${(checkins[m.name]||[]).length},${recordings.filter(r=>r.userName===m.name).length},${hwCount}\n`;
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `诗班学员册-${todayStr()}.csv`;
    a.click();
    toast('学员册已导出');
  }

  // ============================================================
  //  TAB: 检查作业 (指挥)
  // ============================================================
  function renderReview() {
    const container = document.getElementById('tab-review');
    const recordings = getRecordings();
    const homework = getHomework();

    let html = `<div class="section-title"><i class="fas fa-headphones"></i> 作业检查</div>`;
    if (!recordings.length) html += `<div class="empty-state"><i class="fas fa-headphones"></i><p>暂无录音提交</p></div>`;

    homework.forEach(hw => {
      const hwRecs = recordings.filter(r => r.homeworkId === hw.id);
      if (!hwRecs.length) return;
      html += `<div class="card"><div class="card-title"><i class="fas fa-clipboard-list"></i> ${esc(hw.title)}</div>`;
      hwRecs.forEach(r => {
        html += `
          <div class="student-review-card">
            <div class="student-header"><span class="student-name">${esc(r.userName)}</span><span class="voice-badge ${r.voicePart}">${VOICE_LABELS[r.voicePart]}</span></div>
            <audio controls src="${r.blobUrl}" style="width:100%;height:40px;"></audio>
            <div style="font-size:12px;color:var(--text-muted);margin:6px 0;">${esc(r.date)} ${esc(r.time)} · ${esc(r.duration)}${r.fileName?' · '+esc(r.fileName):''}</div>
            ${r.feedback ? `<div style="padding:8px 12px;background:#E8F5E9;border-radius:8px;font-size:13px;margin-bottom:8px;">💬 ${esc(r.feedback)}</div>` : ''}
            <div style="display:flex;gap:6px;">
              <input type="text" id="feedback-${r.id}" placeholder="写评语..." value="${esc(r.feedback||'')}" style="flex:1;padding:6px 10px;border:1.5px solid var(--border);border-radius:6px;font-size:13px;">
              <button class="btn btn-small btn-success" onclick="app.saveFeedback('${r.id}')"><i class="fas fa-save"></i></button>
            </div>
          </div>`;
      });
      html += `</div>`;
    });

    const standalone = recordings.filter(r => !r.homeworkId);
    if (standalone.length) {
      html += `<div class="card"><div class="card-title"><i class="fas fa-music"></i> 声部练习录音</div>`;
      standalone.forEach(r => {
        html += `<div class="student-review-card"><div class="student-header"><span class="student-name">${esc(r.userName)}</span><span class="voice-badge ${r.voicePart}">${VOICE_LABELS[r.voicePart]}</span></div><audio controls src="${r.blobUrl}" style="width:100%;height:40px;"></audio><div style="font-size:12px;color:var(--text-muted);margin-top:4px;">${esc(r.date)} · ${esc(r.duration)} · ${esc(r.title)}</div></div>`;
      });
      html += `</div>`;
    }
    container.innerHTML = html;
  }

  // ============================================================
  //  年度曲目库（全年教案用，指挥后台管理）
  // ============================================================
  function renderRepertoireSection() {
    const repo = getRepertoire();
    const qMeta = { Q1:['第一季度','新年新恩典'], Q2:['第二季度','十字架的恩典'], Q3:['第三季度','圣灵的火'], Q4:['第四季度','道成肉身·圣诞'] };
    let html = `
      <div class="section-title" style="margin-top:24px;"><i class="fas fa-book-music"></i> 年度曲目库（全年教案用）</div>
      <div class="card" style="border-left:4px solid var(--secondary);">
        <div style="font-size:12.5px;color:var(--text-muted);margin-bottom:10px;">指挥在此上传全年排练曲目；保存后打开「全年48周教案」会自动按曲目库重新生成。不填则使用系统内置曲目。</div>
        <div style="display:grid;gap:10px;">`;
    ['Q1','Q2','Q3','Q4'].forEach(qid => {
      const songs = repo[qid] || [];
      html += `
        <div class="repo-q">
          <div class="repo-q-title"><i class="fas fa-music"></i> ${qMeta[qid][0]}（${qMeta[qid][1]}） · ${songs.length}首</div>
          <div class="repo-list">
            ${songs.length ? songs.map((s,i)=>`<div class="repo-song"><span>${esc(s.name||'')}${s.key?`<em>${esc(s.key)}</em>`:''}${s.meter?`<em>${esc(s.meter)}</em>`:''}</span><button class="btn btn-small btn-danger" onclick="app.delRepertoireSong('${qid}',${i})"><i class="fas fa-trash"></i></button></div>`).join('') : '<div style="font-size:12px;color:var(--text-muted);">暂无曲目，待上传</div>'}
          </div>
          <div class="repo-add">
            <input type="text" id="repo-name-${qid}" placeholder="歌名" style="flex:1;min-width:90px;">
            <input type="text" id="repo-key-${qid}" placeholder="调性" style="max-width:70px;">
            <input type="text" id="repo-meter-${qid}" placeholder="节拍" style="max-width:70px;">
            <button class="btn btn-small btn-primary" onclick="app.addRepertoireSong('${qid}')"><i class="fas fa-plus"></i> 添加</button>
          </div>
        </div>`;
    });
    html += `</div></div>`;
    return html;
  }
  function addRepertoireSong(qid) {
    const name = document.getElementById('repo-name-' + qid).value.trim();
    if (!name) { toast('请输入歌名'); return; }
    const repo = getRepertoire();
    repo[qid] = repo[qid] || [];
    repo[qid].push({ name, key: document.getElementById('repo-key-'+qid).value.trim(), meter: document.getElementById('repo-meter-'+qid).value.trim(), type: '赞美诗', diff: '★★' });
    saveRepertoire(repo);
    toast('已添加曲目');
    renderManage();
  }
  function delRepertoireSong(qid, idx) {
    const repo = getRepertoire();
    repo[qid] = repo[qid] || [];
    repo[qid].splice(idx, 1);
    saveRepertoire(repo);
    toast('已删除');
    renderManage();
  }

  // ============================================================
  //  热身练声 & 视唱练耳：52课系列课程（指挥后台选课）
  // ============================================================
  function renderLessonSection() {
    if (typeof PLANS_DATA === 'undefined' || !PLANS_DATA.LESSONS) return '';
    const lessons = PLANS_DATA.LESSONS;
    const st = getLessonSettings();
    const cur = st.currentLesson;
    const options = lessons.map(l => `<option value="${l.id}" ${l.id===cur?'selected':''}>${l.title}</option>`).join('');
    const startOptions = lessons.map(l => `<option value="${l.id}" ${l.id===st.startLesson?'selected':''}>${l.title}</option>`).join('');
    let html = `
      <div class="section-title" style="margin-top:24px;"><i class="fas fa-book-reader"></i> 热身练声 & 视唱练耳 · 52课系列课程</div>
      <div class="card" style="border-left:4px solid var(--warning);">
        <div style="font-size:12.5px;color:var(--text-muted);margin-bottom:10px;">全年 52 课系列（练声曲 + 简谱视唱 + 节奏/音程）。可选择「起始课」（全年第一课从哪课开始），也可随时自由选用任意一课作为本周热身/视唱课次。</div>
        <div class="lesson-settings">
          <div>
            <label>全年第一课起始课程</label>
            <div style="display:flex;gap:6px;">
              <select id="ls-start" style="flex:1;">${startOptions}</select>
              <button class="btn btn-small btn-primary" onclick="app.saveStartLesson()"><i class="fas fa-save"></i> 保存</button>
            </div>
          </div>
          <div>
            <label>当前课次（本周热身/视唱用）</label>
            <div style="display:flex;gap:6px;">
              <select id="ls-current" style="flex:1;">${options}</select>
              <button class="btn btn-small btn-success" onclick="app.saveCurrentLesson()"><i class="fas fa-check"></i> 选用</button>
            </div>
          </div>
        </div>
        <div style="font-size:12px;color:var(--text-muted);margin:6px 0;">当前：<strong>${cur ? lessons[cur-1].title : '自动（按教案周次）'}</strong>${cur?` · ${lessons[cur-1].focus}`:''}　起始：第 ${st.startLesson} 课</div>
        <div class="lesson-grid">
          ${lessons.map(l => `
            <div class="lesson-item ${l.id===cur?'active':''}">
              <div class="lesson-item-title">${l.title}${l.id===st.startLesson?' <em style="color:#B7791F;">起始</em>':''}</div>
              <div style="font-size:11px;color:var(--text-muted);line-height:1.5;">${l.focus}</div>
              <button class="btn btn-small btn-outline" style="margin-top:6px;width:100%;" onclick="app.setCurrentLesson(${l.id})"><i class="fas fa-hand-pointer"></i> 设为本周课次</button>
            </div>`).join('')}
        </div>
      </div>`;
    return html;
  }
  function saveStartLesson() {
    const st = getLessonSettings();
    st.startLesson = parseInt(document.getElementById('ls-start').value) || 1;
    saveLessonSettings(st);
    toast('起始课程已保存（第' + st.startLesson + '课），全年教案已按此重新生成');
    renderManage();
  }
  function saveCurrentLesson() {
    const st = getLessonSettings();
    st.currentLesson = parseInt(document.getElementById('ls-current').value) || null;
    saveLessonSettings(st);
    toast('本周课次已选用第' + st.currentLesson + '课');
    renderManage();
  }
  function setCurrentLesson(id) {
    const st = getLessonSettings();
    st.currentLesson = id;
    saveLessonSettings(st);
    toast('已设为本周课次：第' + id + '课');
    renderManage();
  }

  // ============================================================
  //  考勤：定位打卡 / 导出
  // ============================================================
  function checkinToday() {
    const today = todayStr();
    const att = getAttendance();
    if (att.some(a => a.date === today && a.name === state.currentUser.name)) { toast('今天已打卡'); return; }
    if (!navigator.geolocation) { toast('当前浏览器不支持定位'); return; }
    toast('正在获取定位…');
    navigator.geolocation.getCurrentPosition(pos => {
      const lat = pos.coords.latitude, lng = pos.coords.longitude;
      const venue = getVenue();
      let status = '已打卡', distance = null;
      if (venue && venue.lat != null) {
        distance = haversine(lat, lng, venue.lat, venue.lng);
        status = distance <= (venue.radius || 500) ? '已到排练现场' : `未在排练地点（${distance}m）`;
      }
      const rec = { date: today, name: state.currentUser.name, voicePart: state.currentUser.voicePart, time: new Date().toTimeString().slice(0,5), lat: +lat.toFixed(6), lng: +lng.toFixed(6), distance, status };
      att.push(rec); saveAttendance(att);
      const c = getCheckins(); c[state.currentUser.name] = c[state.currentUser.name] || []; if (!c[state.currentUser.name].includes(today)) c[state.currentUser.name].push(today); saveCheckins(c);
      toast('打卡成功：' + status);
      renderAll();
    }, err => { toast('定位失败：请开启定位权限后重试'); }, { enableHighAccuracy: true, timeout: 10000, maximumAge: 30000 });
  }

  function useMyLocation() {
    if (!navigator.geolocation) { toast('当前浏览器不支持定位'); return; }
    toast('正在获取当前位置…');
    navigator.geolocation.getCurrentPosition(pos => {
      const venue = getVenue();
      venue.lat = +pos.coords.latitude.toFixed(6);
      venue.lng = +pos.coords.longitude.toFixed(6);
      persistVenue(venue);
      const el = document.getElementById('venue-coords');
      if (el) el.textContent = `当前坐标：${venue.lat}, ${venue.lng}`;
      toast('已获取当前位置，请保存');
    }, () => { toast('定位失败：请开启定位权限'); }, { enableHighAccuracy: true, timeout: 10000 });
  }

  function saveVenue() {
    const v = getVenue();
    v.name = document.getElementById('venue-name').value.trim() || '教会排练室';
    v.radius = parseInt(document.getElementById('venue-radius').value) || 500;
    persistVenue(v);
    toast('排练地点已保存');
    renderAll();
  }

  function exportAttendance() {
    const att = getAttendance();
    const dates = [...new Set(att.map(a => a.date))].sort();
    const members = getMembers().filter(m => m.role === 'student');
    let csv = '\uFEFF成员,声部,' + dates.map(d => d.replace(/-/g,'/')).join(',') + ',出勤率\n';
    members.forEach(m => {
      const my = att.filter(a => a.name === m.name);
      const row = dates.map(d => {
        const a = my.find(x => x.date === d);
        return a ? (a.status === '已到排练现场' ? '✓' : '△') : '';
      });
      csv += `${m.name},${VOICE_LABELS[m.voicePart]||''},${row.join(',')},${my.length}/${dates.length}\n`;
    });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }));
    a.download = `诗班考勤表-${todayStr()}.csv`;
    a.click();
    toast('考勤表已导出');
  }

  // ============================================================
  //  歌谱 / 音频 上传
  // ============================================================
  async function uploadAttachment(rid, songIdx, kind, file) {
    if (!file) return;
    const rs = getRehearsals();
    const r = rs.find(x => x.id === rid); if (!r) return;
    const s = (r.songs || [])[songIdx]; if (!s) return;
    const fid = uuid();
    try { await dbPut(fid, file); } catch (e) { toast('保存文件失败（浏览器存储空间不足或不可用）'); return; }
    s[kind] = { fid, name: file.name, type: file.type, size: file.size };
    saveRehearsals(rs);
    toast('已上传' + (kind === 'score' ? '歌谱' : '音频'));
    renderAll();
  }

  async function deleteAttachment(rid, songIdx, kind) {
    if (!confirm('确定删除该' + (kind === 'score' ? '歌谱' : '音频') + '？')) return;
    const rs = getRehearsals();
    const r = rs.find(x => x.id === rid); if (!r) return;
    const s = (r.songs || [])[songIdx];
    if (s && s[kind]) { try { await dbDel(s[kind].fid); } catch (e) {} delete s[kind]; saveRehearsals(rs); }
    toast('已删除');
    renderAll();
  }

  async function viewAttachment(rid, songIdx, kind) {
    const rs = getRehearsals();
    const r = rs.find(x => x.id === rid); if (!r) return;
    const s = (r.songs || [])[songIdx]; const att = s && s[kind]; if (!att || !att.fid) return;
    const blob = await dbGet(att.fid); if (!blob) { toast('文件不存在或已被删除'); return; }
    const url = URL.createObjectURL(blob);
    const isImg = blob.type.startsWith('image/');
    const body = isImg
      ? `<img src="${url}" style="max-width:100%;border-radius:10px;">`
      : (blob.type === 'application/pdf'
        ? `<iframe src="${url}" style="width:100%;height:70vh;border:none;border-radius:10px;"></iframe>`
        : `<audio controls src="${url}" style="width:100%;"></audio>`);
    showModal((kind === 'score' ? '歌谱' : '音频') + '：' + s.name, body + `<div style="margin-top:12px;text-align:center;"><a href="${url}" download="${esc(att.name)}" class="btn btn-small btn-primary" style="text-decoration:none;"><i class="fas fa-download"></i> 下载 ${esc(att.name)}</a></div>`);
  }

  // ============================================================
  //  录音（MP3）
  // ============================================================
  async function toggleRecording() {
    const btn = document.getElementById('recorder-btn');
    if (!state.mediaRecorder || state.mediaRecorder.state === 'inactive') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        state.audioChunks = [];
        const mime = pickMime();
        state.mediaRecorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
        state.mediaRecorder.ondataavailable = e => state.audioChunks.push(e.data);
        state.mediaRecorder.onstop = () => { stream.getTracks().forEach(t => t.stop()); document.getElementById('rec-upload-btn').disabled = false; document.getElementById('rec-discard-btn').disabled = false; };
        state.mediaRecorder.start();
        state.recordingSeconds = 0;
        state.recordingTimer = setInterval(() => { state.recordingSeconds++; document.getElementById('recorder-timer').textContent = formatDuration(state.recordingSeconds); }, 1000);
        btn.classList.add('recording'); btn.innerHTML = '<i class="fas fa-stop"></i>';
      } catch { toast('无法访问麦克风，请检查权限'); }
    } else {
      state.mediaRecorder.stop(); clearInterval(state.recordingTimer);
      btn.classList.remove('recording'); btn.innerHTML = '<i class="fas fa-microphone"></i>';
    }
  }

  async function uploadRecording(homeworkId) {
    if (!state.audioChunks.length) { toast('没有录音'); return; }
    const blob = new Blob(state.audioChunks, { type: pickMime() || 'audio/webm' });
    toast('正在转码为 MP3…');
    const mp3 = await encodeToMp3(blob);
    const url = URL.createObjectURL(mp3);
    const title = document.getElementById('rec-title')?.value || '声部练习';
    const r = { id:uuid(), userName:state.currentUser.name, voicePart:state.currentUser.voicePart, title, date:todayStr(), time:new Date().toTimeString().slice(0,5), duration:formatDuration(state.recordingSeconds), blobUrl:url, homeworkId:homeworkId||null, ts:Date.now(), feedback:null, fileName:'录音.mp3', mimeType:'audio/mpeg' };
    const recs = getRecordings(); recs.push(r); saveRecordings(recs);
    resetRecorder(); toast('录音已保存为 MP3！'); hideModal(); renderAll();
  }

  function discardRecording() {
    state.audioChunks = []; state.recordingSeconds = 0;
    if (state.mediaRecorder && state.mediaRecorder.state !== 'inactive') state.mediaRecorder.stop();
    state.mediaRecorder = null; clearInterval(state.recordingTimer);
    document.getElementById('recorder-timer').textContent = '00:00';
    document.getElementById('rec-upload-btn').disabled = true;
    document.getElementById('rec-discard-btn').disabled = true;
    toast('录音已丢弃');
  }

  function resetRecorder() {
    state.audioChunks = []; state.mediaRecorder = null; state.recordingSeconds = 0;
    clearInterval(state.recordingTimer);
    document.getElementById('recorder-timer').textContent = '00:00';
    document.getElementById('rec-upload-btn').disabled = true;
    document.getElementById('rec-discard-btn').disabled = true;
    const t = document.getElementById('rec-title'); if (t) t.value = '';
  }

  function downloadRecording(id) {
    const r = getRecordings().find(x => x.id === id); if (!r) return;
    const a = document.createElement('a'); a.href = r.blobUrl; a.download = `${r.title}-${r.userName}.mp3`; a.click();
  }

  function deleteRecording(id) {
    saveRecordings(getRecordings().filter(r => r.id !== id)); toast('已删除'); renderAll();
  }

  function startRecordingFor(hwId, title) {
    showModal('录音提交 - ' + title, `
      <p style="font-size:14px;color:var(--text-muted);margin-bottom:16px;">点击红色按钮开始录音，完成后点提交，将自动转码为 MP3。</p>
      <div class="recorder-panel" style="box-shadow:none;">
        <div class="recorder-btn" id="hw-recorder-btn" onclick="app.toggleHwRecording()"><i class="fas fa-microphone"></i></div>
        <div class="recorder-timer" id="hw-recorder-timer">00:00</div>
        <div class="recorder-controls"><button class="btn btn-small btn-success" id="hw-rec-upload" onclick="app.uploadHwRecording('${hwId}')" disabled><i class="fas fa-upload"></i> 提交</button></div>
      </div>`);
  }

  async function toggleHwRecording() {
    const btn = document.getElementById('hw-recorder-btn');
    if (!state.mediaRecorder || state.mediaRecorder.state === 'inactive') {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
        state.audioChunks = [];
        const mime = pickMime();
        state.mediaRecorder = mime ? new MediaRecorder(stream, { mimeType: mime }) : new MediaRecorder(stream);
        state.mediaRecorder.ondataavailable = e => state.audioChunks.push(e.data);
        state.mediaRecorder.onstop = () => { stream.getTracks().forEach(t => t.stop()); document.getElementById('hw-rec-upload').disabled = false; };
        state.mediaRecorder.start();
        state.recordingSeconds = 0;
        state.recordingTimer = setInterval(() => { state.recordingSeconds++; const t = document.getElementById('hw-recorder-timer'); if(t) t.textContent = formatDuration(state.recordingSeconds); }, 1000);
        btn.classList.add('recording'); btn.innerHTML = '<i class="fas fa-stop"></i>';
      } catch { toast('无法访问麦克风，请检查权限'); }
    } else {
      state.mediaRecorder.stop(); clearInterval(state.recordingTimer);
      btn.classList.remove('recording'); btn.innerHTML = '<i class="fas fa-microphone"></i>';
    }
  }

  async function uploadHwRecording(hwId) {
    if (!state.audioChunks.length) { toast('没有录音'); return; }
    const blob = new Blob(state.audioChunks, { type: pickMime() || 'audio/webm' });
    toast('正在转码为 MP3…');
    const mp3 = await encodeToMp3(blob);
    const url = URL.createObjectURL(mp3);
    const title = document.getElementById('rec-title')?.value || '作业录音';
    const r = { id:uuid(), userName:state.currentUser.name, voicePart:state.currentUser.voicePart, title, date:todayStr(), time:new Date().toTimeString().slice(0,5), duration:formatDuration(state.recordingSeconds), blobUrl:url, homeworkId:hwId||null, ts:Date.now(), feedback:null, fileName:'录音.mp3', mimeType:'audio/mpeg' };
    const recs = getRecordings(); recs.push(r); saveRecordings(recs);
    resetRecorder(); toast('录音已提交（MP3）！'); hideModal(); renderAll();
  }

  // ============================================================
  //  Rehearsals CRUD
  // ============================================================
  function addRehearsal() {
    state.editingId = null;
    state.pendingSongs = [{ name:'', type:'赞美诗', score:null, audio:null }];
    showModal('新增排练 / 献唱', rehearsalFormHtml(null));
  }
  function editRehearsal(id) {
    const r = getRehearsals().find(x => x.id === id); if (!r) return;
    state.editingId = id;
    state.pendingSongs = (r.songs || []).map(s => ({ name:s.name||'', type:s.type||'赞美诗', score:s.score||null, audio:s.audio||null }));
    if (!state.pendingSongs.length) state.pendingSongs = [{ name:'', type:'赞美诗', score:null, audio:null }];
    showModal('编辑排练', rehearsalFormHtml(r));
  }
  function deleteRehearsal(id) {
    if (!confirm('确定删除？')) return;
    const rs = getRehearsals();
    const r = rs.find(x => x.id === id);
    if (r) (r.songs || []).forEach(s => { if (s.score) dbDel(s.score.fid).catch(()=>{}); if (s.audio) dbDel(s.audio.fid).catch(()=>{}); });
    saveRehearsals(rs.filter(x => x.id !== id)); toast('已删除'); renderAll();
  }
  function rehearsalFormHtml(r) {
    const season = getSeasonHint(new Date());
    const seasonHtml = season ? `
      <div class="season-hint">
        <div class="season-hint-title"><i class="fas ${season.icon}"></i> 当前节期：${season.name} · 选歌提示</div>
        <div style="font-size:12px;color:var(--text-muted);margin:4px 0;">${season.tips}</div>
        <div class="season-songs">${season.songs.map(x => `<span>${x}</span>`).join('')}</div>
      </div>` : '';
    return `
      <label>日期</label><input type="date" id="r-date" value="${r?.date||todayStr()}">
      <label>标题</label><input type="text" id="r-title" value="${esc(r?.title||'')}" placeholder="如：主日献唱排练 / 圣诞赞美会排练">
      <label>类型（献唱时间不固定，自行安排）</label>
      <select id="r-type">
        <option value="排练" ${r?.rtype==='排练'||!r?'selected':''}>排练</option>
        <option value="献唱" ${r?.rtype==='献唱'?'selected':''}>献唱</option>
        <option value="赞美会" ${r?.rtype==='赞美会'?'selected':''}>赞美会</option>
        <option value="特别活动" ${r?.rtype==='特别活动'?'selected':''}>特别活动</option>
      </select>
      <label>时间</label><input type="text" id="r-time" value="${esc(r?.time||'14:00-16:00')}">
      <label>地点</label><input type="text" id="r-location" value="${esc(r?.location||'')}" placeholder="排练地点">
      ${seasonHtml}
      <label>曲目（自由添加 · 歌谱/音频可直接上传）</label>
      <div id="song-editor">${renderSongRows()}</div>
      <button class="btn btn-outline" style="width:100%;margin-bottom:10px;" onclick="app.addSongRow()"><i class="fas fa-plus"></i> 添加曲目</button>
      <label>备注</label><textarea id="r-notes">${esc(r?.notes||'')}</textarea>
      <button class="btn btn-primary" id="save-rehearsal-btn" style="width:100%;margin-top:8px;" onclick="app.saveRehearsalForm()">保存</button>`;
  }
  function renderSongRows() {
    return state.pendingSongs.map((s, i) => `
      <div class="song-row" data-i="${i}">
        <div style="display:flex;gap:6px;">
          <input type="text" class="sr-name" value="${esc(s.name)}" placeholder="歌名" oninput="app.songInput(${i},'name',this.value)">
          <input type="text" class="sr-type" value="${esc(s.type)}" placeholder="类型" oninput="app.songInput(${i},'type',this.value)" style="max-width:96px;">
        </div>
        <div style="display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-top:6px;">
          <label class="att-upload"><i class="fas fa-file-image"></i> ${s.score?'已传歌谱':'上传歌谱'}<input type="file" accept="image/*,.pdf,application/pdf" style="display:none" onchange="app.songFile(${i},'score',this)"></label>
          <label class="att-upload"><i class="fas fa-headphones"></i> ${s.audio?'已传音频':'上传音频'}<input type="file" accept="audio/*" style="display:none" onchange="app.songFile(${i},'audio',this)"></label>
          ${s.score||s.audio?`<button class="btn btn-small btn-outline" onclick="app.clearSongFiles(${i})">清除附件</button>`:''}
          <button class="btn btn-small btn-danger" onclick="app.delSongRow(${i})"><i class="fas fa-trash"></i></button>
        </div>
      </div>`).join('');
  }
  function songInput(i, key, val) { if (state.pendingSongs[i]) state.pendingSongs[i][key] = val; }
  function addSongRow() { state.pendingSongs.push({ name:'', type:'赞美诗', score:null, audio:null }); document.getElementById('song-editor').innerHTML = renderSongRows(); }
  function delSongRow(i) {
    const row = state.pendingSongs[i];
    if (row) { if (row.score) dbDel(row.score.fid).catch(()=>{}); if (row.audio) dbDel(row.audio.fid).catch(()=>{}); }
    state.pendingSongs.splice(i, 1);
    if (!state.pendingSongs.length) state.pendingSongs = [{ name:'', type:'赞美诗', score:null, audio:null }];
    document.getElementById('song-editor').innerHTML = renderSongRows();
  }
  function clearSongFiles(i) {
    const row = state.pendingSongs[i]; if (!row) return;
    if (row.score) { dbDel(row.score.fid).catch(()=>{}); row.score = null; }
    if (row.audio) { dbDel(row.audio.fid).catch(()=>{}); row.audio = null; }
    document.getElementById('song-editor').innerHTML = renderSongRows();
  }
  async function songFile(i, kind, input) {
    const file = input && input.files && input.files[0]; if (!file || !state.pendingSongs[i]) return;
    const fid = uuid();
    try { await dbPut(fid, file); } catch(e) { toast('文件保存失败（存储空间不足或不可用）'); return; }
    state.pendingSongs[i][kind] = { fid, name: file.name, type: file.type, size: file.size };
    document.getElementById('song-editor').innerHTML = renderSongRows();
    toast('已上传' + (kind === 'score' ? '歌谱' : '音频'));
  }
  function saveRehearsalForm() {
    const isEdit = !!state.editingId;
    const songs = [];
    document.querySelectorAll('#song-editor .song-row').forEach((rowEl, i) => {
      const name = rowEl.querySelector('.sr-name').value.trim();
      const type = rowEl.querySelector('.sr-type').value.trim() || '赞美诗';
      const att = state.pendingSongs[i] || {};
      if (name) songs.push({ name, type, score: att.score || null, audio: att.audio || null });
    });
    if (!songs.length) { toast('请至少添加一首曲目'); return; }
    const rtype = document.getElementById('r-type').value;
    const r = {
      id: isEdit ? state.editingId : uuid(),
      rtype,
      date: document.getElementById('r-date').value,
      title: document.getElementById('r-title').value.trim() || rtype,
      time: document.getElementById('r-time').value,
      location: document.getElementById('r-location').value,
      songs,
      notes: document.getElementById('r-notes').value
    };
    const rs = getRehearsals();
    if (isEdit) { const i = rs.findIndex(x => x.id === state.editingId); if (i >= 0) rs[i] = r; }
    else rs.unshift(r);
    saveRehearsals(rs); hideModal(); state.editingId = null;
    toast(isEdit ? '已更新' : '已添加');
    renderAll();
  }

  // ============================================================
  //  Homework / Members
  // ============================================================
  function addHomework() {
    state.pendingHwSongs = [];
    state.pendingHwManual = { score: null, audio: null };
    showModal('布置作业', `
      <label>标题</label><input type="text" id="hw-title" placeholder="如：本周声部练习">
      <label>歌曲（从已上传歌曲调入，也可手动添加）</label>
      <div id="hw-pick-source">${renderHwPickSource()}</div>
      <div id="hw-song-list">${renderHwSongs()}</div>
      <label>手动添加歌曲</label>
      <div style="display:flex;gap:6px;flex-wrap:wrap;">
        <input type="text" id="hw-new-name" placeholder="歌名" style="flex:1;min-width:100px;">
        <label class="att-upload"><i class="fas fa-file-image"></i> 歌谱<input type="file" accept="image/*,.pdf,application/pdf" style="display:none" onchange="app.hwManualFile('score',this)"></label>
        <label class="att-upload"><i class="fas fa-headphones"></i> 音频<input type="file" accept="audio/*" style="display:none" onchange="app.hwManualFile('audio',this)"></label>
        <button class="btn btn-small btn-primary" onclick="app.hwManualAdd()"><i class="fas fa-plus"></i> 添加</button>
      </div>
      <label>要求</label><textarea id="hw-desc" placeholder="描述练习要求"></textarea>
      <label>截止</label><input type="date" id="hw-due">
      <button class="btn btn-primary" onclick="app.saveHomework()" style="width:100%;margin-top:8px;">发布</button>`);
  }
  function hwSourceSongs() {
    const out = [];
    const repo = getRepertoire();
    ['Q1','Q2','Q3','Q4'].forEach(q => (repo[q] || []).forEach(s => out.push({ name: s.name, src: '年度曲目库', score: null, audio: null })));
    getRehearsals().forEach(r => (r.songs || []).forEach(s => out.push({ name: s.name, src: r.title || '排练', score: s.score || null, audio: s.audio || null })));
    const seen = new Set();
    return out.filter(s => { if (!s.name || seen.has(s.name)) return false; seen.add(s.name); return true; });
  }
  function renderHwPickSource() {
    const songs = hwSourceSongs();
    if (!songs.length) return `<div style="font-size:12px;color:var(--text-muted);margin-bottom:8px;">暂无已上传歌曲（可先在「年度曲目库」或排练中添加，或在下方手动添加）</div>`;
    return `<div class="hw-src-list">${songs.map((s,i)=>`<button class="hw-src-chip ${state.pendingHwSongs.some(x=>x.name===s.name)?'active':''}" onclick="app.hwToggleSource(${i})">${esc(s.name)}</button>`).join('')}</div>`;
  }
  function hwToggleSource(i) {
    const src = hwSourceSongs();
    const s = src[i]; if (!s) return;
    const existing = state.pendingHwSongs.find(x => x.name === s.name);
    if (existing) state.pendingHwSongs = state.pendingHwSongs.filter(x => x.name !== s.name);
    else state.pendingHwSongs.push({ name: s.name, score: s.score, audio: s.audio });
    document.getElementById('hw-pick-source').innerHTML = renderHwPickSource();
    document.getElementById('hw-song-list').innerHTML = renderHwSongs();
  }
  function renderHwSongs() {
    if (!state.pendingHwSongs.length) return `<div style="font-size:12px;color:var(--text-muted);margin:6px 0;">尚未选择歌曲</div>`;
    return `<div class="hw-picked-list">${state.pendingHwSongs.map((s,i)=>`<div class="hw-picked"><i class="fas fa-music"></i> ${esc(s.name)}${s.score?' <em>歌谱✓</em>':''}${s.audio?' <em>音频✓</em>':''} <button class="btn btn-small btn-danger" onclick="app.hwDelSong(${i})"><i class="fas fa-trash"></i></button></div>`).join('')}</div>`;
  }
  async function hwManualFile(kind, input) {
    const file = input && input.files && input.files[0]; if (!file) return;
    const fid = uuid();
    try { await dbPut(fid, file); } catch(e) { toast('文件保存失败'); return; }
    state.pendingHwManual[kind] = { fid, name: file.name, type: file.type, size: file.size };
    toast('已暂存' + (kind === 'score' ? '歌谱' : '音频') + '，点「添加」加入作业');
  }
  function hwManualAdd() {
    const name = document.getElementById('hw-new-name').value.trim();
    if (!name) { toast('请输入歌名'); return; }
    state.pendingHwSongs.push({ name, score: state.pendingHwManual.score || null, audio: state.pendingHwManual.audio || null });
    state.pendingHwManual = { score: null, audio: null };
    document.getElementById('hw-new-name').value = '';
    document.getElementById('hw-song-list').innerHTML = renderHwSongs();
    toast('已添加歌曲');
  }
  function hwDelSong(i) { state.pendingHwSongs.splice(i, 1); document.getElementById('hw-song-list').innerHTML = renderHwSongs(); }
  async function viewHwAttachment(hwId, idx, kind) {
    const hw = getHomework().find(x => x.id === hwId); if (!hw) return;
    const s = (hw.songs || [])[idx]; const att = s && s[kind]; if (!att || !att.fid) return;
    const blob = await dbGet(att.fid); if (!blob) { toast('文件不存在'); return; }
    const url = URL.createObjectURL(blob);
    const isImg = blob.type.startsWith('image/');
    const body = isImg ? `<img src="${url}" style="max-width:100%;border-radius:10px;">` : (blob.type === 'application/pdf' ? `<iframe src="${url}" style="width:100%;height:70vh;border:none;"></iframe>` : `<audio controls src="${url}" style="width:100%;"></audio>`);
    showModal((kind === 'score' ? '歌谱' : '音频') + '：' + s.name, body + `<div style="margin-top:12px;text-align:center;"><a href="${url}" download="${esc(att.name)}" class="btn btn-small btn-primary" style="text-decoration:none;"><i class="fas fa-download"></i> 下载</a></div>`);
  }
  function saveHomework() {
    const hw = {
      id: uuid(),
      title: document.getElementById('hw-title').value || '作业',
      description: document.getElementById('hw-desc').value,
      songs: state.pendingHwSongs,
      dueDate: document.getElementById('hw-due').value,
      ts: Date.now()
    };
    const h = getHomework(); h.unshift(hw); persistHomework(h); hideModal(); state.pendingHwSongs = [];
    toast('已发布！'); renderAll();
  }
  function deleteHomework(id) {
    if (!confirm('确定删除？')) return;
    const hw = getHomework().find(x => x.id === id);
    if (hw) (hw.songs || []).forEach(s => { if (s.score) dbDel(s.score.fid).catch(()=>{}); if (s.audio) dbDel(s.audio.fid).catch(()=>{}); });
    persistHomework(getHomework().filter(h => h.id !== id));
    saveRecordings(getRecordings().filter(r => r.homeworkId !== id)); toast('已删除'); renderAll();
  }
  function saveFeedback(rid) { const input = document.getElementById('feedback-'+rid); if (!input) return; const rs = getRecordings(); const r = rs.find(x=>x.id===rid); if (r) { r.feedback = input.value; saveRecordings(rs); toast('评语已保存'); } }
  function reviewHomework(hwId) { switchTab('review'); }
  function addMember() {
    showModal('添加成员', `<label>姓名</label><input type="text" id="m-name"><label>声部</label><select id="m-part"><option value="soprano">女高音</option><option value="alto">女低音</option><option value="tenor">男高音</option><option value="bass">男低音</option></select><label>手机号</label><input type="tel" id="m-phone" placeholder="选填"><button class="btn btn-primary" onclick="app.saveNewMember()" style="width:100%;margin-top:8px;">添加</button>`);
  }
  function saveNewMember() { const n = document.getElementById('m-name').value.trim(); if (!n) { toast('请输入姓名'); return; } const ms = getMembers(); if (ms.find(m=>m.name===n)) { toast('已存在'); return; } ms.push({name:n, voicePart:document.getElementById('m-part').value, phone:document.getElementById('m-phone').value.trim(), role:'student'}); saveMembers(ms); hideModal(); toast('已添加'); renderManage(); }
  function removeMember(name) { if (!confirm(`移除 ${name}？`)) return; saveMembers(getMembers().filter(m=>m.name!==name)); toast('已移除'); renderManage(); }
  function filterRecordings(btn, voice) { btn.parentElement.querySelectorAll('.filter-tab').forEach(b=>b.classList.remove('active')); btn.classList.add('active'); document.querySelectorAll('.recording-item').forEach(el=>{ el.style.display = voice==='all'||el.dataset.voice===voice?'':'none'; }); }

  // 每日练习打卡（日历补卡）
  function toggleCheckin(date) {
    const c = getCheckins();
    c[state.currentUser.name] = c[state.currentUser.name] || [];
    const i = c[state.currentUser.name].indexOf(date);
    if (i >= 0) { c[state.currentUser.name].splice(i, 1); toast('已取消该日打卡'); }
    else { c[state.currentUser.name].push(date); toast('练习打卡成功'); }
    saveCheckins(c); renderCheckin();
  }

  // Public
  window.app = {
    toggleRecording, uploadRecording, discardRecording, downloadRecording, deleteRecording,
    startRecordingFor, toggleHwRecording, uploadHwRecording,
    checkinToday, toggleCheckin,
    addRehearsal, editRehearsal, deleteRehearsal, saveRehearsalForm,
    addRepertoireSong, delRepertoireSong,
    saveStartLesson, saveCurrentLesson, setCurrentLesson,
    addSongRow, delSongRow, songInput, songFile, clearSongFiles,
    addHomework, saveHomework, deleteHomework, saveFeedback,
    hwToggleSource, hwManualFile, hwManualAdd, hwDelSong, viewHwAttachment,
    addMember, saveNewMember, removeMember, filterRecordings, reviewHomework,
    uploadAttachment, deleteAttachment, viewAttachment,
    useMyLocation, saveVenue, exportAttendance, exportRoster,
    showStudentDetail, toggleAttendance, manualAttendance,
    openRegister, saveRegister
  };
  document.addEventListener('DOMContentLoaded', init);
})();
