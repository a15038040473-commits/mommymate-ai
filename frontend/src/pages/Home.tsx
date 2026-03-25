import { useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';

// NOTE: 完整的年度 SOP 话题映射（与后端对齐）
interface WeekSOP {
  focus: string;
  subtitle: string;
  dailyTopics: string[];
}

const WEEKLY_SOP: Record<number, WeekSOP> = {
  1:  { focus: 's, a, t', subtitle: '摩擦音 s 的拉长练习', dailyTopics: ['「s」摩擦音 ssss - 像蛇叫', '「a」短元音 aaa - 张大嘴', '「t」清辅音 t-t-t - 轻弹舌', 'SAT 三音拼读合体', 'SAT 听音辨位游戏', '沙盘书写 s/a/t', 'SATPIN 本周成果检测'] },
  2:  { focus: 'p, i, n', subtitle: '爆破音 p 与短元音 i 辨析', dailyTopics: ['「p」爆破音 p-p-p', '「i」短元音 i-i-i', '「n」鼻音 nnn', 'PIN 三音拼读合体', 'PIN 听音辨位游戏', '沙盘书写 p/i/n', 'SATPIN 综合成果检测'] },
  3:  { focus: '复习 SATPIN', subtitle: '尝试第一个单词拼读: sat, tin', dailyTopics: ['sat 单词拼读练习', 'tin 单词拼读练习', 'SATPIN 单词分类游戏', 'sat/tin 口语句型', 'SATPIN 综合闯关游戏', 'SATPIN 沙盘书写大复习', 'SATPIN 里程碑检测'] },
  4:  { focus: '视觉词 I, a', subtitle: '结合已有口语: I see a...', dailyTopics: ['视觉词「I」高频认读', '视觉词「a」高频认读', '「I see a...」句型练习', '「I」「a」闪卡竞速', 'I see a... 指读绘本', '视觉词沙盘游戏', '视觉词本周成果检测'] },
  5:  { focus: 'm, d, g', subtitle: '喉音 g 的动作引导', dailyTopics: ['「m」嘴唇振动 mmm', '「d」弹舌音 d-d-d', '「g」青蛙喉音 ggg', 'MDG 三音拼读合体', 'MDG 听音辨位游戏', '沙盘书写 m/d/g', 'MDG 本周成果检测'] },
  6:  { focus: 'o, c, k', subtitle: '区分 c 和 k 发音相同', dailyTopics: ['「o」圆嘴短元音 ooo', '「c」清辅音（同 k）', '「k」清辅音（同 c）', 'OCK 词族拼读', 'c/k 同音辨形游戏', '沙盘书写 o/c/k', 'GOCK 本周成果检测'] },
  7:  { focus: '复习 M2 发音', subtitle: '玩"首音听音辨位"游戏', dailyTopics: ['首音辨位训练 Round 1', '首音辨位训练 Round 2', 'GOCK 高频词温习', 'GOCK 拼读综合游戏', 'GOCK 绘本指读练习', 'GOCK 沙盘大复习', 'GOCK 里程碑中测'] },
  8:  { focus: '视觉词 the, see', subtitle: '结合口语: I see the...', dailyTopics: ['视觉词「the」高频认读', '视觉词「see」高频认读', '「I see the...」句型', '「the/see」闪卡竞速', 'I see the... 指读绘本', '视觉词综合游戏', '视觉词本周成果检测'] },
  9:  { focus: 'e, u, r', subtitle: '短元音 e/u 多用 TPR 动作', dailyTopics: ['「e」短元音 eee', '「u」短元音 uuu', '「r」卷舌音 rrr', 'EUR 三音拼读合体', 'EUR 听音辨位游戏', '沙盘书写 e/u/r', 'EUR 本周成果检测'] },
  10: { focus: 'h, b, f, l', subtitle: 'b 和 d 的镜像区分', dailyTopics: ['「h」气流音 hhh', '「b」弹唇音（区分 d）', '「f」摩擦音 fff', '「l」舌尖振动 lll', 'hbfl 听音辨位游戏', '沙盘书写 h/b/f/l', 'HBFL 本周成果检测'] },
  11: { focus: 'j, v, w, x, y, z, q', subtitle: '生僻音快速过，建立印象', dailyTopics: ['「j」「v」快速认知', '「w」「x」快速认知', '「y」「z」「q」快速认知', '生僻音综合游戏', '26字母串联歌曲', '字母全套闪卡竞速', '26字母全覆盖检测'] },
  12: { focus: '26字母里程碑检测', subtitle: '看到 26 个字母能 1 秒说出发音', dailyTopics: ['字母 A-G 发音速测', '字母 H-N 发音速测', '字母 O-Z 发音速测', '全字母 Round 1', '全字母 Round 2', '错题回炉练习', '🏆 26字母里程碑检测'] },
  13: { focus: '-at 词族', subtitle: 'cat, mat, hat 拼读', dailyTopics: ['「cat」拼读', '「mat」拼读', '「hat」拼读', '-at 家族大集合', 'I see a cat. 课堂', '沙盘词族书写', '-at 词族成果检测'] },
  14: { focus: '-ap, -ad 词族', subtitle: 'map, cap, dad 拼读', dailyTopics: ['「map」「cap」拼读', '「dad」「bad」拼读', '-ap/-ad 对比', '拼读综合游戏', '短句练习', '沙盘词族书写', '-ap/-ad 成果检测'] },
  15: { focus: '-an, -am 词族', subtitle: 'fan, pan, jam 拼读', dailyTopics: ['「fan」「pan」拼读', '「jam」「ham」拼读', '-an/-am 对比', '拼读游戏', '短句表达', '沙盘词族书写', '-an/-am 成果检测'] },
  16: { focus: '视觉词 my, like', subtitle: '结合口语: I like my cat.', dailyTopics: ['「my」高频认读', '「like」高频认读', '「I like my...」句型', 'my/like + 词族', '指读绘本', '视觉词游戏', '视觉词成果检测'] },
  17: { focus: '-ig, -in 词族', subtitle: 'pig, big, bin 拼读', dailyTopics: ['「pig」「big」拼读', '「bin」「fin」拼读', '-ig/-in 对比', '拼读游戏', 'I see a pig. 课堂', '沙盘词族书写', '-ig/-in 成果检测'] },
  18: { focus: '-ip, -it 词族', subtitle: 'lip, sit, hit 拼读', dailyTopics: ['「lip」「tip」拼读', '「sit」「hit」拼读', '-ip/-it 对比', '拼读游戏', '短句练习', '沙盘词族书写', '-ip/-it 成果检测'] },
  19: { focus: '-ot, -op 词族', subtitle: 'hot, pot, hop 拼读', dailyTopics: ['「hot」「pot」拼读', '「hop」「top」拼读', '-ot/-op 对比', '拼读游戏', 'It is hot! 课堂', '沙盘词族书写', '-ot/-op 成果检测'] },
  20: { focus: '视觉词 can, go', subtitle: '短句: I can hop.', dailyTopics: ['「can」高频认读', '「go」高频认读', '「I can...」句型', 'can/go + 词族', '指读绘本', '视觉词游戏', '视觉词成果检测'] },
  21: { focus: '-en, -et 词族', subtitle: 'hen, ten, net 拼读', dailyTopics: ['「hen」「ten」拼读', '「net」「set」拼读', '-en/-et 对比', '拼读游戏', '-en/-et 短句', '沙盘词族书写', '-en/-et 成果检测'] },
  22: { focus: '-ug, -un 词族', subtitle: 'bug, mug, sun 拼读', dailyTopics: ['「bug」「mug」拼读', '「sun」「run」拼读', '-ug/-un 对比', '拼读游戏', '-ug/-un 短句', '沙盘词族书写', '-ug/-un 成果检测'] },
  23: { focus: '综合 CVC 混合训练', subtitle: '随机抽取 10 个词拼读', dailyTopics: ['a 系 CVC 综合', 'i/o 系 CVC 综合', 'e/u 系 CVC 综合', 'CVC 随机竞速', 'CVC 速度竞赛', 'CVC 沙盘拼词', 'CVC 综合成果检测'] },
  24: { focus: '里程碑: 拼读 50 CVC', subtitle: '能够独立拼读 50 个 CVC 单词', dailyTopics: ['a 系速测', 'i/o 系速测', 'e/u 系速测', '50词 Round 1', '50词 Round 2', '错题回炉', '🏆 CVC 里程碑检测'] },
  25: { focus: 'to, is, on, in', subtitle: '方位词结合实物游戏', dailyTopics: ['「to」日常对话', '「is」句型', '「on」方位游戏', '「in」方位游戏', 'on/in 对比', '指读绘本', '本周成果检测'] },
  26: { focus: 'he, she, we, me', subtitle: '家人角色扮演', dailyTopics: ['「he/she」代词', '「we」复数场景', '「me」自我介绍', '代词家庭游戏', '短句对话', '指读绘本', '本周成果检测'] },
  27: { focus: 'you, are, am', subtitle: '简单对话练习', dailyTopics: ['「you are」对话', '「I am」自我介绍', 'Are you...? 问答', '综合代词对话', '短句游戏', '指读绘本', '本周成果检测'] },
  28: { focus: '视觉词拼图游戏', subtitle: '快速反应练习', dailyTopics: ['高频词 Round 1', '高频词 Round 2', '拼图游戏 A', '拼图游戏 B', '速度抢卡', '综合复习', '本周成果检测'] },
  29: { focus: 'sh 二合字母', subtitle: 'hush, ship, shop 发音', dailyTopics: ['「sh」发音导入', '「ship」拼读', '「shop」拼读', 'sh 词族综合', '听音辨 sh/s', '沙盘书写 sh', 'sh 成果检测'] },
  30: { focus: 'ch 二合字母', subtitle: 'chip, chop, chin 发音', dailyTopics: ['「ch」发音导入', '「chip」拼读', '「chop」拼读', 'ch 词族综合', '听音辨 ch/sh', '沙盘书写 ch', 'ch 成果检测'] },
  31: { focus: 'th 二合字母', subtitle: 'this, that 清浊音区分', dailyTopics: ['「th」清音 think', '「th」浊音 this', 'th 清浊音对比', 'th 词族综合', '指读 th 句型', '沙盘书写 th', 'th 成果检测'] },
  32: { focus: '视觉词 said/have/for', subtitle: '高频词强化', dailyTopics: ['「said」认读', '「have」认读', '「for」认读', '三词造句', '指读绘本', '视觉词游戏', '本周成果检测'] },
  33: { focus: '句型练习 The [CVC] is [Adj]', subtitle: '形容词结合拼读词', dailyTopics: ['The cat is big.', 'The dog is hot.', '形容词词库扩展', '看图造句', '绘本指读', '综合造句游戏', '本周成果检测'] },
  34: { focus: '句型练习 I see the [CVC]', subtitle: '介词结合句型练习', dailyTopics: ['I see the bug.', 'on/in 介词造句', '复合句型游戏', '绘本指读', '句型造句大赛', '综合阅读', '本周成果检测'] },
  35: { focus: '视觉词 look/play/with', subtitle: '游戏化词汇强化', dailyTopics: ['「look」认读', '「play」认读', '「with」认读', '三词综合使用', '绘本指读', '视觉词游戏', '本周成果检测'] },
  36: { focus: '里程碑: 50 高频词', subtitle: '累计掌握 50 个高频词', dailyTopics: ['1-10 高频词速测', '11-25 高频词速测', '26-40 高频词速测', '41-50 高频词速测', '高频词游戏', '指读综合绘本', '🏆 50高频词里程碑'] },
  37: { focus: 'RAZ AA 精读第1周', subtitle: '侧重指读准确性', dailyTopics: ['绘本1 初读', '绘本1 跟读', '绘本2 初读', '绘本2 跟读', '两本对比', '句型提炼', '本周成果检测'] },
  38: { focus: 'RAZ AA 精读第2周', subtitle: '侧重指读准确性', dailyTopics: ['绘本3 初读', '绘本3 跟读', '绘本4 初读', '绘本4 跟读', '综合指读', '句型提炼', '本周成果检测'] },
  39: { focus: 'RAZ AA 精读第3周', subtitle: '指读 + 解码应用', dailyTopics: ['绘本5 初读', '绘本5 精读', '绘本6 初读', '绘本6 精读', '解码练习', '指读复习', '本周成果检测'] },
  40: { focus: 'RAZ AA 精读第4周', subtitle: '阅读流利度提升', dailyTopics: ['绘本综合回顾', '流利度计时', '句型整理', '角色扮演读', '指读评估', '创意延伸', '🏆 M10 里程碑'] },
  41: { focus: 'RAZ Level A 第1周', subtitle: '拼读解码的应用', dailyTopics: ['RAZ A 绘本初读', 'RAZ A 绘本跟读', '解码练习', '角色扮演读', '流利度练习', '综合指读', '本周成果检测'] },
  42: { focus: 'RAZ Level A 第2周', subtitle: '拼读解码的应用', dailyTopics: ['RAZ A 绘本初读', 'RAZ A 绘本跟读', '解码练习', '角色扮演读', '流利度练习', '综合指读', '本周成果检测'] },
  43: { focus: 'RAZ Level A 第3周', subtitle: '拼读解码的应用', dailyTopics: ['RAZ A 绘本初读', 'RAZ A 绘本跟读', '解码练习', '角色扮演读', '流利度练习', '综合指读', '本周成果检测'] },
  44: { focus: 'RAZ Level A 第4周', subtitle: '拼读解码的应用', dailyTopics: ['RAZ A 绘本初读', 'RAZ A 绘本跟读', '解码练习', '角色扮演读', '流利度练习', '综合指读', '本周成果检测'] },
  45: { focus: '综合阅读第1周', subtitle: '角色互换：让孩子给妈妈读', dailyTopics: ['绘本自读挑战', '角色互换阅读', '流利度提升', '朗读录制准备', '朗读录制', '综合复习', '🎉 年度成就总结'] },
  46: { focus: '综合阅读第2周', subtitle: '角色互换：建立阅读自信', dailyTopics: ['绘本自读挑战', '角色互换阅读', '流利度提升', '朗读录制', '综合回顾', '家庭分享', '🎉 年度成就总结'] },
  47: { focus: '综合阅读第3周', subtitle: '复述与表达', dailyTopics: ['绘本复述', '角色扮演', '创意续写', '朗读录制', '综合回顾', '家庭分享', '🎉 年度成就总结'] },
  48: { focus: '综合阅读第4周', subtitle: '🏆 年度大检测', dailyTopics: ['全年音素速测', '全年高频词速测', '绘本自主阅读', '阅读成就展示', '家庭颁奖仪式', '年度复盘', '🏆 MommyMate 年度毕业典礼'] },
};

function getWeekSOP(totalWeek: number): WeekSOP {
  const week = Math.max(1, Math.min(48, totalWeek));
  return WEEKLY_SOP[week] ?? { focus: `课程第${week}周`, subtitle: 'AI 动态生成', dailyTopics: Array(7).fill('今日学习') };
}

/** 从 totalWeek 转换为 SOP 显示用的月/周标签 */
function totalWeekToLabel(totalWeek: number): { month: number; week: number; label: string } {
  const w = Math.max(1, Math.min(48, totalWeek));
  const month = Math.ceil(w / 4);
  const week = ((w - 1) % 4) + 1;
  return { month, week, label: `第${month}个月 第${week}周` };
}

/** NOTE: 课程锚点日期 —— 2026-03-25 是第1周第1天 */
const CURRICULUM_START = new Date('2026-03-25T00:00:00');

/** 根据当前日期计算当前是课程第几周 (1-48) */
function getCurrentCurriculumTotalWeek(): number {
  const now = new Date();
  const msElapsed = now.getTime() - CURRICULUM_START.getTime();
  const weeksElapsed = Math.floor(msElapsed / (7 * 24 * 60 * 60 * 1000));
  return Math.max(1, Math.min(48, weeksElapsed + 1));
}

const DAY_ICONS = [
  { bgColor: 'bg-yellow-100', labelColor: 'text-tertiary', emoji: '☀️' },
  { bgColor: 'bg-red-100', labelColor: 'text-error', emoji: '🍎' },
  { bgColor: 'bg-orange-100', labelColor: 'text-tertiary', emoji: '🐯' },
  { bgColor: 'bg-blue-100', labelColor: 'text-primary', emoji: '💬' },
  { bgColor: 'bg-purple-100', labelColor: 'text-secondary', emoji: '🎧' },
  { bgColor: 'bg-green-100', labelColor: 'text-green-600', emoji: '✏️' },
  { bgColor: 'bg-white', labelColor: 'text-tertiary', emoji: '🏆', isSunday: true },
];

const WEEK_DAYS = ['周一', '周二', '周三', '周四', '周五', '周六', '周日'];

export default function Home() {
  const navigate = useNavigate();

  // activeTotalWeek: 当前查看的是课程第几周（1-48）
  const currentTotalWeek = getCurrentCurriculumTotalWeek();
  const [activeTotalWeek, setActiveTotalWeek] = useState(currentTotalWeek);

  useEffect(() => {
    // NOTE: 如果 localStorage 里有手动选择的周，恢复它；否则默认当前课程周
    const saved = localStorage.getItem('activeTotalWeek');
    if (saved) {
      setActiveTotalWeek(parseInt(saved, 10));
    }
  }, []);

  const switchToWeek = (totalWeek: number) => {
    setActiveTotalWeek(totalWeek);
    localStorage.setItem('activeTotalWeek', String(totalWeek));
  };

  const sop = getWeekSOP(activeTotalWeek);
  const { month, week, label } = totalWeekToLabel(activeTotalWeek);
  // day_id 沿用 m{month}-w{week}-{day} 格式（与后端对应）
  const getDayId = (dayIdx: number) => `m${month}-w${week}-${dayIdx + 1}`;

  // 更多周次：从当前查看的周开始，往后取 4 周（不超过 48 周）
  const nextWeeks = [1, 2, 3, 4]
    .map(offset => activeTotalWeek + offset)
    .filter(w => w <= 48);

  return (
    <div className="bg-background text-on-background font-body min-h-screen pb-32">

      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-cyan-50/80 backdrop-blur-xl shadow-sm shadow-cyan-900/5 flex justify-between items-center px-6 py-4 h-20">
        <div className="flex items-center gap-3">
          <span className="material-symbols-outlined text-cyan-700 text-3xl">auto_stories</span>
          <h1 className="font-lexend font-bold text-2xl tracking-tight text-cyan-800">{label}</h1>
        </div>
        <button
          onClick={() => navigate('/month')}
          className="w-12 h-12 rounded-full border-2 border-primary-container active:scale-95 transition-transform bg-secondary-container text-secondary font-bold text-lg flex items-center justify-center"
        >
          M
        </button>
      </header>

      <main className="pt-24 px-6 space-y-8">

        {/* Hero Section */}
        <section className="relative h-48 w-full bg-gradient-to-br from-primary-container to-surface-container-low rounded-lg overflow-hidden flex flex-col items-center justify-center text-center p-6 shadow-[0_8px_16px_-4px_rgba(20,29,33,0.08)]">
          <div className="relative z-10">
            <span className="inline-block px-4 py-1 bg-white/60 backdrop-blur-md rounded-full text-primary font-bold text-xs mb-3">
              {activeTotalWeek === currentTotalWeek ? '📍 本周课程' : `第 ${activeTotalWeek} 周`}
            </span>
            <h2 className="text-3xl font-black text-on-primary-container mb-1 tracking-tight">{sop.focus}</h2>
            <p className="text-on-surface-variant text-sm font-medium">{sop.subtitle}</p>
          </div>
          {/* 回到本周按钮（当查看非当前周时显示） */}
          {activeTotalWeek !== currentTotalWeek && (
            <button
              onClick={() => switchToWeek(currentTotalWeek)}
              className="absolute bottom-3 right-4 text-xs text-primary bg-white/70 backdrop-blur px-3 py-1.5 rounded-full font-bold flex items-center gap-1"
            >
              <span className="material-symbols-outlined text-[14px]">my_location</span>
              回到本周
            </button>
          )}
        </section>

        {/* Daily Card List */}
        <div className="space-y-4">
          {WEEK_DAYS.map((dayName, idx) => {
            const icon = DAY_ICONS[idx];
            const topic = sop.dailyTopics[idx] ?? '今日学习';
            const dayId = getDayId(idx);

            if (icon.isSunday) {
              return (
                <div key={idx} onClick={() => navigate(`/daily/${dayId}`)}
                  className="flex items-center gap-4 p-4 bg-gradient-to-br from-tertiary-container to-white rounded-lg shadow-[0_8px_16px_-4px_rgba(20,29,33,0.08)] active:scale-[0.98] transition-all cursor-pointer">
                  <div className={`flex-shrink-0 w-20 h-20 flex items-center justify-center ${icon.bgColor} rounded-lg text-4xl shadow-sm`}>{icon.emoji}</div>
                  <div className="flex-grow min-w-0">
                    <span className={`text-xs font-bold ${icon.labelColor} block mb-0.5`}>{dayName}</span>
                    <h3 className="text-lg font-bold text-on-surface">{topic}</h3>
                    <p className="text-xs text-on-surface-variant">获得本周的小勋章</p>
                  </div>
                  <button className="flex-shrink-0 bg-tertiary text-on-tertiary px-4 py-2 rounded-full text-xs font-bold active:scale-90 transition-transform whitespace-nowrap flex items-center gap-1">
                    <span>开始挑战</span>
                    <span className="material-symbols-outlined text-[14px]">workspace_premium</span>
                  </button>
                </div>
              );
            }

            return (
              <div key={idx} onClick={() => navigate(`/daily/${dayId}`)}
                className="flex items-center gap-4 p-4 bg-white rounded-lg shadow-[0_8px_16px_-4px_rgba(20,29,33,0.08)] active:scale-[0.98] transition-all cursor-pointer">
                <div className={`flex-shrink-0 w-20 h-20 flex items-center justify-center ${icon.bgColor} rounded-lg text-4xl shadow-inner`}>{icon.emoji}</div>
                <div className="flex-grow min-w-0">
                  <span className={`text-xs font-bold ${icon.labelColor} block mb-0.5`}>{dayName}</span>
                  <h3 className="text-lg font-bold text-on-surface truncate">{topic}</h3>
                  <p className="text-xs text-on-surface-variant">AI 定制 · 点击开始学习</p>
                </div>
                <button className="flex-shrink-0 bg-primary text-white px-4 py-2 rounded-full text-xs font-bold active:scale-90 transition-transform whitespace-nowrap">
                  去学习
                </button>
              </div>
            );
          })}
        </div>

        {/* 更多周次（未来课程，全部已解锁可预习） */}
        {nextWeeks.length > 0 && (
          <section className="py-6">
            <h4 className="text-lg font-bold text-on-surface mb-4 px-1">即将开始</h4>
            <div className="flex gap-4 overflow-x-auto pb-4 no-scrollbar -mx-1 px-1">
              {nextWeeks.map((tw, i) => {
                const nwSop = getWeekSOP(tw);
                const nwLabel = totalWeekToLabel(tw);
                return (
                  <button
                    key={i}
                    onClick={() => switchToWeek(tw)}
                    className="flex-none w-44 p-4 bg-surface-container-low rounded-lg border border-outline-variant/40 text-left hover:bg-surface-container hover:shadow-md hover:-translate-y-0.5 transition-all active:scale-[0.97]"
                  >
                    <span className="text-[10px] font-bold text-primary mb-1 block">{nwLabel.label}</span>
                    <p className="text-on-surface font-semibold text-sm line-clamp-2 leading-snug">{nwSop.focus}</p>
                    <div className="mt-3 flex items-center text-primary">
                      <span className="material-symbols-outlined text-[14px]">preview</span>
                      <span className="text-[10px] ml-1 font-bold">点击预习</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </section>
        )}

      </main>

      {/* Bottom Nav */}
      <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center bg-white/80 backdrop-blur-xl rounded-t-[2.5rem] px-8 py-4 shadow-[0_-8px_24px_rgba(20,29,33,0.06)]">
        <a className="flex items-center gap-2 bg-gradient-to-br from-cyan-600 to-cyan-400 text-white rounded-full px-6 py-2 shadow-lg shadow-cyan-500/20 active:scale-90 transition-all duration-300" href="#">
          <span className="material-symbols-outlined text-xl" style={{ fontVariationSettings: "'FILL' 1" }}>school</span>
          <span className="font-lexend font-bold text-sm">学习</span>
        </a>
        <button onClick={() => navigate('/month')}
          className="flex items-center gap-2 text-cyan-900/40 px-4 py-2 hover:text-cyan-600 active:scale-90 transition-all duration-300">
          <span className="material-symbols-outlined text-xl">auto_awesome</span>
          <span className="font-lexend font-medium text-sm">成长</span>
        </button>
      </nav>
    </div>
  );
}
