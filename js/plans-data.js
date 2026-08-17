// ============================================================
//  诗班全年排练教案数据 (48周 / 4季度 / 32首曲目)
// ============================================================

const PLANS_DATA = (() => {

// ---- 四季度曲目定义 ----
const DEFAULT_QUARTERS = [
  // ========== Q1: 1-3月 新年新恩典 ==========
  {
    id:'Q1', label:'第一季度', theme:'新年新恩典', months:'1-3月',
    songs: [
      { id:'S01', title:'奇异恩典', en:'Amazing Grace', key:'G大调', meter:'3/4', tempo:'♩=72', range:'D4-D5', diff:'★★', voicing:'SATB',
        focus:['长气息控制','乐句连贯性','弱起拍处理'], tips:['副歌第3句情感高潮用渐强','结尾两次渐弱要一致','女声哼鸣要柔'], rehearsalSteps:['朗读歌词3遍体会含义','S谱视唱旋律（哼鸣→唱名→歌词）','A谱视唱旋律','T谱视唱旋律','B谱视唱旋律','S+A合练慢速','T+B合练慢速','四声部合排（慢速50%）','原速合排','处理强弱和呼吸'] },
      { id:'S02', title:'一切歌颂赞美', en:'All Praise to God', key:'D大调', meter:'4/4', tempo:'♩=108', range:'A3-E5', diff:'★★★', voicing:'SATB',
        focus:['节奏准确性','声部独立性','和声张力'], tips:['前奏节奏型要统一','副歌各声部要突出旋律线','渐强标记要明显'], rehearsalSteps:['听范唱1遍把握整体风格','分声部打节奏','分声部学旋律','S+A合练','T+B合练','四声部慢速合排','原速合排','处理力度层次'] },
      { id:'S03', title:'我知谁掌管明天', en:'I Know Who Holds Tomorrow', key:'F大调', meter:'4/4', tempo:'♩=80', range:'C4-F5', diff:'★★', voicing:'SATB',
        focus:['情感表达','乐句呼吸','音色统一'], tips:['前两段用叙述语气','副歌充满信心','结尾温柔收束'], rehearsalSteps:['朗读歌词感受诗意的表达','哼鸣旋律','分声部学唱','合排慢速','处理情感层次','完整演唱'] },
      { id:'S04', title:'如鹰展翅上腾', en:'As the Eagle', key:'E♭大调', meter:'4/4', tempo:'♩=96', range:'B♭3-G5', diff:'★★★', voicing:'SATB',
        focus:['高音控制','和声饱满度','渐强渐弱'], tips:['男声进入要坚定','副歌高音区开放唱','最后渐强到ff再渐弱'], rehearsalSteps:['发声练习重点练高音区','分声部学唱（注意高音段落）','声部对接练习','合排处理力度','完整演唱'] },
      { id:'S05', title:'祢是荣耀君王', en:'You Are the King of Glory', key:'C大调', meter:'4/4', tempo:'♩=116', range:'G4-A5', diff:'★★★', voicing:'SATB',
        focus:['节奏活力','力度对比','欢快表达'], tips:['节奏要弹跳','强弱对比要鲜明','副歌要热情'], rehearsalSteps:['打节拍感受律动','分声部学旋律（注意节奏型）','合排慢速','加速到原速','处理力度变化','完整演唱'] },
      { id:'S06', title:'耶稣爱你', en:'Jesus Loves You', key:'G大调', meter:'3/4', tempo:'♩=88', range:'D4-F5', diff:'★', voicing:'SA/TB',
        focus:['柔和音色','表情记号','二部合唱'], tips:['女声主导旋律要甜美','男声和声要轻柔','三段递进情感'], rehearsalSteps:['哼鸣感受甜美音色','女声学旋律','男声学和声','合排处理表情','完整演唱'] },
      { id:'S07', title:'赞美之泉', en:'Fountain of Praise', key:'A♭大调', meter:'4/4', tempo:'♩=84', range:'E♭4-F5', diff:'★★', voicing:'SATB',
        focus:['和声色彩','音色融合','抒情表达'], tips:['前奏由钢琴引导进入','中段转调注意音准','副歌和声层叠要清晰'], rehearsalSteps:['听前奏感受和声色彩','分声部学唱（注意转调段）','声部融合练习','合排处理层次','完整演唱'] },
      { id:'S08', title:'一生的奉献', en:'A Lifetime of Dedication', key:'D大调', meter:'3/4', tempo:'♩=76', range:'A3-E5', diff:'★★★', voicing:'SATB',
        focus:['庄严感','发音咬字','和声饱满'], tips:['节奏稳健庄重','咬字清晰有力','结尾辉煌'], rehearsalSteps:['朗读歌词体会奉献意义','分声部学唱','声部合练','处理庄严氛围','力度和音色调整','完整演唱'] }
    ]
  },
  // ========== Q2: 4-6月 十字架的恩典 ==========
  {
    id:'Q2', label:'第二季度', theme:'十字架的恩典', months:'4-6月',
    songs: [
      { id:'S09', title:'十架的爱', en:'Love of the Cross', key:'E♭大调', meter:'4/4', tempo:'♩=72', range:'B♭3-F5', diff:'★★★', voicing:'SATB',
        focus:['深沉表达','和声色彩','力度控制'], tips:['前段沉思内省','中段逐渐激动','副歌高潮要饱满','结尾回归平静'], rehearsalSteps:['安静读歌词感受意义','哼鸣旋律（弱音练习）','分声部学唱','合排处理情感层次','力度渐变练习','完整演唱'] },
      { id:'S10', title:'颂赞主权之羔羊', en:'Worthy is the Lamb', key:'G大调', meter:'4/4', tempo:'♩=100', range:'D4-G5', diff:'★★★', voicing:'SATB',
        focus:['雄壮感','节奏力量','声部平衡'], tips:['男声进入要有力量','和声节奏要对齐','尾声渐强到ff'], rehearsalSteps:['听范唱感受雄壮风格','打节拍练节奏','分声部学唱','合排注意对齐','处理力度层次','完整演唱'] },
      { id:'S11', title:'耶稣恩友', en:'What a Friend We Have in Jesus', key:'F大调', meter:'3/4', tempo:'♩=76', range:'C4-E5', diff:'★', voicing:'SATB',
        focus:['温暖音色','情感真挚','三拍韵律'], tips:['旋律线条连贯','三拍子不要赶','副歌加强信心'], rehearsalSteps:['哼鸣练习连贯气息','分声部学唱','合排注意三拍韵律','处理温暖音色','完整演唱'] },
      { id:'S12', title:'宝架清影', en:'Near the Cross', key:'G大调', meter:'4/4', tempo:'♩=68', range:'D4-D5', diff:'★★', voicing:'SATB',
        focus:['安宁感','弱音控制','和声纯净'], tips:['整体力度偏弱(p-mp)','和声要干净','结尾极弱收束'], rehearsalSteps:['弱音练习','分声部学唱','合唱弱音练习','处理和声纯净度','完整演唱'] },
      { id:'S13', title:'仰望十架', en:'Looking at the Cross', key:'A小调', meter:'4/4', tempo:'♩=80', range:'A3-F5', diff:'★★★', voicing:'SATB',
        focus:['小调色彩','半音音准','转调处理'], tips:['小调段落要忧郁深沉','转大调时明亮起来','半音程音准要精确'], rehearsalSteps:['听辨小调和大调色彩','分声部学唱（重点练习转调段）','合排处理调性转换','音准微调','完整演唱'] },
      { id:'S14', title:'靠主膀臂', en:'Leaning on the Everlasting Arms', key:'G大调', meter:'3/4', tempo:'♩=112', range:'D4-E5', diff:'★★', voicing:'SATB',
        focus:['轻快活泼','三拍跳跃','信心喜乐'], tips:['三拍子要有摇摆感','副歌要喜乐','不要拖沓'], rehearsalSteps:['三拍子律动练习','分声部学唱','合排注意节奏弹性','处理喜乐氛围','完整演唱'] },
      { id:'S15', title:'活出基督', en:'Live Out Christ', key:'C大调', meter:'4/4', tempo:'♩=92', range:'G4-F5', diff:'★★★', voicing:'SATB',
        focus:['力量感','咬字有力','和声饱满'], tips:['每个字要清晰有力','节奏坚定','副歌是全曲核心'], rehearsalSteps:['朗读歌词强调咬字','分声部学唱','合排处理咬字','力度和音色调整','完整演唱'] },
      { id:'S16', title:'赞美主', en:'Praise the Lord', key:'D大调', meter:'4/4', tempo:'♩=120', range:'A3-G5', diff:'★★★', voicing:'SATB',
        focus:['欢快热烈','快速咬字','声部穿透力'], tips:['速度较快咬字要清晰','各声部要保持穿透力','尾声辉煌'], rehearsalSteps:['快速朗读歌词','分声部学唱（注意速度）','慢速合排','逐步加速到原速','处理力度','完整演唱'] }
    ]
  },
  // ========== Q3: 7-9月 圣灵的火 ==========
  {
    id:'Q3', label:'第三季度', theme:'圣灵的火', months:'7-9月',
    songs: [
      { id:'S17', title:'圣灵请你来', en:'Come Holy Spirit', key:'A♭大调', meter:'4/4', tempo:'♩=76', range:'E♭4-F5', diff:'★★★', voicing:'SATB',
        focus:['祈祷语气','渐强层次','圣灵降临感'], tips:['开始安静如祷告','中段渐强如圣灵降临','结尾充满力量'], rehearsalSteps:['安静默祷读歌词','哼鸣练习','分声部学唱','合排处理渐强层次','力度和音色调整','完整演唱'] },
      { id:'S18', title:'恩典之路', en:'Path of Grace', key:'G大调', meter:'4/4', tempo:'♩=84', range:'D4-F5', diff:'★★', voicing:'SATB',
        focus:['抒情旋律','叙事感','感恩表达'], tips:['像讲故事一样唱','情感自然递进','结尾充满感恩'], rehearsalSteps:['朗读歌词感受叙事','哼鸣旋律','分声部学唱','合排处理叙事语气','完整演唱'] },
      { id:'S19', title:'神的应许永不落空', en:'God\'s Promises Never Fail', key:'F大调', meter:'4/4', tempo:'♩=92', range:'C4-G5', diff:'★★★', voicing:'SATB',
        focus:['坚定信心','和声力度','渐强处理'], tips:['男声要坚定有力','副歌是信心宣言','多次渐强要有层次'], rehearsalSteps:['信心宣告式朗读歌词','分声部学唱','合排处理力度','重点练习渐强段','完整演唱'] },
      { id:'S20', title:'一切歌颂赞美', en:'All Praise and Worship', key:'E大调', meter:'4/4', tempo:'♩=108', range:'B3-F#5', diff:'★★★', voicing:'SATB',
        focus:['明亮音色','快速音程','节奏弹性'], tips:['E大调要唱得明亮','快速音程要清晰','节奏要有弹性'], rehearsalSteps:['明亮音色练声','分声部学唱（重点快速段）','合排慢速→原速','处理节奏弹性','完整演唱'] },
      { id:'S21', title:'差遣我', en:'Send Me', key:'D小调', meter:'3/4', tempo:'♩=80', range:'A3-F5', diff:'★★★', voicing:'SATB',
        focus:['使命感','小调大调转换','力量爆发'], tips:['开始安静深思','中段小调忧郁','结尾大调充满力量'], rehearsalSteps:['读歌词感受使命呼召','分声部学唱（注意调性转换）','合排处理调性变化','力度爆发练习','完整演唱'] },
      { id:'S22', title:'耶和华祝福满满', en:'Jehovah\'s Blessings', key:'C大调', meter:'4/4', tempo:'♩=100', range:'G4-G5', diff:'★★', voicing:'SATB',
        focus:['喜乐感恩','节奏统一','欢快表达'], tips:['节奏要整齐划一','副歌要喜乐','各声部要平衡'], rehearsalSteps:['打节拍统一律动','分声部学唱','合排统一节奏','处理喜乐氛围','完整演唱'] },
      { id:'S23', title:'磐石耶稣', en:'Jesus the Rock', key:'B♭大调', meter:'4/4', tempo:'♩=88', range:'F4-G5', diff:'★★', voicing:'SATB',
        focus:['坚定稳定','中音区音色','和声温暖'], tips:['中音区要温暖饱满','节奏要稳如磐石','副歌要坚定有力'], rehearsalSteps:['中音区发声练习','分声部学唱','合排处理稳定性','音色调整','完整演唱'] },
      { id:'S24', title:'荣耀归主名', en:'Glory to His Name', key:'G大调', meter:'4/4', tempo:'♩=104', range:'D4-G5', diff:'★★★', voicing:'SATB',
        focus:['辉煌感','声部力量','尾声处理'], tips:['开始庄严','副歌辉煌','尾声壮丽收束'], rehearsalSteps:['庄严发声练习','分声部学唱','合排处理辉煌感','尾声重点打磨','完整演唱'] }
    ]
  },
  // ========== Q4: 10-12月 道成肉身·圣诞·年终 ==========
  {
    id:'Q4', label:'第四季度', theme:'道成肉身·圣诞赞美', months:'10-12月',
    songs: [
      { id:'S25', title:'平安夜', en:'Silent Night', key:'C大调', meter:'6/8', tempo:'♩=56', range:'G4-E5', diff:'★', voicing:'SATB',
        focus:['柔和6/8拍','宁静氛围','三声部和谐'], tips:['6/8拍要流动','力度始终柔和','像摇篮曲一样'], rehearsalSteps:['6/8拍律动练习','哼鸣旋律感受宁静','分声部学唱','合排处理柔和音色','完整演唱'] },
      { id:'S26', title:'普世欢腾', en:'Joy to the World', key:'D大调', meter:'4/4', tempo:'♩=112', range:'A3-F#5', diff:'★★', voicing:'SATB',
        focus:['欢快节奏','力量感','和声饱满'], tips:['节奏跳跃有力','副歌要辉煌','各声部要充满力量'], rehearsalSteps:['跳跃式练声','分声部学唱','合排处理力量','力度调整','完整演唱'] },
      { id:'S27', title:'马槽歌', en:'Away in a Manger', key:'F大调', meter:'3/4', tempo:'♩=68', range:'C4-E5', diff:'★', voicing:'SATB',
        focus:['摇篮曲风格','极弱控制','温柔音色'], tips:['力度mp-pp','音色如天使般温柔','三拍子流动'], rehearsalSteps:['极弱发声练习','分声部学唱','合排处理极弱控制','音色统一','完整演唱'] },
      { id:'S28', title:'新生王歌', en:'Hark! The Herald Angels Sing', key:'G大调', meter:'4/4', tempo:'♩=108', range:'D4-G5', diff:'★★★', voicing:'SATB',
        focus:['快节奏准确','和声层次','节日气氛'], tips:['速度较快咬字要清晰','和声层次丰富','充满天使般的喜乐'], rehearsalSteps:['快速咬字练习','分声部学唱','慢速合排','加速到原速','处理和声层次','完整演唱'] },
      { id:'S29', title:'听啊天使高声唱', en:'Angels We Have Heard on High', key:'G大调', meter:'4/4', tempo:'♩=104', range:'D4-F5', diff:'★★', voicing:'SATB',
        focus:['副歌Gloria段落','华丽和声','跳跃节奏'], tips:['副歌Gloria要辉煌','段落衔接要流畅','结束段要壮丽'], rehearsalSteps:['副歌Gloria段落单独练习','分声部学唱','段落衔接练习','合排处理辉煌段','完整演唱'] },
      { id:'S30', title:'荣耀归于真神', en:'To God Be the Glory', key:'G大调', meter:'4/4', tempo:'♩=100', range:'D4-G5', diff:'★★', voicing:'SATB',
        focus:['坚定赞美','节奏稳健','和声饱满'], tips:['节奏稳健不赶','副歌要气势','男声要沉稳'], rehearsalSteps:['稳健节拍练习','分声部学唱','合排统一节奏','处理气势','完整演唱'] },
      { id:'S31', title:'诸天诉说', en:'The Heavens Declare', key:'F大调', meter:'3/4', tempo:'♩=80', range:'C4-F5', diff:'★★★', voicing:'SATB',
        focus:['宏大感','和声色彩变化','力度层次'], tips:['前段安静如冥想','中段渐强','副歌宏大壮丽'], rehearsalSteps:['安静冥想式发声','分声部学唱','合排处理力度层次','音色和色彩变化','完整演唱'] },
      { id:'S32', title:'一路引导', en:'Lead, Kindly Light', key:'G大调', meter:'4/4', tempo:'♩=72', range:'D4-F5', diff:'★★', voicing:'SATB',
        focus:['温暖安慰','乐句呼吸','声部融合'], tips:['温暖柔和的音色','呼吸点一致','结尾充满盼望'], rehearsalSteps:['呼吸练习','分声部学唱','声部融合练习','处理温暖音色','完整演唱'] }
    ]
  }
];

// ============================================================
//  年度曲目库（指挥后台上传，可覆盖内置默认曲目）
//  存储：localStorage['choir_repertoire'] = { Q1:[{name,key,meter,type,diff}], ... }
// ============================================================
function loadRepertoire() {
  try {
    if (typeof localStorage === 'undefined') return null;
    const r = JSON.parse(localStorage.getItem('choir_repertoire') || 'null');
    if (!r || typeof r !== 'object') return null;
    const has = ['Q1','Q2','Q3','Q4'].some(q => Array.isArray(r[q]) && r[q].length);
    return has ? r : null;
  } catch (e) { return null; }
}
function placeholderSong(qi, i) {
  return { id: 'U' + (qi+1) + String(i+1).padStart(2,'0'), title:'待指挥上传曲目', en:'', key:'', meter:'4/4', tempo:'', range:'', diff:'★★', voicing:'SATB', focus:['待上传曲目'], tips:[], rehearsalSteps:['等待指挥上传曲目后安排排练','可先复习已上传曲目','完整演唱一遍'] };
}
function buildQuarters() {
  const repo = loadRepertoire();
  if (!repo) return DEFAULT_QUARTERS;
  return DEFAULT_QUARTERS.map((q, qi) => {
    const songs = (repo[q.id] || []).map((s, i) => ({
      id: 'U' + (qi+1) + String(i+1).padStart(2,'0'),
      title: (s.name || '').trim() || ('曲目' + (i+1)),
      en: '', key: s.key || '', meter: s.meter || '4/4', tempo: s.tempo || '',
      range: '', diff: s.diff || '★★', voicing: 'SATB',
      focus: s.type ? [s.type] : ['赞美诗'],
      tips: [], rehearsalSteps: ['听范唱/示范音频 1 遍，感受风格','分声部学唱旋律','合排（慢速→原速）','处理力度与表情','完整演唱']
    }));
    return { id: q.id, label: q.label, theme: q.theme, months: q.months, songs: songs.length ? songs : [placeholderSong(qi, 0)] };
  });
}
const QUARTERS = buildQuarters();

// ============================================================
//  48周灵修经文（每周：经文 / 分享要点 / 配合诗歌 / 祷告）
// ============================================================
const DEVOTIONS = [
  // Q1 (1-12周) 新年新恩典
  { w:1, verse:'耶利米哀歌 3:22-23', text:'我们不至消灭，是出于耶和华诸般的慈爱，是因他的怜悯不至断绝。每早晨这都是新的，你的诚实极其广大。', theme:'新年新恩典', prayer:'为新年开始感恩，求神带领全年排练与事奉',
    sharing:['神以怜悯开启新一年，每天都是新的开始','数算过去一年的恩典，用感恩的心开始新事奉','立定心志：每次排练都当作敬拜来献上'], song:'奇异恩典' },
  { w:2, verse:'马太福音 2:11', text:'进了房子，看见小孩子和他母亲马利亚，就俯伏拜那小孩子，揭开宝盒，拿黄金、乳香、没药为礼物献给他。', theme:'献上礼物', prayer:'求神悦纳我们以歌声献上的礼物',
    sharing:['三博士献上最好的礼物，我们也当献上最好的歌声','敬拜的核心是把心归给神，不只是声音','献唱前先省察自己的心是否预备好'], song:'荣耀归于真神' },
  { w:3, verse:'诗篇 100:1-2', text:'普天下当向耶和华欢呼。你们当乐意事奉耶和华，当来向他歌唱。', theme:'乐意事奉', prayer:'求神赐我们喜乐的心来事奉歌唱',
    sharing:['事奉神应当是乐意的，不是勉强','歌唱是向神欢呼的一种方式','带着喜乐排练，歌声才有感染力'], song:'一切歌颂赞美' },
  { w:4, verse:'歌罗西书 3:16', text:'当用各样的智慧，把基督的道理丰丰富富地存在心里，用诗章、颂词、灵歌，彼此教导，互相劝戒，心被恩感，歌颂神。', theme:'心被恩感歌颂神', prayer:'求神让基督的道理充满我们，使歌声发自内心',
    sharing:['诗班的首要任务是把真理存在心里','彼此教导劝戒，一起成长','心被恩感，歌声才有生命'], song:'我知谁掌管明天' },
  { w:5, verse:'以赛亚书 40:31', text:'但那等候耶和华的，必从新得力，他们必如鹰展翅上腾，他们奔跑却不困倦，行走却不疲乏。', theme:'如鹰展翅', prayer:'求神赐力量，使我们在事奉中重新得力',
    sharing:['等候神的人必重新得力','如鹰展翅：靠神超越环境的限制','疲惫时回到神面前，他是力量的源头'], song:'如鹰展翅上腾' },
  { w:6, verse:'诗篇 22:3', text:'但你是圣洁的，是用以色列的赞美为宝座的。', theme:'以赞美为宝座', prayer:'求神的宝座在我们赞美中降临',
    sharing:['神以他子民的赞美为宝座','赞美不是表演，而是迎接神的同在','每次献唱都宣告神的掌权'], song:'祢是荣耀君王' },
  { w:7, verse:'约翰福音 3:16', text:'神爱世人，甚至将他的独生子赐给他们，叫一切信他的，不至灭亡，反得永生。', theme:'神爱世人', prayer:'为未信主的家人朋友祷告，愿歌声传递神的爱',
    sharing:['神爱的广度：爱世人','神爱的深度：赐下独生子','献唱是传递神爱的管道'], song:'耶稣爱你' },
  { w:8, verse:'诗篇 42:1', text:'神啊，我的心切慕你，如鹿切慕溪水。', theme:'切慕神', prayer:'求神挑旺我们对他的渴慕',
    sharing:['鹿渴慕溪水，我们的心当渴慕神','排练之余要亲近神，不只是练声','灵修是诗班事奉的地基'], song:'赞美之泉' },
  { w:9, verse:'罗马书 12:1', text:'所以弟兄们，我以神的慈悲劝你们，将身体献上，当作活祭，是圣洁的，是神所喜悦的，你们如此事奉乃是理所当然的。', theme:'活祭的事奉', prayer:'求神悦纳我们将自己当作活祭献上',
    sharing:['事奉是把自己献上，不只是献唱','活祭是每天持续的摆上','圣洁与顺服是事奉的根基'], song:'一生的奉献' },
  { w:10, verse:'诗篇 96:1-2', text:'你们要向耶和华唱新歌，全地都要向耶和华歌唱。要向耶和华歌唱，称颂他的名，天天传扬他的救恩。', theme:'唱新歌', prayer:'求神赐我们新的灵感和热情歌唱',
    sharing:['向神唱新歌：每一次都以新心献上','天天传扬他的救恩：见证在歌声里','复习旧歌也要当作新歌来唱'], song:'诸天诉说' },
  { w:11, verse:'诗篇 150:1-2', text:'你们要赞美耶和华，在神的圣所赞美他，在他显能力的穹苍赞美他。要因他大能的作为赞美他，按着他极美的大德赞美他。', theme:'赞美会—全人赞美', prayer:'为季度赞美会祷告，用全人全心赞美神',
    sharing:['赞美的地点：圣所与穹苍','赞美的方式：因大能的作为与极美的大德','赞美会是将一年颂赞推向高潮'], song:'赞美之泉' },
  { w:12, verse:'诗篇 150:6', text:'凡有气息的都要赞美耶和华，你们要赞美耶和华。', theme:'赞美会—凡有气息都要赞美', prayer:'赞美会感恩结束，愿一切有气息的都赞美神',
    sharing:['赞美是受造之物的本分','季度赞美会是恩典的高峰','把赞美带回家中，让敬拜延续'], song:'一生奉献' },
  // Q2 (13-24周) 十字架的恩典
  { w:13, verse:'罗马书 5:8', text:'惟有基督在我们还作罪人的时候为我们死，神的爱就在此向我们显明了。', theme:'十架的爱', prayer:'思想十架的大爱，以感恩的心开始新季度',
    sharing:['在我们还作罪人时，基督就为我们死','十架之爱是无条件的爱','献唱《十架的爱》前先默想十架'], song:'十架的爱' },
  { w:14, verse:'启示录 5:12', text:'大声说，曾被杀的羔羊，是配得能力、丰富、智慧、能力、尊贵、荣耀、颂赞的。', theme:'羔羊配得', prayer:'愿颂赞归于坐宝座的羔羊',
    sharing:['基督复活升天，配得一切颂赞','敬拜的中心是羔羊耶稣','献唱是向羔羊献上的尊荣'], song:'颂赞主权之羔羊' },
  { w:15, verse:'约翰福音 15:13', text:'人为朋友舍命，人的爱心没有比这个大的。', theme:'为朋友舍命', prayer:'为耶稣这位最知心的朋友感恩',
    sharing:['耶稣称我们为朋友','舍命之爱是爱的极致','以歌回应这位良友的爱'], song:'耶稣恩友' },
  { w:16, verse:'马太福音 27:46', text:'约在申初，耶稣大声喊着说，以利，以利，拉马撒巴各大尼？就是说，我的神，我的神，为什么离弃我。', theme:'十架七言—被离弃', prayer:'默想十架，体会救恩的代价',
    sharing:['耶稣为我们承担了与神隔绝的痛苦','十架的痛楚我们无法完全体会','因此救恩何其宝贵'], song:'宝架清影' },
  { w:17, verse:'希伯来书 12:2', text:'仰望为我们信心创始成终的耶稣，他因那摆在前面的喜乐，就轻看羞辱，忍受了十字架的苦难，便坐在神宝座的右边。', theme:'仰望十架', prayer:'求神让我们单单仰望耶稣，轻看难处',
    sharing:['耶稣因摆在前面的喜乐忍受十架','我们仰望他，就能奔跑前路','小调中也有盼望，苦难后有荣耀'], song:'仰望十架' },
  { w:18, verse:'申命记 33:27', text:'永生的神是你的居所，他永久的膀臂在你以下。', theme:'靠主膀臂', prayer:'求神以永久的膀臂扶持我们',
    sharing:['神是我们永久的居所','他的膀臂在我们以下托住我们','唱喜乐诗歌，信心要喜乐'], song:'靠主膀臂' },
  { w:19, verse:'加拉太书 2:20', text:'我已经与基督同钉十字架，现在活着的不再是我，乃是基督在我里面活着。', theme:'活出基督', prayer:'求基督在我们生命中活出来',
    sharing:['旧我已与基督同钉','如今是基督在我里面活着','歌唱的生命要能见证基督'], song:'活出基督' },
  { w:20, verse:'诗篇 150:3', text:'要用角声赞美他，鼓瑟弹琴赞美他。', theme:'用乐器赞美', prayer:'为乐器和人声的配合祷告，一切赞美归神',
    sharing:['赞美可以用各样乐器','人声是最美的乐器','全乐队与诗班合一赞美'], song:'赞美主' },
  { w:21, verse:'腓立比书 4:4', text:'你们要靠主常常喜乐，我再说，你们要喜乐。', theme:'靠主喜乐', prayer:'求神赐下属天的喜乐，胜过环境',
    sharing:['喜乐不是靠环境，而是靠主','即使艰难也要常常喜乐','喜乐的歌声能感染会众'], song:'喜乐泉源' },
  { w:22, verse:'以弗所书 5:19', text:'当用诗章、颂词、灵歌彼此对说，口唱心和地赞美主。', theme:'口唱心和', prayer:'求神让我们口唱心和地赞美',
    sharing:['赞美要口唱心和，内外一致','诗章颂词灵歌彼此对说','诗班要成为会众赞美的带领'], song:'赞美之泉' },
  { w:23, verse:'腓立比书 2:10-11', text:'叫一切在天上的、地上的和地底下的，因耶稣的名无不屈膝，无不口称耶稣基督为主。', theme:'赞美会—基督为王', prayer:'为季度赞美会祷告，愿基督在赞美中被高举',
    sharing:['万膝要跪拜，万口要承认','基督是万王之王','赞美会宣告基督的掌权'], song:'荣耀归主名' },
  { w:24, verse:'启示录 5:13', text:'我又听见在天上、地上、地底下、沧海里和天地间一切所有被造之物都说，但愿颂赞、尊贵、荣耀、权势，都归给坐宝座的和羔羊，直到永永远远。', theme:'赞美会—颂赞归给坐宝座的', prayer:'赞美会感恩结束，愿颂赞归给坐宝座的和羔羊',
    sharing:['宇宙万物都在颂赞神','我们加入永恒的敬拜行列','让赞美会延续到生活中'], song:'颂赞主权之羔羊' },
  // Q3 (25-36周) 圣灵的火
  { w:25, verse:'使徒行传 2:4', text:'他们就都被圣灵充满，按着圣灵所赐的口才说起别国的话来。', theme:'圣灵降临', prayer:'求圣灵充满我们的排练和事奉',
    sharing:['圣灵降临带来能力与恩赐','祷告等候圣灵的工作','排练前求圣灵预备每个人的心'], song:'圣灵请你来' },
  { w:26, verse:'加拉太书 5:22-23', text:'圣灵所结的果子，就是仁爱、喜乐、和平、忍耐、恩慈、良善、信实、温柔、节制。', theme:'圣灵的果子', prayer:'求圣灵在我们生命中结出果子',
    sharing:['圣灵的果子是生命的流露','诗班成员当彼此相爱包容','先有生命的果子，再有声音的果子'], song:'圣灵请你来' },
  { w:27, verse:'哥林多前书 12:7', text:'圣灵显在各人身上，是叫人得益处。', theme:'圣灵的恩赐', prayer:'为诗班每个人的恩赐感恩，求主使用',
    sharing:['圣灵赐下不同恩赐，彼此配搭','每一个声部都是肢体的一部分','用恩赐服事，叫众人得益处'], song:'恩典之路' },
  { w:28, verse:'罗马书 12:11', text:'殷勤不可懒惰，要心里火热，常常服事主。', theme:'火热服事', prayer:'求神点燃我们的热心，不冷淡不退后',
    sharing:['殷勤不可懒惰：勤于练声练谱','心里火热：保持事奉的热忱','常常服事主：坚持到底不放弃'], song:'火热的心' },
  { w:29, verse:'以赛亚书 6:8', text:'我又听见主的声音说，我可以差遣谁呢？谁肯为我们去呢？我说，我在这里，请差遣我。', theme:'使命与呼召', prayer:'回应神的呼召，愿意被主差遣',
    sharing:['神寻找愿意被差遣的人','歌唱是回应呼召的方式之一','献唱也是宣教，用歌声传福音'], song:'差遣我' },
  { w:30, verse:'马太福音 18:20', text:'因为无论在哪里，有两三个人奉我的名聚会，那里就有我在他们中间。', theme:'同在的应许', prayer:'感谢神在排练中与我们同在',
    sharing:['奉主名聚会，主就在中间','排练也是聚会，主与我们同在','彼此和睦，主的同在更真实'], song:'耶和华祝福满满' },
  { w:31, verse:'约书亚记 1:9', text:'你当刚强壮胆，不要惧怕，也不要惊惶，因为你无论往哪里去，耶和华你的神必与你同在。', theme:'刚强壮胆', prayer:'为信心软弱的时候祷告，求神赐勇气',
    sharing:['刚强壮胆来自神的应许','不惧怕不惊惶，因神同在','胆怯时默想神的信实'], song:'磐石耶稣' },
  { w:32, verse:'诗篇 46:1', text:'神是我们的避难所，是我们的力量，是我们在患难中随时的帮助。', theme:'避难所', prayer:'为有需要的弟兄姊妹祷告，神是避难所',
    sharing:['神是避难所、力量、随时的帮助','患难中随时可求告神','诗班要成为彼此扶持的群体'], song:'磐石耶稣' },
  { w:33, verse:'耶利米书 29:11', text:'耶和华说，我知道我向你们所怀的意念是赐平安的意念，不是降灾祸的意念，要叫你们末后有指望。', theme:'赐平安的意念', prayer:'为未来仰望神的计划，充满盼望',
    sharing:['神向我们所怀的是赐平安的意念','他对我们有美好的计划','以信心面对未来，满有指望'], song:'我知谁掌管明天' },
  { w:34, verse:'以弗所书 3:20', text:'神能照着运行在我们心里的大力，充充足足地成就一切，超过我们所求所想的。', theme:'超过所求所想', prayer:'为神的丰盛感恩，相信他能成就奇事',
    sharing:['神能充充足足成就一切','超过我们所求所想','把诗班的需要带到神面前'], song:'恩典之路' },
  { w:35, verse:'诗篇 47:1', text:'万民哪，你们都要拍掌，要用夸胜的声音向神呼喊。', theme:'赞美会—欢呼赞美', prayer:'为季度赞美会祷告，以喜乐欢呼赞美神',
    sharing:['拍掌与呼喊是喜乐赞美的表达','以夸胜的声音宣告神的得胜','赞美会让会众一同欢呼'], song:'荣耀归主名' },
  { w:36, verse:'诗篇 47:6-7', text:'你们要歌颂，用知识歌颂，因为耶和华是至高的神，是全地的大君王。', theme:'赞美会—至高神', prayer:'赞美会感恩结束，颂赞至高的神',
    sharing:['歌颂要用知识与悟性','神是至高的神、全地的大君王','以敬畏的心献上最好的歌颂'], song:'祢是荣耀君王' },
  // Q4 (37-48周) 道成肉身·圣诞·年终
  { w:37, verse:'以赛亚书 7:14', text:'因此，主自己要给你们一个兆头，必有童女怀孕生子，给他起名叫以马内利。', theme:'以马内利预言', prayer:'为圣诞季节预备心灵',
    sharing:['以马内利：神与我们同在','预言在耶稣降生时成就','圣诞的意义是神同在'], song:'以马内利来临歌' },
  { w:38, verse:'路加福音 1:28', text:'天使进去，对她说，蒙大恩的女子，我问你安，主和你同在了。', theme:'主的问安', prayer:'为圣诞演出祷告，愿平安临到',
    sharing:['主与马利亚同在，也与相信的人同在','蒙恩不是因自己，而是因主的拣选','以谦卑的心回应主的同在'], song:'平安夜' },
  { w:39, verse:'路加福音 2:10', text:'那天使对他们说，不要惧怕，我报给你们大喜的信息，是关乎万民的。', theme:'大喜信息', prayer:'思想福音的大喜，在歌声中传扬',
    sharing:['福音是大喜的信息','关乎万民：普世都需要救主','先经历大喜，才能传扬大喜'], song:'普世欢腾' },
  { w:40, verse:'路加福音 2:14', text:'在至高之处荣耀归与神，在地上平安归与他所喜悦的人。', theme:'荣耀与平安', prayer:'求神的荣耀降临，平安充满教会',
    sharing:['天使的颂歌：荣耀归神、平安归人','圣诞诗歌是天上的敬拜','把荣耀归给神，把平安带给世人'], song:'马槽歌' },
  { w:41, verse:'弥迦书 5:2', text:'伯利恒以法他啊，你在犹大诸城中为小，将来必有一位从你那里出来，在以色列中为我作掌权的。', theme:'伯利恒之星', prayer:'为圣诞演出中每位参与者祷告',
    sharing:['神使用微小的地方成就大事','救主从伯利恒出来','谦卑是神作工的土壤'], song:'新生王歌' },
  { w:42, verse:'约翰福音 1:14', text:'道成了肉身，住在我们中间，充充满满地有恩典有真理。', theme:'道成肉身', prayer:'思想道成肉身的奥秘，充满感恩',
    sharing:['道成了肉身：神亲自来到人间','住在我们中间：恩典与真理的充满','圣诞的核心是神成为人'], song:'听啊天使高声唱' },
  { w:43, verse:'以赛亚书 9:6', text:'因有一婴孩为我们而生，有一子赐给我们，政权必担在他的肩头上。他名称为奇妙策士、全能的神、永在的父、和平的君。', theme:'奇妙策士和平之君', prayer:'为圣诞赞美会准备，颂赞奇妙策士',
    sharing:['有一婴孩为我们而生','他的名：奇妙策士、全能的神、永在的父、和平的君','以歌颂迎接这位君王'], song:'荣耀归于真神' },
  { w:44, verse:'路加福音 2:20', text:'牧羊的人回去了，因所听见所看见的一切事，正如天使向他们说的，就荣耀神、赞美他。', theme:'牧羊人的见证', prayer:'求神让我们像牧羊人一样去见证传扬',
    sharing:['牧羊人亲身经历就回去传扬','看见听见就荣耀赞美神','圣诞的喜乐要带出去分享'], song:'新生王歌' },
  { w:45, verse:'马太福音 2:11', text:'进了房子，看见小孩子和他母亲马利亚，就俯伏拜那小孩子，揭开宝盒，拿黄金、乳香、没药为礼物献给他。', theme:'献上礼物', prayer:'为圣诞赞美会祷告，献上我们最好的赞美',
    sharing:['三博士献上珍贵的礼物','我们以歌声为礼物献给耶稣','最好的礼物是把心献上'], song:'平安夜' },
  { w:46, verse:'启示录 12:10', text:'我听见天上有大声音说，我们神的救恩、能力、国度、并他基督的权柄，现在都来到了。', theme:'圣诞赞美会—权柄荣耀', prayer:'圣诞赞美会感恩结束，颂赞基督的权柄',
    sharing:['救恩、能力、国度、权柄都属于基督','圣诞赞美会把救恩的信息传开','以权柄荣耀的颂歌结束圣诞季'], song:'普世欢腾' },
  { w:47, verse:'诗篇 90:12', text:'求你指教我们怎样数算自己的日子，好叫我们得着智慧的心。', theme:'数算日子', prayer:'为年终回顾祷告，感恩神的恩典',
    sharing:['数算日子：回头看一年的恩典','得着智慧的心：以永恒眼光生活','年终是感恩与省察的时刻'], song:'我知谁掌管明天' },
  { w:48, verse:'启示录 5:13', text:'但愿颂赞、尊贵、荣耀、权势，都归给坐宝座的和羔羊，直到永永远远。', theme:'年终赞美会—永恒的赞美', prayer:'年终感恩，愿永恒的赞美从我们心中涌出',
    sharing:['颂赞、尊贵、荣耀、权势都当归给神','直到永永远远：敬拜是永恒的','以感恩结束一年，以盼望迎接新年'], song:'荣耀归主名' }
];

// ---- 诗班排练总要求 ----
const REHEARSAL_RULES = [
  { icon:'fa-clock', title:'准时到场', desc:'提前10分钟到达排练室，签到打卡后自行练声预热；迟到需向指挥说明并补打卡' },
  { icon:'fa-book', title:'带齐谱面', desc:'每次排练携带歌谱文件夹与铅笔，随指挥标注强弱、呼吸、声部记号' },
  { icon:'fa-bell-slash', title:'手机静音', desc:'排练期间手机调至静音，不在排练中接打电话或查看消息' },
  { icon:'fa-ear-listen', title:'专注聆听', desc:'指挥讲解时安静聆听，不交头接耳；有问题举手示意' },
  { icon:'fa-users', title:'声部责任', desc:'各声部声部长负责本声部音准节奏，排练前完成本声部作业' },
  { icon:'fa-water', title:'保护嗓音', desc:'排练前不喝冷饮、不吃辛辣，随身带温水；嗓音不适及时告知' },
  { icon:'fa-shirt', title:'献唱仪容', desc:'献唱当天统一着装，提前30分钟到场走台，检查仪态与队形' },
  { icon:'fa-heart', title:'以爱相待', desc:'彼此鼓励不批评，新人多帮助；事奉的动机是爱神爱人' }
];

// ---- 在家练习总要求 ----
const HOME_RULES = [
  { icon:'fa-calendar-check', title:'每周至少3次', desc:'每周在家练习至少3次，每次30-40分钟；献唱前一周每天练习' },
  { icon:'fa-metronome', title:'节拍器跟练', desc:'用节拍器从慢速（50%）开始，逐步加快到原速；节奏不稳不加速' },
  { icon:'fa-microphone', title:'录音自检', desc:'每次练习用手机录音回听，重点检查音准、节奏、咬字，写自我评价' },
  { icon:'fa-file-audio', title:'跟音频练唱', desc:'按指挥上传的范唱/伴奏音频分声部跟唱，先哼鸣再唱词' },
  { icon:'fa-book-open', title:'读谱背词', desc:'先识谱再唱歌词，献唱曲目要求背谱背词，歌词烂熟于心' },
  { icon:'fa-star', title:'打卡记录', desc:'每次在家练习后在「练习打卡」中打卡，记录练习时长与内容' }
];

// ---- 练声曲库（12首，每周轮换，附简谱） ----
const VOCALISE = [
  { id:'V01', title:'哼鸣长音练习（渐强渐弱）', key:'C调', meter:'4/4', tempo:'♩=60', vowel:'哼鸣 m',
    jianpu:['1 - - - | 3 - - - | 5 - - - | 3 - - - | 1 - - - ‖'],
    method:'用哼鸣从弱到强再到弱，气息平稳，口腔放松如含半口水', target:'气息控制、头声位置、弱起强收' },
  { id:'V02', title:'五度音阶连音练习（Lu）', key:'C调', meter:'4/4', tempo:'♩=72', vowel:'Lu',
    jianpu:['1 2 3 4 5 | 5 4 3 2 1 | 1 2 3 4 5 | 1 - - - ‖'],
    method:'连音圆滑，一字一音不换气；上行想象气息下沉，下行保持位置', target:'音阶连贯、声区统一' },
  { id:'V03', title:'琶音练习（a-e-i-o-u）', key:'C调', meter:'4/4', tempo:'♩=66', vowel:'a e i o u',
    jianpu:['1 3 5 1\' | 1\' 5 3 1 | 5 3 1 5 | 1 - - - ‖'],
    method:'每个元音清晰转换，舌位稳定；高音保持口腔打开', target:'元音统一、琶音音准' },
  { id:'V04', title:'跳音练习（Ha）', key:'C调', meter:'4/4', tempo:'♩=88', vowel:'Ha',
    jianpu:['1 3 5 1\' | 5 3 1 5 | 1 3 5 1\' | 1 - - - ‖'],
    method:'横膈膜弹跳发声，短促有力有颗粒感，不压喉', target:'跳音弹性、横膈膜力量' },
  { id:'V05', title:'三度音程练习（mi-re-do）', key:'C调', meter:'4/4', tempo:'♩=76', vowel:'Mi Re Do',
    jianpu:['1 3 2 4 | 3 5 4 6 | 5 4 3 2 | 1 - - - ‖'],
    method:'三度逐级上下行，注意半音关系，气息连贯不断', target:'三度音程、级进音准' },
  { id:'V06', title:'八度跳跃练习（do-do\'）', key:'C调', meter:'4/4', tempo:'♩=60', vowel:'A',
    jianpu:['1 - 1\' - | 1\' - 1 - | 5 - 3 - | 1 - - - ‖'],
    method:'八度跳跃弱→强→弱，高音提前准备气息，不喊不压', target:'八度音准、高低音区统一' },
  { id:'V07', title:'附点节奏练声（Ma）', key:'C调', meter:'4/4', tempo:'♩=84', vowel:'Ma',
    jianpu:['1·2 3 3 | 5·3 1 1 | 2·7 5 5 | 1 - - - ‖'],
    method:'附点节奏准确，短音轻巧；注意附点后音符不赶', target:'附点节奏、节奏稳定性' },
  { id:'V08', title:'切分节奏练声（La）', key:'C调', meter:'4/4', tempo:'♩=80', vowel:'La',
    jianpu:['1 . 3 5 | 5 . 3 1 | 2 . 7 5 | 1 - - - ‖'],
    method:'切分音重音在中间，拍子稳定，强弱分明', target:'切分节奏、重音控制' },
  { id:'V09', title:'三连音练声（Na）', key:'C调', meter:'4/4', tempo:'♩=72', vowel:'Na',
    jianpu:['1 1 1 3 3 3 | 5 5 5 3 3 3 | 2 2 2 7 7 7 | 1 - - - ‖'],
    method:'三连音平均均匀，不可前紧后松，数拍子练', target:'三连音节奏、均匀感' },
  { id:'V10', title:'五声音阶练习（Yo）', key:'C调', meter:'4/4', tempo:'♩=76', vowel:'Yo',
    jianpu:['1 2 3 5 6 | 5 3 2 1 | 1 2 3 5 6 5 3 2 | 1 - - - ‖'],
    method:'五声音阶流畅圆润，一句一换气，音量均匀', target:'音阶流畅、气息分配' },
  { id:'V11', title:'二声部和声练声（S/A）', key:'C调', meter:'4/4', tempo:'♩=66', vowel:'S:A / 女高 / 女低',
    jianpu:['S: 1 - 3 - | 5 - 3 - | 1 - - - ‖','A: 5 - 1 - | 3 - 1 - | 5 - - - ‖'],
    method:'两声部各自稳定后合练，先唱音名再唱元音，互相聆听', target:'和声听辨、声部独立' },
  { id:'V12', title:'半音阶练习（上行下行）', key:'C调', meter:'4/4', tempo:'♩=60', vowel:'A',
    jianpu:['1 #1 2 #2 | 3 #3 4 #4 | 5 4 3 2 | 1 - - - ‖'],
    method:'半音逐级上下行，音准要精确，多用钢琴带练', target:'半音音准、听觉敏感度' }
];

// ---- 简谱视唱库（16条，每周轮换，含简谱） ----
const SIGHTREAD = [
  // Q1 基础级
  { id:'R01', title:'二拍子级进视唱', key:'C调', meter:'2/4', tempo:'♩=80', level:'基础',
    jianpu:['1 2 | 3 4 | 5 4 | 3 2 |','1 2 3 | 4 5 | 6 5 4 | 3 2 1 ‖'] },
  { id:'R02', title:'三拍子圆舞曲视唱', key:'C调', meter:'3/4', tempo:'♩=72', level:'基础',
    jianpu:['1 - 2 | 3 - 4 | 5 - 4 | 3 - 2 |','1 - 3 | 5 - 3 | 4 - 2 | 1 - - ‖'] },
  { id:'R03', title:'四拍子视唱（含八分音符）', key:'C调', meter:'4/4', tempo:'♩=84', level:'基础',
    jianpu:['5 6 5 4 | 3 4 3 2 | 1 2 3 4 | 5 - - - |','6 5 4 3 | 4 3 2 1 | 2 3 4 5 | 1 - - - ‖'] },
  { id:'R04', title:'附点节奏视唱', key:'C调', meter:'4/4', tempo:'♩=88', level:'基础',
    jianpu:['1·2 3 | 5·6 5 | 3·4 5 | 2·3 1 |','5·4 3 | 4·3 2 | 3·2 1 | 1 - - - ‖'] },
  // Q2 进阶级
  { id:'R05', title:'弱起小节视唱', key:'G调', meter:'4/4', tempo:'♩=84', level:'进阶',
    jianpu:['0 3 5 | 6 5 3 5 | 6 5 3 2 | 1 - - - |','0 5 6 | 1\' 6 5 3 | 5 3 2 1 | 1 - - - ‖'] },
  { id:'R06', title:'切分节奏视唱', key:'G调', meter:'4/4', tempo:'♩=88', level:'进阶',
    jianpu:['1 . 3 5 | 5 . 3 1 | 6 . 5 4 | 3 . 2 1 |','5 . 3 1 | 2 . 7 5 | 1 . 3 2 | 1 - - - ‖'] },
  { id:'R07', title:'三度六度音程视唱', key:'F调', meter:'4/4', tempo:'♩=76', level:'进阶',
    jianpu:['1 3 5 6 | 5 3 6 5 | 4 6 5 3 | 2 4 3 2 |','1 3 5 1\' | 6 5 3 1 | 2 4 3 2 | 1 - - - ‖'] },
  { id:'R08', title:'三连音视唱', key:'F调', meter:'4/4', tempo:'♩=80', level:'进阶',
    jianpu:['1 1 1 3 | 3 3 3 5 | 5 5 5 3 | 3 3 3 1 |','2 2 2 4 | 4 4 4 3 | 3 3 3 2 | 1 - - - ‖'] },
  // Q3 中高级
  { id:'R09', title:'小调视唱', key:'A小调', meter:'4/4', tempo:'♩=76', level:'中高级',
    jianpu:['6 1 3 | 2 1 7 6 | 3 5 6 | 5 4 3 - |','6 1 3 | 5 4 3 2 | 1 7 6 5 | 6 - - - ‖'] },
  { id:'R10', title:'转调视唱（小调→大调）', key:'A小调→C大调', meter:'4/4', tempo:'♩=80', level:'中高级',
    jianpu:['6 7 1 2 | 3 2 1 7 | 6 - 5 - | 6 - - - |','1 2 3 4 | 5 4 3 2 | 1 - 5 - | 1 - - - ‖'] },
  { id:'R11', title:'八度跳跃视唱', key:'C调', meter:'4/4', tempo:'♩=72', level:'中高级',
    jianpu:['1 - 1\' - | 6 - 6\' - | 5 - 3 - | 1 - - - |','1\' - 6 - | 5 - 3 - | 2 - 7 - | 1 - - - ‖'] },
  { id:'R12', title:'混合节奏视唱（综合）', key:'G调', meter:'4/4', tempo:'♩=88', level:'中高级',
    jianpu:['0 5 1·2 | 3 5 6·5 | 3 1 2·3 | 2 - 1 - |','0 5 1·2 | 3 5 1\'·6 | 5 3 2·3 | 1 - - - ‖'] },
  // Q4 圣诞与高级
  { id:'R13', title:'六八拍视唱（摇篮曲风）', key:'C调', meter:'6/8', tempo:'♩.=56', level:'高级',
    jianpu:['1 2 3 | 3 2 1 | 5 4 3 2 | 1 2 3 |','3 5 5 | 5 3 2 | 1 2 3 2 | 1 - - ‖'] },
  { id:'R14', title:'圣诞旋律视唱', key:'G调', meter:'4/4', tempo:'♩=100', level:'高级',
    jianpu:['3 5 5 6 | 5 3 1 2 | 3 5 5 6 | 5 - - - |','3 5 5 6 | 5 3 1 2 | 2 3 2 1 | 1 - - - ‖'] },
  { id:'R15', title:'半音阶视唱（含变音）', key:'C调', meter:'4/4', tempo:'♩=72', level:'高级',
    jianpu:['1 #1 2 | 3 4 #4 | 5 4 3 | 2 #1 1 |','3 #3 4 | 5 6 #6 | 1\' 6 5 | 4 3 2 ‖'] },
  { id:'R16', title:'综合大视唱（毕业级）', key:'F调', meter:'4/4', tempo:'♩=92', level:'高级',
    jianpu:['0 5 1·2 | 3 5 1\' 6 | 5·4 3 2 | 1 - 5 - |','0 1 2·3 | 4 5 6\' 5 | 4·3 2 1 | 1 - - - ‖'] }
];

// ---- 视唱练耳：节奏型库（附简谱节奏记号） ----
const RHYTHMS = [
  { name:'四分音符+八分音符组合', jianpu:'X X X X | X X X X - |' },
  { name:'附点节奏型', jianpu:'X·X X | X·X X X - |' },
  { name:'切分节奏', jianpu:'X . X X | X . X X - |' },
  { name:'三连音练习', jianpu:'X X X X X X | X X X X X X - |' },
  { name:'弱起拍练习', jianpu:'0 X X | X X X X | X X X - |' },
  { name:'2/4拍与4/4拍转换', jianpu:'X X | X X | X X X X | X - X - |' },
  { name:'3/4拍与6/8拍转换', jianpu:'X - X | X - X | X X X X X X | X - - |' }
];

// ---- 音程/和弦听辨库 ----
const INTERVALS = [
  '大小二度听辨','大小三度构唱','纯四纯五度','大小六度','大小七度','纯八度','和弦听辨（大三/小三）','和弦进行 I-IV-V-I'
];

// ============================================================
//  52课系列课程（热身练声 + 视唱练耳）——由指挥后台选课
// ============================================================
function buildLessons() {
  const lessons = [];
  for (let i = 0; i < 52; i++) {
    const v1 = VOCALISE[i % VOCALISE.length];
    const v2 = VOCALISE[(i + 5) % VOCALISE.length];
    const sr = SIGHTREAD[i % SIGHTREAD.length];
    const rh = RHYTHMS[i % RHYTHMS.length];
    const iv = INTERVALS[i % INTERVALS.length];
    lessons.push({
      id: i + 1,
      title: '第' + (i + 1) + '课',
      focus: '节奏「' + rh.name + '」 · 音程「' + iv + '」 · 视唱「' + sr.title + '」',
      vocalise: [v1, v2],
      rhythm: rh,
      interval: iv,
      sightReading: sr
    });
  }
  return lessons;
}
const LESSONS = buildLessons();

// 课程设置（指挥后台）：startLesson 全年第一课起始；currentLesson 当前课次
function getLessonSettings() {
  try {
    if (typeof localStorage === 'undefined') return { startLesson: 1, currentLesson: null };
    const s = JSON.parse(localStorage.getItem('choir_lesson_settings') || 'null');
    return { startLesson: (s && s.startLesson) || 1, currentLesson: (s && s.currentLesson) || null };
  } catch (e) { return { startLesson: 1, currentLesson: null }; }
}

// ============================================================
//  曲目排练要求（按每首曲目的调性/节拍/速度/音域/难度自动生成）
// ============================================================
function buildSongReq(s) {
  const reqs = [];
  const tempoNum = parseInt((s.tempo||'').replace(/[^\d]/g,'')) || 0;
  const isFast = tempoNum >= 100;
  const hasMod = /转调|调性转换|#|♭/.test(s.key + (s.tips||[]).join(''));
  const hasHigh = /[5-7]’|A5|G5|F#5|F5/.test(s.range);
  // 音准
  if (hasMod) reqs.push({label:'音准', text:'注意转调/临时变音处的音准，用钢琴逐句核对'});
  else if (hasHigh) reqs.push({label:'音准', text:'高音区保持气息支撑，避免喊唱与音准偏高/偏低'});
  else reqs.push({label:'音准', text:'按谱视唱，注意大小调色彩与和弦音准'});
  // 节奏
  const meter = s.meter || '4/4';
  if (meter === '3/4') reqs.push({label:'节奏', text:'三拍子韵律稳定，强弱规律 强-弱-弱，不赶拍不拖拍'});
  else if (meter === '6/8') reqs.push({label:'节奏', text:'6/8 拍以三拍为一组流动，附点节奏准确'});
  else if (isFast) reqs.push({label:'节奏', text:'速度较快，节奏清晰果断，八分音符与附点要精确'});
  else reqs.push({label:'节奏', text:'四拍子节拍稳定，注意附点/切分/弱起等节奏型'});
  // 咬字
  if (isFast) reqs.push({label:'咬字', text:'快速段落咬字要清晰有力，字头果断、字尾归韵'});
  else reqs.push({label:'咬字', text:'歌词咬字清楚圆润，字正腔圆，韵母保持口腔位置'});
  // 力度
  if ((s.diff||'').length >= 3) reqs.push({label:'力度', text:'力度层次丰富，渐强渐弱对比鲜明，高潮段落充分打开'});
  else reqs.push({label:'力度', text:'按谱面力度记号演唱，注意乐句的渐强渐弱与收束'});
  // 声部
  if ((s.voicing||'').includes('SA/TB') || (s.voicing||'').includes('二部')) reqs.push({label:'声部', text:'二部配合默契，旋律声部明亮、和声声部轻柔'});
  else reqs.push({label:'声部', text:'四声部音量平衡，旋律声部略突出，和声声部稳定支撑'});
  // 表达
  const f = (s.focus||[]).join('');
  if (/庄严|敬畏|深沉|力量|坚定/.test(f)) reqs.push({label:'表达', text:'整体庄严敬虔，以敬畏之心演唱，情绪饱满而节制'});
  else if (/欢快|喜乐|热烈|活力/.test(f)) reqs.push({label:'表达', text:'情绪欢快喜乐，声音有弹性与感染力'});
  else if (/抒情|温暖|柔和|甜美/.test(f)) reqs.push({label:'表达', text:'旋律连贯抒情，音色温暖柔和，情感自然流露'});
  else reqs.push({label:'表达', text:'理解歌词含义，以心灵和诚实歌唱'});
  return reqs;
}

// ============================================================
//  在家练习作业（按周类型生成）
// ============================================================
function buildHomework(type, songs, focus) {
  const names = (songs||[]).map(s=>s.title).filter(Boolean);
  const nameStr = names.map(n=>`《${n}》`).join('');
  let items = [];
  if (type === 'new') {
    items = [
      `跟范唱/伴奏音频完整听 2 遍，感受旋律风格与情绪`,
      `分声部视唱 ${nameStr} 旋律：哼鸣 → 唱名 → 歌词`,
      `用节拍器从慢速（50%）跟唱，重点练主曲 ${nameStr} 第 1-3 段`,
      `手机录音自检 1 次，回听检查音准与节奏，记下问题`,
      `背记 ${nameStr} 歌词前两段`
    ];
  } else if (type === 'performance') {
    items = [
      `献唱曲目 ${nameStr} 每天完整演唱 1 遍（背谱背词）`,
      `模拟上台：站立演唱，注意表情、台风与呼吸`,
      `录音回听，重点检查音准、节奏、咬字与声部配合`,
      `练习上下台与鞠躬礼仪，检查演出服装`
    ];
  } else if (type === 'review') {
    items = [
      `按序完整演唱本季曲目 ${nameStr}（每首 1 遍）`,
      `重点精修薄弱段落（音准/节奏/歌词各挑 1 处）`,
      `录音打卡：选 1 首最需要进步的歌录音提交`
    ];
  } else if (type === 'polish') {
    items = [
      `串联曲目 ${nameStr}，注意歌曲之间的衔接与过渡`,
      `处理力度与情感层次，跟随指挥要求精修`,
      `录音提交：整组串联演唱 1 遍`
    ];
  } else if (type === 'praise' || type === 'concert') {
    items = [
      `赞美会/献唱曲目 ${nameStr} 全部背谱背词`,
      `按节目单顺序完整演唱，注意队形与走位`,
      `检查服装、谱夹与上台礼仪`,
      `演出前一天早点休息，保护嗓子`
    ];
  }
  return {
    title: `本周在家练习作业（${type==='new'?'学新曲':type==='performance'?'献唱准备':type==='review'?'复习':type==='polish'?'串联精排':'赞美会准备'}）`,
    items,
    requirements: [
      '每周在家练习至少 3 次，每次 30-40 分钟',
      '练习后到「练习打卡」打卡并填写练习内容',
      '用节拍器从慢速开始，节奏不稳不加速',
      '录音自检，重点听音准、节奏、咬字',
      '有困难的地方标注出来，排练时问指挥'
    ]
  };
}

// ============================================================
//  全年48周排练规划 v2
//  每周类型：new 学新曲 | performance 献唱(2首) | review 复习 | polish 串联 | praise 季度赞美会 | concert 圣诞/年终
//  节奏：每月2次献唱（每次2首）· 每季度1次圣乐赞美会 · 12月圣诞赞美会 · 年终感恩赞美会
// ============================================================
function generateWeeklyPlans() {
  const weeks = [];
  const P = (q, pattern) => { // pattern entries: [type, idx1, idx2, label]
    pattern.forEach(([type, i1, i2, label]) => {
      const songs = q.songs;
      const info = {};
      if (i1 === 'all') info.songs = songs;
      else if (!songs.length) { info.focus = null; info.secondary = null; }
      else {
        info.focus = songs[i1 % songs.length];
        if (i2 != null) info.secondary = songs[i2 % songs.length];
      }
      const wnum = weeks.length + 1;
      const ft = info.focus ? info.focus.title : '待上传曲目';
      const st = info.secondary ? info.secondary.title : '待上传曲目';
      let lbl = label;
      if (type === 'new') lbl = `学习《${ft}》《${st}》`;
      else if (type === 'performance') lbl = `献唱：《${ft}》《${st}》`;
      else if (type === 'review') lbl = '复习精排：本季曲目';
      else if (type === 'polish') lbl = '串联走台排练';
      else if (type === 'praise') lbl = `${q.theme} · 季度圣乐赞美会`;
      else if (type === 'concert') lbl = wnum === 47 ? '圣诞赞美会' : '年终感恩赞美会 · 全年总回顾';
      info.label = lbl;
      weeks.push(makeWeek(wnum, q.id, type, info));
    });
  };

  // Q1: 1-3月 新年新恩典
  P(QUARTERS[0], [
    ['new',0,1,'学习《奇异恩典》《一切歌颂赞美》'],
    ['performance',0,1,'献唱：《奇异恩典》《一切歌颂赞美》'],
    ['new',2,3,'学习《我知谁掌管明天》《如鹰展翅上腾》'],
    ['performance',2,3,'献唱：《我知谁掌管明天》《如鹰展翅上腾》'],
    ['new',4,5,'学习《祢是荣耀君王》《耶稣爱你》'],
    ['performance',4,5,'献唱：《祢是荣耀君王》《耶稣爱你》'],
    ['new',6,7,'学习《赞美之泉》《一生的奉献》'],
    ['performance',6,7,'献唱：《赞美之泉》《一生的奉献》'],
    ['review','all',null,'复习精排：本季8首曲目'],
    ['performance',0,2,'献唱：《奇异恩典》《我知谁掌管明天》'],
    ['performance',4,6,'献唱：《祢是荣耀君王》《赞美之泉》'],
    ['praise','all',null,'第一季度圣乐赞美会：新年新恩典']
  ]);
  // Q2: 4-6月 十字架的恩典
  P(QUARTERS[1], [
    ['new',0,1,'学习《十架的爱》《颂赞主权之羔羊》'],
    ['performance',0,1,'献唱：《十架的爱》《颂赞主权之羔羊》'],
    ['new',2,3,'学习《耶稣恩友》《宝架清影》'],
    ['performance',2,3,'献唱：《耶稣恩友》《宝架清影》'],
    ['new',4,5,'学习《仰望十架》《靠主膀臂》'],
    ['performance',4,5,'献唱：《仰望十架》《靠主膀臂》'],
    ['new',6,7,'学习《活出基督》《赞美主》'],
    ['performance',6,7,'献唱：《活出基督》《赞美主》'],
    ['review','all',null,'复习精排：本季8首曲目'],
    ['performance',0,2,'献唱：《十架的爱》《耶稣恩友》'],
    ['performance',4,6,'献唱：《仰望十架》《活出基督》'],
    ['praise','all',null,'第二季度圣乐赞美会：十字架的恩典']
  ]);
  // Q3: 7-9月 圣灵的火
  P(QUARTERS[2], [
    ['new',0,1,'学习《圣灵请你来》《恩典之路》'],
    ['performance',0,1,'献唱：《圣灵请你来》《恩典之路》'],
    ['new',2,3,'学习《神的应许永不落空》《一切歌颂赞美》'],
    ['performance',2,3,'献唱：《神的应许永不落空》《一切歌颂赞美》'],
    ['new',4,5,'学习《差遣我》《耶和华祝福满满》'],
    ['performance',4,5,'献唱：《差遣我》《耶和华祝福满满》'],
    ['new',6,7,'学习《磐石耶稣》《荣耀归主名》'],
    ['performance',6,7,'献唱：《磐石耶稣》《荣耀归主名》'],
    ['review','all',null,'复习精排：本季8首曲目'],
    ['performance',0,2,'献唱：《圣灵请你来》《神的应许永不落空》'],
    ['performance',4,6,'献唱：《差遣我》《磐石耶稣》'],
    ['praise','all',null,'第三季度圣乐赞美会：圣灵的火']
  ]);
  // Q4: 10-12月 道成肉身·圣诞·年终
  P(QUARTERS[3], [
    ['new',0,1,'学习《平安夜》《普世欢腾》'],
    ['performance',0,1,'献唱：《平安夜》《普世欢腾》'],
    ['new',2,3,'学习《马槽歌》《新生王歌》'],
    ['performance',2,3,'献唱：《马槽歌》《新生王歌》'],
    ['new',4,5,'学习《听啊天使高声唱》《荣耀归于真神》'],
    ['performance',4,5,'献唱：《听啊天使高声唱》《荣耀归于真神》'],
    ['new',6,7,'学习《诸天诉说》《一路引导》'],
    ['performance',6,7,'献唱：《诸天诉说》《一路引导》'],
    ['review','all',null,'复习精排：圣诞+年终曲目'],
    ['performance',0,2,'献唱：《平安夜》《马槽歌》（圣诞精选）'],
    ['concert','all',null,'圣诞赞美会：道成肉身·平安夜'],
    ['concert','all',null,'年终感恩赞美会：全年总回顾']
  ]);

  return weeks;
}

// ---- 生成一周 ----
function makeWeek(weekNum, quarter, type, info) {
  const q = QUARTERS.find(x => x.id === quarter);
  const dev = DEVOTIONS.find(d => d.w === weekNum) || DEVOTIONS[0];
  // 52课系列课程：每周一课，按「起始课」推进（指挥后台可选起始课/当前课次）
  const ls = getLessonSettings();
  const lesson = LESSONS[(ls.startLesson + weekNum - 2) % LESSONS.length];
  const v1 = lesson.vocalise[0], v2 = lesson.vocalise[1];
  const sr = lesson.sightReading, rh = lesson.rhythm, iv = lesson.interval;
  let songs = info.focus ? [info.focus, info.secondary].filter(Boolean) : (info.songs || []);
  if (!songs.length) songs = [placeholderSong(q ? (['Q1','Q2','Q3','Q4'].indexOf(quarter)) : 0, 0)];
  const allSongs = info.songs || songs;

  return {
    weekNum, quarter, quarterTheme: q.theme, type, label: info.label,
    songs, allSongs,
    lesson: { id: lesson.id, title: lesson.title, focus: lesson.focus },
    devotion: dev,
    warmup: {
      body: ['左右转头各5次','上下点头5次','肩部绕圈（前→后→前）×3','手臂伸展向上10秒','双手叉腰左右侧弯','手腕脚踝转圈×3'],
      breath: ['腹式呼吸：吸气4拍-保持4拍-吐气8拍 ×3','弹跳气息：短促"嘶嘶嘶" ×5组','慢吸慢呼：吸气6拍-吐气10拍 ×3','气息计数：一口气数到20再目标25','"哈"音练习：快速吸气后发"哈" ×5'],
      vocal: [v1, v2],
      choir: ['和弦调音：SATB 和弦 C大调 逐个声部进入','和弦连接：I-IV-V-I 各声部独立','各声部独立起音：指挥给出起拍','和声听辨：S唱Do, A唱Mi, T唱Sol, B唱Do\'','节奏统一练习：指挥打4/4拍全员统一进入']
    },
    solfege: {
      rhythm: rh,
      interval: iv,
      sightReading: {
        title: sr.title, key: sr.key, meter: sr.meter, tempo: sr.tempo, level: sr.level,
        jianpu: sr.jianpu,
        target: info.focus ? `结合本周曲目《${info.focus.title}》主旋律片段视唱（4-8小节）` : '复习本周视唱片段'
      }
    },
    songReqs: songs.map(s => ({ title: s.title, key:s.key, meter:s.meter, tempo:s.tempo, voicing:s.voicing, diff:s.diff, reqs: buildSongReq(s) })),
    rehearsalDetail: buildRehearsalDetail(type, info),
    homework: buildHomework(type, allSongs)
  };
}

// ---- 排练详情（按周类型） ----
function buildRehearsalDetail(type, info) {
  if (type === 'new') {
    const song = info.focus || placeholderSong(0, 0), song2 = info.secondary || placeholderSong(0, 1);
    return [
      { time:'30分', phase:'学习主曲', title:song.title, steps: song.rehearsalSteps || ['听范唱/示范音频 1 遍','分声部学旋律','合排（慢速→原速）','完整演唱'], tips: song.tips || [] },
      { time:'15分', phase:'学习副曲', title:song2.title, steps:['听范唱1遍','分声部学旋律','初步合排'], tips: song2.tips || [] },
      { time:'5分', phase:'回顾布置', content:'简短回顾本周学到的内容，布置在家练习作业与打卡要求' }
    ];
  } else if (type === 'performance') {
    const song = info.focus || placeholderSong(0, 0), song2 = info.secondary || placeholderSong(0, 1);
    return [
      { time:'15分', phase:'献唱曲1精排', title:song.title, steps:['热身复习旋律','分声部检查','合排处理表情','原速完整演唱'], tips:song.tips || [] },
      { time:'15分', phase:'献唱曲2精排', title:song2.title, steps:['热身复习旋律','分声部检查','合排处理表情','原速完整演唱'], tips:song2.tips || [] },
      { time:'10分', phase:'献唱模拟', content:'两首歌连贯演唱2遍，注意上台仪态、鞠躬、音量控制', tips:['眼神不要看谱','保持微笑','步伐统一'] },
      { time:'10分', phase:'本周总结', content:'指挥点评表现，表扬进步，指出需要改进的地方' }
    ];
  } else if (type === 'review') {
    const songs = info.songs || [];
    const chunks = [];
    const perChunk = Math.ceil(songs.length / 2);
    for (let i = 0; i < songs.length; i += perChunk) {
      const group = songs.slice(i, i + perChunk);
      chunks.push({
        time: '25分',
        phase: `复习${group.map(s=>`《${s.title}》`).join('、')}`,
        steps: group.map(s => `《${s.title}》完整演唱+精修`),
        tips: group.flatMap(s => s.tips)
      });
    }
    chunks.push({ time:'5分', phase:'总结', content:'复习总结，布置在家练习' });
    return chunks;
  } else if (type === 'polish') {
    const songs = info.songs || [info.focus];
    return [
      { time:'20分', phase:'第一组串联', content:songs.slice(0,4).map(s=>`《${s.title}》`).join(' → '), steps:['按赞美会顺序连续演唱','注意歌曲间的过渡','处理力度和情感变化'] },
      { time:'20分', phase:'第二组串联', content:songs.slice(4).map(s=>`《${s.title}》`).join(' → '), steps:['连续演唱后4首','处理过渡和整体性'] },
      { time:'10分', phase:'全场串联', content:'全部曲目按顺序连贯演唱一遍' }
    ];
  } else if (type === 'praise' || type === 'concert') {
    const songs = info.songs || [];
    return [
      { time:'15分', phase:'节目顺序确认', content:'确认赞美会/献唱节目顺序、进场路线、站位', steps:['全员走场','确认灯光和音响','钢琴前奏检查'] },
      { time:'20分', phase:'重点曲目精排', content:songs.slice(0,2).map(s=>`《${s.title}》`).join('、'), steps:['精排处理细节','注意力度和情感','完整演唱'] },
      { time:'15分', phase:'串联走台', content:'按正式演出顺序完整走台一遍', steps:['注意上下场','注意台风','音响检查'] }
    ];
  }
  return [];
}

// ---- 年度事奉日历（按月份自动汇总） ----
function buildAnnualEvents(weeks) {
  const months = [];
  for (let m = 1; m <= 12; m++) {
    const mw = weeks.filter(w => Math.floor((w.weekNum - 1) / 4) + 1 === m);
    const events = mw.map(w => {
      let type = '排练', icon = 'fa-music';
      if (w.type === 'performance') { type = '献唱（2首）'; icon = 'fa-microphone'; }
      else if (w.type === 'praise') { type = '季度圣乐赞美会'; icon = 'fa-church'; }
      else if (w.type === 'concert') { type = w.weekNum === 47 ? '圣诞赞美会' : '年终感恩赞美会'; icon = 'fa-star'; }
      else if (w.type === 'new') { type = '学习新曲'; icon = 'fa-book-open'; }
      else if (w.type === 'review') { type = '复习精排'; icon = 'fa-repeat'; }
      else if (w.type === 'polish') { type = '串联走台'; icon = 'fa-route'; }
      return { week: w.weekNum, type, icon, label: w.label };
    });
    months.push({ month: m, events });
  }
  return months;
}

// ---- 导出 ----
return {
  QUARTERS,
  DEVOTIONS,
  REHEARSAL_RULES,
  HOME_RULES,
  VOCALISE,
  SIGHTREAD,
  RHYTHMS,
  INTERVALS,
  LESSONS,
  getLessonSettings,
  WEEKS: generateWeeklyPlans(),
  ANNUAL_EVENTS: buildAnnualEvents(generateWeeklyPlans()),
  VOICE_LABELS: { soprano:'女高音', alto:'女低音', tenor:'男高音', bass:'男低音' },
  WEEK_TYPE_LABELS: {
    new:'学新曲', performance:'献唱周', review:'复习', polish:'串联精排',
    praise:'季度赞美会', concert:'特别赞美会'
  },
  WEEK_TYPE_COLORS: {
    new:'#6C5CE7', performance:'#00B894', review:'#FDCB6E', polish:'#00CEC9',
    praise:'#E17055', concert:'#FD79A8'
  }
};

})();
