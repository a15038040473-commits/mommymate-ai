import os
import json
import re
from openai import OpenAI
from schema.content import DailyContent, WeeklyPlan

# 使用环境变量获取 API KEY（已配置默认值）
API_KEY = os.getenv("DEEPSEEK_API_KEY", "sk-e94fb548d4884c05914ced19e2477fc7")

PEDAGOGY_RULES = """请严格遵循以下美国幼教核心五大教学法：
1. 自然拼读法 (Phonics)：建立音素意识，如将单词拆分为 /k/ /a/ /t/。建议使用字母积木、沙盘等教具。
2. 视觉词 (Sight Words)：高频词（如 the, was）需通过闪卡游戏进行"一眼认出"训练。
3. 全身反应法 (TPR)：通过肢体动作将指令与语言挂钩。
4. 绘本朗读 (Read-Alouds)：强调互动式问题与阅读引导。
5. 沉浸式环境 (Environmental Print)：日常标签化环境和每日流程引导。
"""

# NOTE: 完整年度 48 周 SOP，key 为 totalWeek = (month-1)*4 + week
# value 为 7 天的每日精确学习话题（与前端完全对齐）
DAILY_TOPICS: dict[int, list[str]] = {
    # M1: SATPIN
    1:  ['「s」摩擦音 ssss - 像蛇叫', '「a」短元音 aaa - 张大嘴', '「t」清辅音 t-t-t - 轻弹舌', 'SAT 三音拼读合体', 'SAT 听音辨位游戏', '沙盘书写 s/a/t', 'SATPIN 本周成果检测'],
    2:  ['「p」爆破音 p-p-p', '「i」短元音 i-i-i', '「n」鼻音 nnn', 'PIN 三音拼读合体', 'PIN 听音辨位游戏', '沙盘书写 p/i/n', 'SATPIN 综合成果检测'],
    3:  ['sat 单词拼读练习', 'tin 单词拼读练习', 'SATPIN 单词分类游戏', 'sat/tin 口语句型', 'SATPIN 综合闯关游戏', 'SATPIN 沙盘书写大复习', 'SATPIN 里程碑检测'],
    4:  ['视觉词「I」高频认读', '视觉词「a」高频认读', '「I see a...」句型练习', '「I」「a」闪卡竞速', 'I see a... 指读绘本', '视觉词沙盘游戏', '视觉词本周成果检测'],
    # M2: GOCK
    5:  ['「m」嘴唇振动 mmm', '「d」弹舌音 d-d-d', '「g」青蛙喉音 ggg', 'MDG 三音拼读合体', 'MDG 听音辨位游戏', '沙盘书写 m/d/g', 'MDG 本周成果检测'],
    6:  ['「o」圆嘴短元音 ooo', '「c」清辅音（同 k）', '「k」清辅音（同 c）', 'OCK 词族拼读', 'c/k 同音辨形游戏', '沙盘书写 o/c/k', 'GOCK 本周成果检测'],
    7:  ['首音辨位训练 Round 1', '首音辨位训练 Round 2', 'GOCK 高频词温习', 'GOCK 拼读综合游戏', 'GOCK 绘本指读练习', 'GOCK 沙盘大复习', 'GOCK 里程碑中测'],
    8:  ['视觉词「the」高频认读', '视觉词「see」高频认读', '「I see the...」句型', '「the/see」闪卡竞速', 'I see the... 指读绘本', '视觉词综合游戏', '视觉词本周成果检测'],
    # M3: Rest of Alphabet
    9:  ['「e」短元音 eee - TPR 动作', '「u」短元音 uuu - TPR 动作', '「r」卷舌音 rrr', 'EUR 三音拼读合体', 'EUR 听音辨位游戏', '沙盘书写 e/u/r', 'EUR 本周成果检测'],
    10: ['「h」气流音 hhh', '「b」弹唇音 b-b-b（区分 d）', '「f」摩擦音 fff', '「l」舌尖振动 lll', 'hbfl 听音辨位游戏', '沙盘书写 h/b/f/l', 'HBFL 本周成果检测'],
    11: ['「j」「v」快速音认知', '「w」「x」快速音认知', '「y」「z」「q」快速音认知', '生僻音综合游戏', '26字母串联歌曲', '字母全套闪卡竞速', '26字母全覆盖检测'],
    12: ['字母 A-G 发音速测', '字母 H-N 发音速测', '字母 O-Z 发音速测', '全字母发音大挑战 Round 1', '全字母发音大挑战 Round 2', '字母错题回炉练习', '🏆 26字母里程碑检测'],
    # M4: 短元音 a 词族
    13: ['「cat」拼读练习', '「mat」拼读练习', '「hat」拼读练习', '-at 词族大集合', '-at 造句练习: I see a cat.', '沙盘词族书写', '-at 词族成果检测'],
    14: ['「map」「cap」拼读', '「dad」「bad」拼读', '-ap/-ad 词族对比', '拼读综合游戏', '-ap/-ad 短句练习', '沙盘词族书写', '-ap/-ad 成果检测'],
    15: ['「fan」「pan」拼读', '「jam」「ham」拼读', '-an/-am 词族对比', '拼读综合游戏', '-an/-am 短句练习', '沙盘词族书写', '-an/-am 成果检测'],
    16: ['视觉词「my」认读', '视觉词「like」认读', '「I like my cat.」句型', 'my/like 结合词族', '指读绘本练习', '视觉词综合游戏', '视觉词本周成果检测'],
    # M5: 短元音 i & o 词族
    17: ['「pig」「big」拼读', '「bin」「fin」拼读', '-ig/-in 词族对比', '拼读综合游戏', '-ig/-in 短句练习', '沙盘词族书写', '-ig/-in 成果检测'],
    18: ['「lip」「tip」拼读', '「sit」「hit」拼读', '-ip/-it 词族对比', '拼读综合游戏', '-ip/-it 短句练习', '沙盘词族书写', '-ip/-it 成果检测'],
    19: ['「hot」「pot」拼读', '「hop」「top」拼读', '-ot/-op 词族对比', '拼读综合游戏', 'It is hot! 句型', '沙盘词族书写', '-ot/-op 成果检测'],
    20: ['视觉词「can」认读', '视觉词「go」认读', '「I can hop.」句型', 'can/go 结合词族', '指读绘本练习', '视觉词综合游戏', '视觉词本周成果检测'],
    # M6: 短元音 e & u 词族
    21: ['「hen」「ten」拼读', '「net」「set」拼读', '-en/-et 词族对比', '拼读综合游戏', '-en/-et 短句练习', '沙盘词族书写', '-en/-et 成果检测'],
    22: ['「bug」「mug」拼读', '「sun」「run」拼读', '-ug/-un 词族对比', '拼读综合游戏', '-ug/-un 短句练习', '沙盘词族书写', '-ug/-un 成果检测'],
    23: ['a 系列 CVC 综合', 'i/o 系列 CVC 综合', 'e/u 系列 CVC 综合', 'CVC 随机拼读竞速', 'CVC 速度竞赛模式', 'CVC 沙盘拼词游戏', 'CVC 综合成果检测'],
    24: ['CVC a-系列速测', 'CVC i/o-系列速测', 'CVC e/u-系列速测', '50词大挑战 Round 1', '50词大挑战 Round 2', '拼读错题回炉', '🏆 CVC 里程碑大检测'],
    # M7: 高频词第一波
    25: ['高频词「to」日常对话', '高频词「is」句型练习', '高频词「on」方位游戏', '高频词「in」方位游戏', 'on/in 方位对比', '指读绘本练习', '本周成果检测'],
    26: ['代词「he/she」练习', '代词「we」复数场景', '代词「me」自我介绍', '代词家庭游戏', '代词短句对话', '指读绘本练习', '本周成果检测'],
    27: ['「you are」对话练习', '「I am」自我介绍', '问答 Are you...? 练习', '综合代词对话', '短句对话游戏', '指读绘本练习', '本周成果检测'],
    28: ['高频词第一波 Round 1 复习', '高频词第一波 Round 2 复习', '拼图游戏 Set A', '拼图游戏 Set B', '速度抢卡游戏', '综合复习巩固', '本周成果检测'],
    # M8: Digraphs
    29: ['「sh」二合字母导入', '「ship」ship 拼读', '「shop」shop 拼读', 'sh 词族综合练习', '听音辨 sh/s', '沙盘书写 sh', 'sh 本周成果检测'],
    30: ['「ch」二合字母导入', '「chip」chip 拼读', '「chop」chop 拼读', 'ch 词族综合练习', '听音辨 ch/sh', '沙盘书写 ch', 'ch 本周成果检测'],
    31: ['「th」清音 think/three', '「th」浊音 this/that', 'th 清浊音对比练习', 'th 词族综合练习', '指读含 th 的句型', '沙盘书写 th', 'th 本周成果检测'],
    32: ['高频词「said」认读', '高频词「have」认读', '高频词「for」认读', 'said/have/for 造句', '指读绘本', '视觉词游戏', '本周成果检测'],
    # M9: 短句阅读
    33: ['The cat is big. 句型', 'The dog is hot. 句型', '形容词词库扩展', '看图造句练习', '绘本互动指读', '综合造句游戏', '本周成果检测'],
    34: ['I see the bug. 句型', 'on/in 介词造句', '复合句型游戏', '绘本指读练习', '句型造句大赛', '综合阅读', '本周成果检测'],
    35: ['高频词「look」认读', '高频词「play」认读', '高频词「with」认读', 'look/play/with 造句', '绘本指读练习', '视觉词游戏', '本周成果检测'],
    36: ['高频词 1-10 速测', '高频词 11-25 速测', '高频词 26-40 速测', '高频词 41-50 速测', '高频词综合游戏', '指读综合绘本', '🏆 50高频词里程碑检测'],
    # M10-M12: RAZ 自主阅读
    37: ['RAZ AA 绘本1 初读', 'RAZ AA 绘本1 跟读', 'RAZ AA 绘本2 初读', 'RAZ AA 绘本2 跟读', '两本绘本对比', '句型提炼练习', '本周成果检测'],
    38: ['RAZ AA 绘本3 初读', 'RAZ AA 绘本3 跟读', 'RAZ AA 绘本4 初读', 'RAZ AA 绘本4 跟读', '综合指读练习', '句型提炼练习', '本周成果检测'],
    39: ['RAZ AA 绘本5 初读', 'RAZ AA 绘本5 精读', 'RAZ AA 绘本6 初读', 'RAZ AA 绘本6 精读', '解码应用练习', '指读复习', '本周成果检测'],
    40: ['绘本综合回顾', '流利度计时练习', '重点句型整理', '角色扮演阅读', '指读综合评估', '绘本创意延伸', '🏆 M10 里程碑检测'],
}


def get_daily_topic(month: int, week: int, day: int) -> str:
    """根据月/周/日获取具体的当天学习话题"""
    total_week = (month - 1) * 4 + week

    if total_week in DAILY_TOPICS and 1 <= day <= 7:
        return DAILY_TOPICS[total_week][day - 1]

    # M11: RAZ Level A
    if 41 <= total_week <= 44:
        day_topics_raz_a = ['RAZ A 绘本初读', 'RAZ A 绘本跟读', '解码应用练习', '角色扮演读', '流利度练习', '综合指读', '本周成果检测']
        return day_topics_raz_a[day - 1] if day <= 7 else 'RAZ 阅读'

    # M12: 自主阅读
    if 45 <= total_week <= 48:
        day_topics_m12 = ['绘本自读挑战', '角色互换读给妈妈', '流利度提升练习', '朗读录制准备', '朗读录制', '综合复习', '🎉 年度成就总结']
        return day_topics_m12[day - 1] if day <= 7 else '综合阅读'

    return f'第{month}月第{week}周第{day}天学习'


def get_client() -> OpenAI:
    return OpenAI(api_key=API_KEY, base_url="https://api.deepseek.com")


def generate_daily_content(day_id: str) -> DailyContent:
    """
    根据带状态的 day_id 生成该天的教学内容
    day_id 格式：m{month}-w{week}-{day} 如 m1-w1-1
    """
    import re as _re
    match = _re.match(r"m(\d+)-w(\d+)-(\d+)", day_id)
    if match:
        month, week, day = int(match.group(1)), int(match.group(2)), int(match.group(3))
        # NOTE: 精确获取该天的具体学习话题，与前端 SOP 映射完全对齐
        specific_topic = get_daily_topic(month, week, day)
        content_desc = f"第 {month} 个月第 {week} 周的第 {day} 天（{['周一','周二','周三','周四','周五','周六','周日'][day-1]}）。今天的精确教学主题是：【{specific_topic}】。请严格围绕此主题设计教案，不要偏离。"
    else:
        specific_topic = day_id
        content_desc = f"学习主题：{day_id}"

    if not API_KEY:
        return DailyContent(
            id=day_id,
            warmup_audio_keyword="Phonics Song",
            warmup_title="Phonics Song",
            core_task_text="AI生成出错，请配置有效的 DEEPSEEK_API_KEY。",
            core_sentences=["Look at this.", "Say it together."],
            review_text="稍后再试"
        )

    client = get_client()

    prompt = f"""
    请为4岁儿童设计一节英语启蒙每日微课堂。
    
    {content_desc}
    
    {PEDAGOGY_RULES}
    
    重要：请完全聚焦在【{specific_topic}】这个主题上生成内容，不要涉及其他辅音或话题。
    
    请返回如下 JSON（只返回纯 JSON，不带 markdown）：
    - warmup_audio_keyword: 适合此主题的儿歌 YouTube 搜索词（如 "Super Simple Songs letter S phonics"）
    - warmup_title: 热身儿歌标题
    - core_task_text: 核心教学操作指导语（基于此主题，包含 TPR/沙盘/积木等实操方法，100字以内，家长易读）
    - core_sentences: 2句适合家长和孩子说的英语互动短句（数组）
    - review_text: 课后复习引导语（基于教学法，50字以内）
    """

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "You are an expert early childhood English teacher. Generate ONLY content related to the specific topic requested."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        data = json.loads(response.choices[0].message.content)
        return DailyContent(
            id=day_id,
            warmup_audio_keyword=data.get("warmup_audio_keyword", "Kids Phonics Song"),
            warmup_title=data.get("warmup_title", specific_topic),
            core_task_text=data.get("core_task_text", ""),
            core_sentences=data.get("core_sentences", ["Let's learn together!", "Great job!"]),
            review_text=data.get("review_text", "")
        )
    except Exception as e:
        print(f"Error generating daily content from DeepSeek: {e}")
        return DailyContent(
            id=day_id,
            warmup_audio_keyword="phonics",
            warmup_title=specific_topic,
            core_task_text="内容生成失败，请重试。",
            core_sentences=["Please try again."],
            review_text="稍后再试"
        )


def generate_weekly_plan(month: int, week: int) -> WeeklyPlan:
    """根据给定的 SOP 生成周计划，精确匹配年度大纲"""
    total_week = (month - 1) * 4 + week

    # 从 DAILY_TOPICS 推导本周焦点
    if total_week in DAILY_TOPICS:
        topics = DAILY_TOPICS[total_week]
        week_focus = f"本周学习: {', '.join(topics[:3])}"
    else:
        week_focus = f"第{month}月第{week}周综合学习"

    if not API_KEY:
        return WeeklyPlan(month=month, week=week, focus=week_focus, resources=[], tips=[], indicators=[])

    client = get_client()

    daily_list = "\n".join([f"- 第{i+1}天: {t}" for i, t in enumerate(DAILY_TOPICS.get(total_week, []))])

    prompt = f"""
    请为4岁儿童规划 英语启蒙项目 第 {month} 个月 第 {week} 周 的学习资源和检验指标。
    本周每天的精确安排为：
{daily_list}
    
    请严格基于以上内容，返回如下 JSON：
    - focus: 本周核心目标（简短，不超过20字）
    - resources: 推荐2个与本周话题直接相关的 YouTube 搜索词（数组）
    - tips: 2条针对家长的具体操作建议（数组）
    - indicators: 3条本周效果验证行为检测项（数组）
    
    注意：只返回纯 JSON。
    """

    try:
        response = client.chat.completions.create(
            model="deepseek-chat",
            messages=[
                {"role": "system", "content": "You are a top-tier curriculum designer for children."},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        data = json.loads(response.choices[0].message.content)
        return WeeklyPlan(
            month=month,
            week=week,
            focus=data.get("focus", week_focus),
            resources=data.get("resources", []),
            tips=data.get("tips", []),
            indicators=data.get("indicators", [])
        )
    except Exception as e:
        print(f"Error generating weekly plan: {e}")
        return WeeklyPlan(month=month, week=week, focus=week_focus, resources=["加载失败"], tips=["加载失败"], indicators=["加载失败"])
