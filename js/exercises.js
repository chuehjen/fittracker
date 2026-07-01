// ===== Exercise Database =====
// Body parts, exercises, metadata (Nike dark theme — text-first)

export const BODY_PARTS = [
  { id: 'chest', name: '胸', color: '#32CD32' },
  { id: 'back', name: '背', color: '#e5e7eb' },
  { id: 'legs', name: '腿', color: '#f97316' },
  { id: 'shoulders', name: '肩', color: '#60a5fa' },
  { id: 'arms', name: '手臂', color: '#c084fc' },
  { id: 'core', name: '核心', color: '#fbbf24' }
];

export const EXERCISES = {
  chest: { machine: ['器械推胸','蝴蝶机夹胸','史密斯卧推','龙门架夹胸','器械下斜推胸'], free: ['平板杠铃卧推','上斜哑铃卧推','平板哑铃飞鸟','双杠臂屈伸','俯卧撑'] },
  back: { machine: ['高位下拉','坐姿划船','T 杆划船器','器械反向飞鸟','助力引体向上'], free: ['杠铃划船','哑铃单臂划船','引体向上','硬拉','哑铃俯身飞鸟'] },
  legs: { machine: ['腿举机','腿屈伸','腿弯举','史密斯深蹲','小腿提踵机'], free: ['杠铃深蹲','哑铃箭步蹲','罗马尼亚硬拉','保加利亚分腿蹲','壶铃摆壶'] },
  shoulders: { machine: ['器械肩推','器械侧平举','史密斯肩推','龙门架面拉','器械反向飞鸟'], free: ['哑铃肩推','哑铃侧平举','哑铃前平举','杠铃提拉','阿诺德推举'] },
  arms: { machine: ['绳索弯举','绳索下压','牧师凳弯举机','器械臂屈伸','龙门架锤式弯举'], free: ['杠铃弯举','哑铃锤式弯举','窄距卧推','颅骨粉碎者','哑铃集中弯举'] },
  core: { machine: ['器械卷腹','绳索卷腹','罗马椅背伸展','器械转体','悬垂举腿架'], free: ['平板支撑','卷腹','俄罗斯转体','死虫式','悬垂举腿'] }
};

export const EX_META = {
// --- 胸 ---
'器械推胸':{tip:'挺胸沉肩，推至手臂微屈'},
'蝴蝶机夹胸':{tip:'肘微屈，胸部发力夹紧'},
'史密斯卧推':{tip:'固定轨迹，适合新手'},
'龙门架夹胸':{tip:'恒定张力，峰值收缩'},
'器械下斜推胸':{tip:'下沿发力，沉肩收紧'},
'平板杠铃卧推':{tip:'经典胸部训练之王'},
'上斜哑铃卧推':{tip:'上胸发力，角度30-45°'},
'平板哑铃飞鸟':{tip:'大臂展开，微屈肘'},
'双杠臂屈伸':{tip:'前倾练胸，直立练三头'},
'俯卧撑':{tip:'核心收紧，身体成一线'},
// --- 背 ---
'高位下拉':{tip:'挺胸下拉至锁骨'},
'坐姿划船':{tip:'背部挺直，肘部贴身'},
'T 杆划船器':{tip:'俯身45°，拉至腹部'},
'器械反向飞鸟':{tip:'后束发力，控制速度'},
'助力引体向上':{tip:'背部发力，下巴过杠'},
'杠铃划船':{tip:'俯身拉杠至小腹'},
'哑铃单臂划船':{tip:'单侧背部集中刺激'},
'引体向上':{tip:'最佳背部自重训练'},
'硬拉':{tip:'全身力量之王'},
'哑铃俯身飞鸟':{tip:'俯身后束训练'},
// --- 腿 ---
'腿举机':{tip:'双脚与肩同宽，膝盖对准脚尖'},
'腿屈伸':{tip:'股四头肌孤立训练'},
'腿弯举':{tip:'腘绳肌孤立训练'},
'史密斯深蹲':{tip:'固定轨迹深蹲'},
'小腿提踵机':{tip:'全程控制，顶峰收缩'},
'杠铃深蹲':{tip:'核心收紧，蹲至平行'},
'哑铃箭步蹲':{tip:'前腿发力，躯干竖直'},
'罗马尼亚硬拉':{tip:'臀部后推，感受腘绳拉伸'},
'保加利亚分腿蹲':{tip:'后脚抬高，单腿深蹲'},
'壶铃摆壶':{tip:'髋关节铰链发力'},
// --- 肩 ---
'器械肩推':{tip:'固定轨迹，安全肩推'},
'器械侧平举':{tip:'肩部外展孤立训练'},
'史密斯肩推':{tip:'固定轨迹肩推'},
'龙门架面拉':{tip:'外旋肩袖强化'},
'哑铃肩推':{tip:'大臂平行开始'},
'哑铃侧平举':{tip:'微屈肘，控制下落'},
'哑铃前平举':{tip:'交替或双手前举'},
'杠铃提拉':{tip:'拉至锁骨高度'},
'阿诺德推举':{tip:'旋转推举全面刺激'},
// --- 臂 ---
'绳索弯举':{tip:'恒定张力弯举'},
'绳索下压':{tip:'三头肌孤立训练'},
'牧师凳弯举机':{tip:'孤立二头肌'},
'器械臂屈伸':{tip:'三头肌器械训练'},
'龙门架锤式弯举':{tip:'绳索锤式弯举'},
'杠铃弯举':{tip:'夹紧大臂'},
'哑铃锤式弯举':{tip:'前臂与二头同时刺激'},
'窄距卧推':{tip:'三头肌为主发力'},
'颅骨粉碎者':{tip:'仰卧臂屈伸'},
'哑铃集中弯举':{tip:'坐姿集中刺激二头'},
// --- 核心 ---
'器械卷腹':{tip:'腹肌器械孤立训练'},
'绳索卷腹':{tip:'恒定张力核心训练'},
'罗马椅背伸展':{tip:'下背部强化'},
'器械转体':{tip:'腹斜肌旋转训练'},
'悬垂举腿架':{tip:'下腹发力举腿'},
'平板支撑':{tip:'身体成直线'},
'卷腹':{tip:'基础核心训练'},
'俄罗斯转体':{tip:'腹斜肌旋转训练'},
'死虫式':{tip:'核心稳定训练'},
'悬垂举腿':{tip:'高级下腹训练'}
};

export function getExMeta(name) {
  return EX_META[name] || { tip: '' };
}

// ===== Exercise Detail Metadata (for selection screen) =====
// equipment: machine | dumbbell | barbell | cable | bodyweight | smith | other
// level: beginner | intermediate | advanced
// tags: 中文标签数组
// reason: 默认推荐理由（用于无历史记录时的展示）
export const EXERCISE_DETAILS = {
  // --- 胸 ---
  '器械推胸':       { equipment: 'machine',    target: '胸部主项', level: 'beginner',     tags: ['主项', '推', '稳定'],   reason: '固定轨迹，新手容易上手' },
  '蝴蝶机夹胸':     { equipment: 'machine',    target: '胸部内侧', level: 'beginner',     tags: ['孤立', '夹胸'],         reason: '安全孤立训练，适合补充胸部内侧' },
  '史密斯卧推':     { equipment: 'smith',      target: '胸部主项', level: 'beginner',     tags: ['推', '稳定'],           reason: '固定轨迹卧推，新手友好' },
  '龙门架夹胸':     { equipment: 'cable',      target: '胸部内侧', level: 'intermediate', tags: ['孤立', '夹胸'],         reason: '恒定张力，适合顶峰收缩训练' },
  '器械下斜推胸':   { equipment: 'machine',    target: '下胸',     level: 'beginner',     tags: ['推', '下胸'],           reason: '下胸孤立训练，动作稳定' },
  '平板杠铃卧推':   { equipment: 'barbell',    target: '胸部主项', level: 'intermediate', tags: ['主项', '推'],           reason: '适合作为胸部训练的第一个主项' },
  '上斜哑铃卧推':   { equipment: 'dumbbell',   target: '上胸',     level: 'intermediate', tags: ['推', '上胸'],           reason: '主练上胸，弥补平板卧推不足' },
  '平板哑铃飞鸟':   { equipment: 'dumbbell',   target: '胸部外侧', level: 'intermediate', tags: ['孤立', '拉伸'],         reason: '增加胸肌拉伸幅度，互补卧推动作' },
  '双杠臂屈伸':     { equipment: 'bodyweight', target: '下胸',     level: 'advanced',     tags: ['推', '自重'],           reason: '前倾练胸效果好，进阶自重动作' },
  '俯卧撑':         { equipment: 'bodyweight', target: '胸部主项', level: 'beginner',     tags: ['自重', '入门'],         reason: '零器械，随时可做的新手起点' },
  // --- 背 ---
  '高位下拉':       { equipment: 'cable',      target: '背阔肌',   level: 'beginner',     tags: ['主项', '拉', '稳定'],   reason: '新手友好，背阔肌主项首选' },
  '坐姿划船':       { equipment: 'cable',      target: '中背部',   level: 'beginner',     tags: ['拉', '稳定'],           reason: '动作稳定，适合学习背部发力' },
  'T 杆划船器':     { equipment: 'machine',    target: '中背部',   level: 'intermediate', tags: ['拉', '厚度'],           reason: '增加背部厚度，俯身角度易控' },
  '器械反向飞鸟':   { equipment: 'machine',    target: '背部后束', level: 'beginner',     tags: ['孤立', '后束'],         reason: '孤立后束，动作安全易上手' },
  '助力引体向上':   { equipment: 'machine',    target: '背阔肌',   level: 'beginner',     tags: ['拉', '入门'],           reason: '借助配重降低难度，适合过渡到自重引体' },
  '杠铃划船':       { equipment: 'barbell',    target: '背部主项', level: 'intermediate', tags: ['主项', '拉'],           reason: '适合作为背部训练的第一个主项' },
  '哑铃单臂划船':   { equipment: 'dumbbell',   target: '背阔肌',   level: 'beginner',     tags: ['拉', '单侧'],           reason: '单侧集中刺激，动作容易掌握' },
  '引体向上':       { equipment: 'bodyweight', target: '背阔肌',   level: 'advanced',     tags: ['主项', '自重'],         reason: '最佳背部自重训练，适合有一定基础后挑战' },
  '硬拉':           { equipment: 'barbell',    target: '背部主项', level: 'advanced',     tags: ['主项', '全身'],         reason: '全身力量之王，适合有经验后加入' },
  '哑铃俯身飞鸟':   { equipment: 'dumbbell',   target: '背部后束', level: 'intermediate', tags: ['孤立', '后束'],         reason: '俯身后束孤立训练，补充划船动作' },
  // --- 腿 ---
  '腿举机':         { equipment: 'machine',    target: '股四头肌', level: 'beginner',     tags: ['主项', '推', '稳定'],   reason: '固定轨迹，新手安全练腿首选' },
  '腿屈伸':         { equipment: 'machine',    target: '股四头肌', level: 'beginner',     tags: ['孤立'],                 reason: '股四头肌孤立训练，动作简单' },
  '腿弯举':         { equipment: 'machine',    target: '腘绳肌',   level: 'beginner',     tags: ['孤立'],                 reason: '腘绳肌孤立训练，平衡腿部前后发力' },
  '史密斯深蹲':     { equipment: 'smith',      target: '腿部主项', level: 'beginner',     tags: ['推', '稳定'],           reason: '固定轨迹深蹲，新手更易掌握平衡' },
  '小腿提踵机':     { equipment: 'machine',    target: '小腿',     level: 'beginner',     tags: ['孤立'],                 reason: '全程控制，强化小腿肌群' },
  '杠铃深蹲':       { equipment: 'barbell',    target: '腿部主项', level: 'intermediate', tags: ['主项', '推'],           reason: '适合作为腿部训练的第一个主项' },
  '哑铃箭步蹲':     { equipment: 'dumbbell',   target: '股四头肌', level: 'intermediate', tags: ['推', '单侧'],           reason: '单腿训练，改善左右力量不平衡' },
  '罗马尼亚硬拉':   { equipment: 'barbell',    target: '腘绳肌',   level: 'intermediate', tags: ['拉', '后链'],           reason: '感受腘绳拉伸，互补深蹲动作' },
  '保加利亚分腿蹲': { equipment: 'dumbbell',   target: '股四头肌', level: 'advanced',     tags: ['推', '单侧'],           reason: '后脚抬高单腿深蹲，适合进阶挑战' },
  '壶铃摆壶':       { equipment: 'other',      target: '腿部主项', level: 'intermediate', tags: ['髋铰链', '爆发力'],     reason: '髋关节铰链发力，强化臀腿爆发力' },
  // --- 肩 ---
  '器械肩推':       { equipment: 'machine',    target: '肩部主项', level: 'beginner',     tags: ['主项', '推', '稳定'],   reason: '固定轨迹，安全肩推首选' },
  '器械侧平举':     { equipment: 'machine',    target: '三角肌侧束', level: 'beginner',   tags: ['孤立'],                 reason: '肩部外展孤立训练，动作易控' },
  '史密斯肩推':     { equipment: 'smith',      target: '肩部主项', level: 'beginner',     tags: ['推', '稳定'],           reason: '固定轨迹肩推，新手友好' },
  '龙门架面拉':     { equipment: 'cable',      target: '肩袖肌群', level: 'beginner',     tags: ['孤立', '后束'],         reason: '强化肩袖外旋，预防肩部损伤' },
  '哑铃肩推':       { equipment: 'dumbbell',   target: '肩部主项', level: 'intermediate', tags: ['主项', '推'],           reason: '适合作为肩部训练的第一个主项' },
  '哑铃侧平举':     { equipment: 'dumbbell',   target: '三角肌侧束', level: 'beginner',   tags: ['孤立'],                 reason: '微屈肘控制下落，肩宽塑形动作' },
  '哑铃前平举':     { equipment: 'dumbbell',   target: '三角肌前束', level: 'beginner',   tags: ['孤立'],                 reason: '前束孤立训练，动作简单易学' },
  '杠铃提拉':       { equipment: 'barbell',    target: '三角肌前束', level: 'intermediate', tags: ['拉'],                 reason: '拉至锁骨高度，强化肩部上提力量' },
  '阿诺德推举':     { equipment: 'dumbbell',   target: '肩部主项', level: 'intermediate', tags: ['推', '旋转'],           reason: '旋转推举全面刺激三角肌各束' },
  // --- 臂 ---
  '绳索弯举':       { equipment: 'cable',      target: '二头肌',   level: 'beginner',     tags: ['孤立'],                 reason: '恒定张力弯举，适合二头肌主项' },
  '绳索下压':       { equipment: 'cable',      target: '三头肌',   level: 'beginner',     tags: ['孤立'],                 reason: '三头肌孤立训练，新手容易掌握' },
  '牧师凳弯举机':   { equipment: 'machine',    target: '二头肌',   level: 'beginner',     tags: ['孤立', '稳定'],         reason: '固定支撑孤立二头肌，避免借力' },
  '器械臂屈伸':     { equipment: 'machine',    target: '三头肌',   level: 'beginner',     tags: ['孤立', '稳定'],         reason: '三头肌器械训练，动作安全稳定' },
  '龙门架锤式弯举': { equipment: 'cable',      target: '肱桡肌',   level: 'intermediate', tags: ['孤立'],                 reason: '锤式弯举刺激前臂与肱桡肌' },
  '杠铃弯举':       { equipment: 'barbell',    target: '二头肌',   level: 'intermediate', tags: ['主项'],                 reason: '适合作为手臂训练的第一个主项' },
  '哑铃锤式弯举':   { equipment: 'dumbbell',   target: '肱桡肌',   level: 'beginner',     tags: ['孤立'],                 reason: '前臂与二头同时刺激，动作简单' },
  '窄距卧推':       { equipment: 'barbell',    target: '三头肌',   level: 'intermediate', tags: ['推', '复合'],           reason: '三头肌为主发力，兼顾胸部刺激' },
  '颅骨粉碎者':     { equipment: 'barbell',    target: '三头肌',   level: 'advanced',     tags: ['孤立'],                 reason: '仰卧臂屈伸，三头肌进阶孤立动作' },
  '哑铃集中弯举':   { equipment: 'dumbbell',   target: '二头肌',   level: 'beginner',     tags: ['孤立'],                 reason: '坐姿集中刺激二头肌峰值' },
  // --- 核心 ---
  '器械卷腹':       { equipment: 'machine',    target: '腹直肌',   level: 'beginner',     tags: ['孤立', '稳定'],         reason: '腹肌器械孤立训练，动作易控' },
  '绳索卷腹':       { equipment: 'cable',      target: '腹直肌',   level: 'intermediate', tags: ['孤立'],                 reason: '恒定张力核心训练，强度可调' },
  '罗马椅背伸展':   { equipment: 'machine',    target: '下背部',   level: 'intermediate', tags: ['后链'],                 reason: '下背部强化，平衡核心前后发力' },
  '器械转体':       { equipment: 'machine',    target: '腹斜肌',   level: 'beginner',     tags: ['孤立', '旋转'],         reason: '腹斜肌旋转训练，动作稳定安全' },
  '悬垂举腿架':     { equipment: 'machine',    target: '下腹',     level: 'intermediate', tags: ['孤立', '下腹'],         reason: '下腹发力举腿，借助支撑减少代偿' },
  '平板支撑':       { equipment: 'bodyweight', target: '核心主项', level: 'beginner',     tags: ['主项', '自重', '稳定'], reason: '零器械核心稳定训练，新手首选' },
  '卷腹':           { equipment: 'bodyweight', target: '腹直肌',   level: 'beginner',     tags: ['自重', '入门'],         reason: '基础核心训练，随时可做' },
  '俄罗斯转体':     { equipment: 'bodyweight', target: '腹斜肌',   level: 'intermediate', tags: ['旋转'],                 reason: '腹斜肌旋转训练，可负重增加强度' },
  '死虫式':         { equipment: 'bodyweight', target: '核心稳定', level: 'beginner',     tags: ['稳定', '自重'],         reason: '核心稳定训练，适合新手建立控制力' },
  '悬垂举腿':       { equipment: 'bodyweight', target: '下腹',     level: 'advanced',     tags: ['自重', '下腹'],         reason: '高级下腹训练，适合有一定基础后挑战' },
};

export const EQUIPMENT_LABELS = {
  machine: '固定器械',
  dumbbell: '哑铃',
  barbell: '杠铃',
  cable: '龙门架',
  bodyweight: '自重',
  smith: '史密斯',
  other: '其他',
};

export function getExerciseDetail(name, fallbackType) {
  return {
    equipment: fallbackType === 'machine' ? 'machine' : 'other',
    target: '',
    level: 'intermediate',
    tags: [],
    reason: '',
    ...(EXERCISE_DETAILS[name] || {}),
  };
}
