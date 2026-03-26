import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// NOTE: 与 Home.tsx 完全相同的 SOP 数据，确保月份规划页与学习页内容严格一致
interface WeekSOP {
  focus: string;
  subtitle: string;
  dailyTopics: string[];
  phaseLabel: string; // 大阶段描述
}

const WEEKLY_SOP: Record<number, WeekSOP> = {
  1:  { focus: 's, a, t', subtitle: '摩擦音 s 的拉长练习', phaseLabel: 'Phase 1: 字母启蒙', dailyTopics: ['「s」摩擦音 ssss', '「a」短元音 aaa', '「t」清辅音 t-t-t', 'SAT 拼读合体', 'SAT 听音辨位', '沙盘书写 s/a/t', '本周成果检测'] },
  2:  { focus: 'p, i, n', subtitle: '爆破音 p 与短元音 i 辨析', phaseLabel: 'Phase 1: 字母启蒙', dailyTopics: ['「p」爆破音 p-p-p', '「i」短元音 i-i-i', '「n」鼻音 nnn', 'PIN 拼读合体', 'PIN 听音辨位', '沙盘书写 p/i/n', '本周成果检测'] },
  3:  { focus: '复习 SATPIN', subtitle: '尝试第一个单词拼读: sat, tin', phaseLabel: 'Phase 1: 字母启蒙', dailyTopics: ['sat 拼读练习', 'tin 拼读练习', 'SATPIN 分类游戏', 'sat/tin 口语句型', 'SATPIN 闯关游戏', 'SATPIN 大复习', 'SATPIN 里程碑'] },
  4:  { focus: '视觉词 I, a', subtitle: '结合已有口语: I see a...', phaseLabel: 'Phase 1: 字母启蒙', dailyTopics: ['「I」高频认读', '「a」高频认读', 'I see a... 句型', '「I/a」闪卡竞速', 'I see a... 绘本', '视觉词沙盘游戏', '视觉词成果检测'] },
  5:  { focus: 'm, d, g', subtitle: '喉音 g 的动作引导', phaseLabel: 'Phase 1: 字母启蒙', dailyTopics: ['「m」嘴唇振动 mmm', '「d」弹舌音 d-d-d', '「g」青蛙喉音 ggg', 'MDG 拼读合体', 'MDG 听音辨位', '沙盘书写 m/d/g', 'MDG 成果检测'] },
  6:  { focus: 'o, c, k', subtitle: '区分 c 和 k 发音相同', phaseLabel: 'Phase 1: 字母启蒙', dailyTopics: ['「o」圆嘴短元音', '「c」清辅音（同k）', '「k」清辅音（同c）', 'OCK 词族拼读', 'c/k 同音辨形', '沙盘书写 o/c/k', 'GOCK 成果检测'] },
  7:  { focus: '复习 M2 发音', subtitle: '首音听音辨位游戏', phaseLabel: 'Phase 1: 字母启蒙', dailyTopics: ['首音辨位 Round 1', '首音辨位 Round 2', 'GOCK 高频词温习', 'GOCK 拼读游戏', 'GOCK 绘本指读', 'GOCK 沙盘复习', 'GOCK 里程碑'] },
  8:  { focus: '视觉词 the, see', subtitle: '结合口语: I see the...', phaseLabel: 'Phase 1: 字母启蒙', dailyTopics: ['「the」高频认读', '「see」高频认读', 'I see the... 句型', '「the/see」闪卡', 'I see the... 绘本', '视觉词综合游戏', '视觉词成果检测'] },
  9:  { focus: 'e, u, r', subtitle: '短元音 e/u 多用 TPR 动作', phaseLabel: 'Phase 1: 字母启蒙', dailyTopics: ['「e」短元音 eee', '「u」短元音 uuu', '「r」卷舌音 rrr', 'EUR 拼读合体', 'EUR 听音辨位', '沙盘书写 e/u/r', 'EUR 成果检测'] },
  10: { focus: 'h, b, f, l', subtitle: 'b 和 d 的镜像区分', phaseLabel: 'Phase 1: 字母启蒙', dailyTopics: ['「h」气流音 hhh', '「b」弹唇音（区分d）', '「f」摩擦音 fff', '「l」舌尖振动 lll', 'hbfl 听音辨位', '沙盘书写 h/b/f/l', 'HBFL 成果检测'] },
  11: { focus: 'j, v, w, x, y, z, q', subtitle: '生僻音快速过，建立印象', phaseLabel: 'Phase 1: 字母启蒙', dailyTopics: ['「j」「v」认知', '「w」「x」认知', '「y」「z」「q」认知', '生僻音综合游戏', '26字母串联歌曲', '字母全套闪卡', '26字母全覆盖检测'] },
  12: { focus: '26字母里程碑检测', subtitle: '看到 26 个字母能 1 秒说出发音', phaseLabel: 'Phase 1: 字母启蒙', dailyTopics: ['字母 A-G 速测', '字母 H-N 速测', '字母 O-Z 速测', '全字母 Round 1', '全字母 Round 2', '错题回炉', '🏆 26字母里程碑'] },
  13: { focus: '-at 词族', subtitle: 'cat, mat, hat 拼读', phaseLabel: 'Phase 2: 拼读跨越', dailyTopics: ['「cat」拼读', '「mat」拼读', '「hat」拼读', '-at 词族大集合', 'I see a cat. 课堂', '沙盘书写', '-at 成果检测'] },
  14: { focus: '-ap, -ad 词族', subtitle: 'map, cap, dad 拼读', phaseLabel: 'Phase 2: 拼读跨越', dailyTopics: ['「map」「cap」拼读', '「dad」「bad」拼读', '-ap/-ad 对比', '拼读综合游戏', '短句练习', '沙盘书写', '-ap/-ad 成果检测'] },
  15: { focus: '-an, -am 词族', subtitle: 'fan, pan, jam 拼读', phaseLabel: 'Phase 2: 拼读跨越', dailyTopics: ['「fan」「pan」拼读', '「jam」「ham」拼读', '-an/-am 对比', '拼读游戏', '短句表达', '沙盘书写', '-an/-am 成果检测'] },
  16: { focus: '视觉词 my, like', subtitle: '结合口语: I like my cat.', phaseLabel: 'Phase 2: 拼读跨越', dailyTopics: ['「my」高频认读', '「like」高频认读', 'I like my... 句型', 'my/like + 词族', '指读绘本', '视觉词游戏', '视觉词成果检测'] },
  17: { focus: '-ig, -in 词族', subtitle: 'pig, big, bin 拼读', phaseLabel: 'Phase 2: 拼读跨越', dailyTopics: ['「pig」「big」拼读', '「bin」「fin」拼读', '-ig/-in 对比', '拼读游戏', 'I see a pig.', '沙盘书写', '-ig/-in 成果检测'] },
  18: { focus: '-ip, -it 词族', subtitle: 'lip, sit, hit 拼读', phaseLabel: 'Phase 2: 拼读跨越', dailyTopics: ['「lip」「tip」拼读', '「sit」「hit」拼读', '-ip/-it 对比', '拼读游戏', '短句练习', '沙盘书写', '-ip/-it 成果检测'] },
  19: { focus: '-ot, -op 词族', subtitle: 'hot, pot, hop 拼读', phaseLabel: 'Phase 2: 拼读跨越', dailyTopics: ['「hot」「pot」拼读', '「hop」「top」拼读', '-ot/-op 对比', '拼读游戏', 'It is hot! 课堂', '沙盘书写', '-ot/-op 成果检测'] },
  20: { focus: '视觉词 can, go', subtitle: '短句: I can hop.', phaseLabel: 'Phase 2: 拼读跨越', dailyTopics: ['「can」高频认读', '「go」高频认读', 'I can... 句型', 'can/go + 词族', '指读绘本', '视觉词游戏', '视觉词成果检测'] },
  21: { focus: '-en, -et 词族', subtitle: 'hen, ten, net 拼读', phaseLabel: 'Phase 2: 拼读跨越', dailyTopics: ['「hen」「ten」拼读', '「net」「set」拼读', '-en/-et 对比', '拼读游戏', '-en/-et 短句', '沙盘书写', '-en/-et 成果检测'] },
  22: { focus: '-ug, -un 词族', subtitle: 'bug, mug, sun 拼读', phaseLabel: 'Phase 2: 拼读跨越', dailyTopics: ['「bug」「mug」拼读', '「sun」「run」拼读', '-ug/-un 对比', '拼读游戏', '-ug/-un 短句', '沙盘书写', '-ug/-un 成果检测'] },
  23: { focus: '综合 CVC 混合训练', subtitle: '随机抽取 10 个词拼读', phaseLabel: 'Phase 2: 拼读跨越', dailyTopics: ['a 系 CVC 综合', 'i/o 系 CVC 综合', 'e/u 系 CVC 综合', 'CVC 随机竞速', 'CVC 速度竞赛', 'CVC 沙盘拼词', 'CVC 综合检测'] },
  24: { focus: '里程碑: 拼读 50 CVC', subtitle: '能够独立拼读 50 个 CVC 单词', phaseLabel: 'Phase 2: 拼读跨越', dailyTopics: ['a 系速测', 'i/o 系速测', 'e/u 系速测', '50词 Round 1', '50词 Round 2', '错题回炉', '🏆 CVC 里程碑'] },
  25: { focus: 'to, is, on, in', subtitle: '方位词结合实物游戏', phaseLabel: 'Phase 3: 词汇与短句', dailyTopics: ['「to」日常对话', '「is」句型', '「on」方位', '「in」方位', 'on/in 对比', '指读绘本', '本周成果检测'] },
  26: { focus: 'he, she, we, me', subtitle: '家人角色扮演', phaseLabel: 'Phase 3: 词汇与短句', dailyTopics: ['「he/she」代词', '「we」复数', '「me」自我介绍', '代词家庭游戏', '短句对话', '指读绘本', '本周成果检测'] },
  27: { focus: 'you, are, am', subtitle: '简单对话练习', phaseLabel: 'Phase 3: 词汇与短句', dailyTopics: ['「you are」对话', '「I am」介绍', 'Are you...? 问答', '综合代词对话', '短句游戏', '指读绘本', '本周成果检测'] },
  28: { focus: '视觉词拼图游戏', subtitle: '快速反应练习', phaseLabel: 'Phase 3: 词汇与短句', dailyTopics: ['高频词 Round 1', '高频词 Round 2', '拼图游戏 A', '拼图游戏 B', '速度抢卡', '综合复习', '本周成果检测'] },
  29: { focus: 'sh 二合字母', subtitle: 'hush, ship, shop', phaseLabel: 'Phase 3: 词汇与短句', dailyTopics: ['「sh」发音导入', '「ship」拼读', '「shop」拼读', 'sh 词族综合', '听音辨 sh/s', '沙盘书写 sh', 'sh 成果检测'] },
  30: { focus: 'ch 二合字母', subtitle: 'chip, chop, chin', phaseLabel: 'Phase 3: 词汇与短句', dailyTopics: ['「ch」发音导入', '「chip」拼读', '「chop」拼读', 'ch 词族综合', '听音辨 ch/sh', '沙盘书写 ch', 'ch 成果检测'] },
  31: { focus: 'th 二合字母', subtitle: 'this, that 清浊区分', phaseLabel: 'Phase 3: 词汇与短句', dailyTopics: ['「th」清音 think', '「th」浊音 this', 'th 清浊对比', 'th 词族综合', '指读 th 句型', '沙盘书写 th', 'th 成果检测'] },
  32: { focus: '视觉词 said/have/for', subtitle: '高频词强化', phaseLabel: 'Phase 3: 词汇与短句', dailyTopics: ['「said」认读', '「have」认读', '「for」认读', '三词造句', '指读绘本', '视觉词游戏', '本周成果检测'] },
  33: { focus: '句型: The [CVC] is [Adj]', subtitle: '形容词结合拼读词', phaseLabel: 'Phase 3: 词汇与短句', dailyTopics: ['The cat is big.', 'The dog is hot.', '形容词扩展', '看图造句', '绘本指读', '综合造句', '本周成果检测'] },
  34: { focus: '句型: I see the [CVC]', subtitle: '介词结合句型', phaseLabel: 'Phase 3: 词汇与短句', dailyTopics: ['I see the bug.', 'on/in 造句', '复合句型游戏', '绘本指读', '句型造句赛', '综合阅读', '本周成果检测'] },
  35: { focus: '视觉词 look/play/with', subtitle: '游戏化词汇强化', phaseLabel: 'Phase 3: 词汇与短句', dailyTopics: ['「look」认读', '「play」认读', '「with」认读', '三词综合使用', '绘本指读', '视觉词游戏', '本周成果检测'] },
  36: { focus: '里程碑: 50 高频词', subtitle: '累计掌握 50 个高频词', phaseLabel: 'Phase 3: 词汇与短句', dailyTopics: ['1-10 高频词速测', '11-25 速测', '26-40 速测', '41-50 速测', '高频词游戏', '指读综合绘本', '🏆 50高频词里程碑'] },
  37: { focus: 'RAZ AA 精读第1周', subtitle: '侧重指读准确性', phaseLabel: 'Phase 4: 自主阅读', dailyTopics: ['绘本1 初读', '绘本1 跟读', '绘本2 初读', '绘本2 跟读', '两本对比', '句型提炼', '本周成果检测'] },
  38: { focus: 'RAZ AA 精读第2周', subtitle: '侧重指读准确性', phaseLabel: 'Phase 4: 自主阅读', dailyTopics: ['绘本3 初读', '绘本3 跟读', '绘本4 初读', '绘本4 跟读', '综合指读', '句型提炼', '本周成果检测'] },
  39: { focus: 'RAZ AA 精读第3周', subtitle: '指读 + 解码应用', phaseLabel: 'Phase 4: 自主阅读', dailyTopics: ['绘本5 初读', '绘本5 精读', '绘本6 初读', '绘本6 精读', '解码练习', '指读复习', '本周成果检测'] },
  40: { focus: 'RAZ AA 精读第4周', subtitle: '阅读流利度提升', phaseLabel: 'Phase 4: 自主阅读', dailyTopics: ['绘本综合回顾', '流利度计时', '句型整理', '角色扮演读', '指读评估', '创意延伸', '🏆 M10 里程碑'] },
  41: { focus: 'RAZ Level A 第1周', subtitle: '拼读解码的应用', phaseLabel: 'Phase 4: 自主阅读', dailyTopics: ['RAZ A 初读', '跟读跟鉴', '解码练习', '角色扮演', '流利度', '指读', '本周成果检测'] },
  42: { focus: 'RAZ Level A 第2周', subtitle: '拼读解码的应用', phaseLabel: 'Phase 4: 自主阅读', dailyTopics: ['RAZ A 初读', '跟读跟鉴', '解码练习', '角色扮演', '流利度', '指读', '本周成果检测'] },
  43: { focus: 'RAZ Level A 第3周', subtitle: '拼读解码的应用', phaseLabel: 'Phase 4: 自主阅读', dailyTopics: ['RAZ A 初读', '跟读跟鉴', '解码练习', '角色扮演', '流利度', '指读', '本周成果检测'] },
  44: { focus: 'RAZ Level A 第4周', subtitle: '拼读解码的应用', phaseLabel: 'Phase 4: 自主阅读', dailyTopics: ['RAZ A 初读', '跟读跟鉴', '解码练习', '角色扮演', '流利度', '指读', '本周成果检测'] },
  45: { focus: '综合阅读第1周', subtitle: '角色互换：让孩子给妈妈读', phaseLabel: 'Phase 4: 自主阅读', dailyTopics: ['绘本自读挑战', '角色互换阅读', '流利度提升', '朗读录制准备', '朗读录制', '综合复习', '🎉 年度成就'] },
  46: { focus: '综合阅读第2周', subtitle: '建立阅读自信', phaseLabel: 'Phase 4: 自主阅读', dailyTopics: ['绘本自读', '角色互换', '流利度提升', '朗读录制', '综合回顾', '家庭分享', '🎉 年度成就'] },
  47: { focus: '综合阅读第3周', subtitle: '复述与表达', phaseLabel: 'Phase 4: 自主阅读', dailyTopics: ['绘本复述', '角色扮演', '创意续写', '朗读录制', '综合回顾', '家庭分享', '🎉 年度成就'] },
  48: { focus: '综合阅读第4周', subtitle: '🏆 年度大检测', phaseLabel: 'Phase 4: 自主阅读', dailyTopics: ['全年音素速测', '全年高频词速测', '绘本自主阅读', '阅读成就展示', '家庭颁奖仪式', '年度复盘', '🏆 MommyMate 毕业典礼'] },
};

function getWeekSOP(totalWeek: number): WeekSOP {
  return WEEKLY_SOP[totalWeek] ?? {
    focus: `第${totalWeek}周课程`,
    subtitle: 'AI 动态生成',
    phaseLabel: '课程进行中',
    dailyTopics: Array(7).fill('今日学习')
  };
}

/** 课程锚点：2026-03-25 = 第1个月 第1周 周一 */
const CURRICULUM_START = new Date('2026-03-25T00:00:00');

function getCurrentTotalWeek(): number {
  const msElapsed = new Date().getTime() - CURRICULUM_START.getTime();
  return Math.max(1, Math.min(48, Math.floor(msElapsed / (7 * 24 * 60 * 60 * 1000)) + 1));
}

const WEEK_DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

const PHASE_COLORS: Record<string, string> = {
  'Phase 1: 字母启蒙':   'from-cyan-500 to-teal-400',
  'Phase 2: 拼读跨越':   'from-orange-400 to-amber-400',
  'Phase 3: 词汇与短句': 'from-violet-500 to-purple-400',
  'Phase 4: 自主阅读':   'from-rose-500 to-pink-400',
};

export default function MonthSwitch() {
  const navigate = useNavigate();
  const currentTotalWeek = getCurrentTotalWeek();

  // activeCurriculumMonth: 1-12（课程月，而非日历月）
  const [activeCurriculumMonth, setActiveCurriculumMonth] = useState(1);
  // expandedWeek: 当前展开的周（1-4）
  const [expandedWeek, setExpandedWeek] = useState(1);

  useEffect(() => {
    // NOTE: 默认打开到当前课程所在的月
    const currentMonth = Math.ceil(currentTotalWeek / 4);
    const currentWeekInMonth = ((currentTotalWeek - 1) % 4) + 1;
    setActiveCurriculumMonth(currentMonth);
    setExpandedWeek(currentWeekInMonth);
  }, []);

  /** 当前课程月内，第 w 周对应的全局 totalWeek */
  const getTotalWeek = (currMonth: number, weekInMonth: number) =>
    (currMonth - 1) * 4 + weekInMonth;



  const handleSwitchToWeek = () => {
    const tw = getTotalWeek(activeCurriculumMonth, expandedWeek);
    localStorage.setItem('activeTotalWeek', String(tw));
    navigate('/');
  };

  return (
    <div className="bg-background font-body text-on-background min-h-screen pb-28">

      {/* TopAppBar */}
      <header className="fixed top-0 left-0 w-full z-50 flex items-center justify-between px-6 py-4 bg-surface/90 backdrop-blur-md shadow-[0_4px_24px_rgba(20,29,33,0.06)] rounded-b-[2rem]">
        <button onClick={() => navigate(-1)} className="w-12 h-12 rounded-full flex items-center justify-center text-primary active:scale-95 transition-transform">
          <span className="material-symbols-outlined text-3xl">arrow_back</span>
        </button>
        <h1 className="font-lexend text-xl font-bold text-primary">年度课程规划</h1>
        <div className="w-12" />
      </header>

      <main className="pt-28 px-4 space-y-8 pb-32">

        {/* 课程月选择器 */}
        <section>
          <h2 className="text-on-surface-variant font-bold text-sm px-2 mb-3 uppercase tracking-widest">选择课程月份</h2>
          <div className="flex overflow-x-auto no-scrollbar gap-3 px-1 py-2">
            {Array.from({ length: 12 }, (_, i) => i + 1).map(m => {
              const tw = getTotalWeek(m, 1);
              const mSop = getWeekSOP(tw);
              const isActive = m === activeCurriculumMonth;
              const isCurrent = Math.ceil(currentTotalWeek / 4) === m;
              const gradColor = PHASE_COLORS[mSop.phaseLabel] ?? 'from-primary to-primary-container';
              return (
                <button
                  key={m}
                  onClick={() => { setActiveCurriculumMonth(m); setExpandedWeek(1); }}
                  className={`flex-none flex flex-col items-center justify-center rounded-2xl px-5 py-4 min-w-[80px] transition-all ${
                    isActive
                      ? `bg-gradient-to-br ${gradColor} text-white shadow-lg scale-105`
                      : 'bg-surface-container-low text-on-surface-variant hover:bg-surface-container'
                  }`}
                >
                  <span className={`text-xl font-extrabold ${isActive ? '' : ''}`}>{m}</span>
                  <span className="text-[10px] font-medium mt-0.5 opacity-80">个月</span>
                  {isCurrent && <span className="text-[8px] font-bold mt-1 bg-white/30 px-1.5 py-0.5 rounded-full">本月</span>}
                </button>
              );
            })}
          </div>
        </section>

        {/* 本月大目标 */}
        <section className="bg-primary-container/40 rounded-2xl p-6 relative overflow-hidden">
          <div className="absolute -right-2 -top-2 opacity-10">
            <span className="material-symbols-outlined text-[100px] text-primary">auto_stories</span>
          </div>
          <div className="flex items-center gap-2 mb-2">
            <span className="material-symbols-outlined text-primary">stars</span>
            <h2 className="text-on-primary-container font-bold text-lg">第 {activeCurriculumMonth} 个月学习总目标</h2>
          </div>
          <p className="text-on-surface-variant text-xs mb-3 font-medium">{getWeekSOP(getTotalWeek(activeCurriculumMonth, 1)).phaseLabel}</p>
          <div className="space-y-2">
            {[1, 2, 3, 4].map(w => {
              const tw = getTotalWeek(activeCurriculumMonth, w);
              const ws = getWeekSOP(tw);
              return (
                <div key={w} className="flex items-center gap-2 text-sm">
                  <span className="w-5 h-5 rounded-full bg-primary/15 text-primary text-[11px] font-bold flex items-center justify-center shrink-0">W{w}</span>
                  <span className="text-on-surface font-medium">{ws.focus}</span>
                </div>
              );
            })}
          </div>
        </section>

        {/* 每周展开内容 */}
        <section className="space-y-4">
          <h2 className="text-on-background font-bold text-xl px-1">本月周计划</h2>
          {[1, 2, 3, 4].map(w => {
            const tw = getTotalWeek(activeCurriculumMonth, w);
            const ws = getWeekSOP(tw);
            const isExpanded = w === expandedWeek;
            const isCurrent = tw === currentTotalWeek;

            return (
              <div key={w} className="bg-white rounded-2xl shadow-[0_8px_24px_rgba(20,29,33,0.06)] overflow-hidden">
                {/* 周标题行 */}
                <div
                  className={`p-5 cursor-pointer flex items-center justify-between ${isExpanded ? 'bg-secondary' : 'bg-surface-container-low hover:bg-surface-container'}`}
                  onClick={() => setExpandedWeek(isExpanded ? 0 : w)}
                >
                  <div className="flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold ${isExpanded ? 'bg-white/20 text-white' : 'bg-surface-container text-primary'}`}>
                      W{w}
                    </div>
                    <div>
                      <h3 className={`font-bold text-base ${isExpanded ? 'text-white' : 'text-on-surface'}`}>{ws.focus}</h3>
                      <p className={`text-xs ${isExpanded ? 'text-white/70' : 'text-on-surface-variant'}`}>{ws.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {isCurrent && <span className="text-[10px] font-bold bg-primary text-on-primary px-2 py-1 rounded-full">本周</span>}
                    <span className={`material-symbols-outlined ${isExpanded ? 'text-white' : 'text-on-surface-variant'}`}>
                      {isExpanded ? 'expand_less' : 'expand_more'}
                    </span>
                  </div>
                </div>

                {/* 展开内容 */}
                {isExpanded && (
                  <div className="p-5 space-y-6">

                    {/* 本周每日课表 */}
                    <div>
                      <div className="flex items-center gap-2 text-primary font-bold mb-3">
                        <span className="material-symbols-outlined text-base">calendar_month</span>
                        <span className="text-sm">本周每日课表</span>
                      </div>
                      <div className="grid grid-cols-4 gap-2">
                        {WEEK_DAYS.map((dayName, dayIndex) => {
                          const sopMonth = Math.ceil(tw / 4);
                          const sopWeek = ((tw - 1) % 4) + 1;
                          const dayId = `m${sopMonth}-w${sopWeek}-${dayIndex + 1}`;
                          const topic = ws.dailyTopics[dayIndex] ?? '今日学习';
                          return (
                            <button
                              key={dayIndex}
                              onClick={() => navigate(`/daily/${dayId}`)}
                              className="bg-surface-container hover:bg-surface-container-high transition-colors text-center py-3 px-1 rounded-xl flex flex-col items-center gap-1 active:scale-95"
                            >
                              <span className="text-[10px] text-on-surface-variant font-bold">{dayName}</span>
                              <span className="material-symbols-outlined text-primary text-lg">play_circle</span>
                              <span className="text-[9px] text-on-surface-variant leading-tight text-center line-clamp-2">{topic}</span>
                            </button>
                          );
                        })}
                      </div>
                    </div>

                    {/* 本周重点提示 */}
                    <div className="bg-tertiary-container/30 rounded-xl p-4 border-l-4 border-tertiary">
                      <div className="flex items-center gap-2 text-tertiary font-bold text-sm mb-2">
                        <span className="material-symbols-outlined text-base">tips_and_updates</span>
                        本周教学重点
                      </div>
                      <p className="text-on-surface text-sm">{ws.subtitle}</p>
                    </div>

                  </div>
                )}
              </div>
            );
          })}
        </section>

      </main>

      {/* 底部切换按钮 */}
      <div className="fixed bottom-0 left-0 w-full bg-surface/95 backdrop-blur-md px-6 py-5 border-t border-outline-variant/20 z-50">
        <button
          onClick={handleSwitchToWeek}
          className="w-full bg-primary hover:bg-primary/90 text-on-primary font-bold text-base py-4 rounded-full shadow-[0_8px_16px_rgba(0,104,121,0.2)] active:scale-95 transition-transform flex items-center justify-center gap-2"
        >
          <span className="material-symbols-outlined">sync_alt</span>
          切换到第 {activeCurriculumMonth} 个月 · 第 {expandedWeek} 周
        </button>
      </div>

    </div>
  );
}
