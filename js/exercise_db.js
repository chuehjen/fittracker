// ===== Exercise Detail Database =====
// 数据来源：yuhonas/free-exercise-db (public domain / Unlicense)
// 图片存放：img/exercises/{en_id}/{0|1}.jpg
// 中文教学步骤系人工整理，非机器直译，力求简洁准确

const MUSCLE_ZH = {
  chest: '胸肌',
  triceps: '肱三头肌',
  biceps: '肱二头肌',
  forearms: '前臂',
  shoulders: '三角肌',
  traps: '斜方肌',
  lats: '背阔肌',
  'middle back': '中背部',
  'lower back': '下背部',
  neck: '颈部',
  quadriceps: '股四头肌',
  hamstrings: '腘绳肌',
  glutes: '臀部',
  calves: '小腿',
  adductors: '大腿内收肌',
  abductors: '大腿外展肌',
  abdominals: '腹肌',
};

const LEVEL_ZH = {
  beginner: '入门',
  intermediate: '进阶',
  expert: '高阶',
};

const EQUIPMENT_ZH = {
  barbell: '杠铃',
  dumbbell: '哑铃',
  cable: '龙门架',
  machine: '固定器械',
  'body only': '徒手',
  kettlebells: '壶铃',
  bands: '弹力带',
  medicine_ball: '药球',
  'exercise ball': '瑜伽球',
  'e-z curl bar': 'EZ 杠',
  other: '其他',
};

// 每条 = { en_id, muscles_primary[], muscles_secondary[], equipment, level, images[], steps[] }
export const EXERCISE_DB = {
  // ===== 胸 =====
  '器械推胸': {
    en_id: 'Machine_Bench_Press',
    muscles_primary: ['chest'], muscles_secondary: ['shoulders', 'triceps'],
    equipment: 'machine', level: 'beginner',
    images: ['Machine_Bench_Press/0.jpg', 'Machine_Bench_Press/1.jpg'],
    steps: [
      '坐入器械，调整座椅高度，让握把与胸中部齐平。',
      '双手握住把手，沉肩挺胸，双脚踩稳地面。',
      '呼气推起，直至手臂接近伸直但不锁死。',
      '吸气缓慢回落，感受胸肌拉伸，重复动作。',
    ],
  },
  '蝴蝶机夹胸': {
    en_id: 'Butterfly',
    muscles_primary: ['chest'], muscles_secondary: ['shoulders'],
    equipment: 'machine', level: 'beginner',
    images: ['Butterfly/0.jpg', 'Butterfly/1.jpg'],
    steps: [
      '坐入蝴蝶机，背贴靠背，肘部放在护垫上并保持微屈。',
      '呼气用胸肌发力，将双肘向身体中线夹紧。',
      '在最紧张位停顿一秒，感受胸肌收缩。',
      '吸气缓慢还原至肩胛外展，注意控制离心速度。',
    ],
  },
  '史密斯卧推': {
    en_id: 'Smith_Machine_Bench_Press',
    muscles_primary: ['chest'], muscles_secondary: ['shoulders', 'triceps'],
    equipment: 'machine', level: 'beginner',
    images: ['Smith_Machine_Bench_Press/0.jpg', 'Smith_Machine_Bench_Press/1.jpg'],
    steps: [
      '躺在史密斯机下，双眼位于杠铃正下方。',
      '双手比肩略宽握杠，扭转解锁挂钩取下杠铃。',
      '吸气缓慢下放至胸中部，肘部约 45° 展开。',
      '呼气推起至手臂近乎伸直，重复动作。',
    ],
  },
  '龙门架夹胸': {
    en_id: 'Cable_Crossover',
    muscles_primary: ['chest'], muscles_secondary: ['shoulders'],
    equipment: 'cable', level: 'intermediate',
    images: ['Cable_Crossover/0.jpg', 'Cable_Crossover/1.jpg'],
    steps: [
      '将龙门架滑轮调至高位，双手各握一手柄。',
      '身体微前倾，一脚前一脚后保持稳定。',
      '肘部微屈，两手向身体前下方画弧线夹拢。',
      '在胸前顶峰收缩一秒，缓慢回到起始位。',
    ],
  },
  '器械下斜推胸': {
    en_id: 'Smith_Machine_Decline_Press',
    muscles_primary: ['chest'], muscles_secondary: ['triceps', 'shoulders'],
    equipment: 'machine', level: 'intermediate',
    images: ['Smith_Machine_Decline_Press/0.jpg', 'Smith_Machine_Decline_Press/1.jpg'],
    steps: [
      '将卧推凳设置为下斜角度，扣住脚踝防止下滑。',
      '双手比肩略宽握住史密斯杠，取下挂钩。',
      '吸气缓慢下放至下胸位置，肘略向体侧收。',
      '呼气用下胸发力推起，避免完全锁死肘关节。',
    ],
  },
  '平板杠铃卧推': {
    en_id: 'Barbell_Bench_Press_-_Medium_Grip',
    muscles_primary: ['chest'], muscles_secondary: ['shoulders', 'triceps'],
    equipment: 'barbell', level: 'intermediate',
    images: ['Barbell_Bench_Press_-_Medium_Grip/0.jpg', 'Barbell_Bench_Press_-_Medium_Grip/1.jpg'],
    steps: [
      '仰卧于平板卧推凳，双眼位于杠铃正下方。',
      '双手比肩略宽握杠，收紧肩胛下沉，脚踩地稳固。',
      '吸气缓慢下放杠铃至胸中部，肘约 45° 展开。',
      '呼气用胸推起至手臂接近伸直，重复动作。',
    ],
  },
  '上斜哑铃卧推': {
    en_id: 'Incline_Dumbbell_Press',
    muscles_primary: ['chest'], muscles_secondary: ['shoulders', 'triceps'],
    equipment: 'dumbbell', level: 'intermediate',
    images: ['Incline_Dumbbell_Press/0.jpg', 'Incline_Dumbbell_Press/1.jpg'],
    steps: [
      '将卧推凳调至 30-45° 上斜，双手各持一只哑铃坐下。',
      '躺下时用大腿把哑铃送到肩部两侧起始位。',
      '吸气缓慢下放，感受上胸拉伸至最大幅度。',
      '呼气用上胸发力推起，哑铃在顶部互不相撞。',
    ],
  },
  '平板哑铃飞鸟': {
    en_id: 'Dumbbell_Flyes',
    muscles_primary: ['chest'], muscles_secondary: ['shoulders'],
    equipment: 'dumbbell', level: 'intermediate',
    images: ['Dumbbell_Flyes/0.jpg', 'Dumbbell_Flyes/1.jpg'],
    steps: [
      '躺于平板凳，双手持哑铃举于胸口正上方，掌心相对。',
      '肘关节保持微屈固定角度，做出"抱树"姿态。',
      '吸气两臂缓慢向两侧打开，感受胸肌被充分拉伸。',
      '呼气用胸夹紧回到起始位，避免哑铃相撞。',
    ],
  },
  '双杠臂屈伸': {
    en_id: 'Dips_-_Chest_Version',
    muscles_primary: ['chest'], muscles_secondary: ['shoulders', 'triceps'],
    equipment: 'body only', level: 'expert',
    images: ['Dips_-_Chest_Version/0.jpg', 'Dips_-_Chest_Version/1.jpg'],
    steps: [
      '双手支撑于双杠上，身体前倾约 30°，双腿屈膝交叉。',
      '吸气缓慢下放，肘部外展，直至肩略低于肘。',
      '呼气用胸发力撑起，回到起始位。',
      '整个过程保持身体前倾以主要刺激胸肌。',
    ],
  },
  '俯卧撑': {
    en_id: 'Pushups',
    muscles_primary: ['chest'], muscles_secondary: ['shoulders', 'triceps', 'abdominals'],
    equipment: 'body only', level: 'beginner',
    images: ['Pushups/0.jpg', 'Pushups/1.jpg'],
    steps: [
      '俯撑于地面，双手比肩略宽，身体从头到脚保持一条直线。',
      '收紧核心和臀部，肘部略向体侧收 45°。',
      '吸气缓慢下放至胸接近地面。',
      '呼气用胸推起，回到起始位。',
    ],
  },

  // ===== 背 =====
  '高位下拉': {
    en_id: 'Wide-Grip_Lat_Pulldown',
    muscles_primary: ['lats'], muscles_secondary: ['biceps', 'middle back', 'shoulders'],
    equipment: 'cable', level: 'beginner',
    images: ['Wide-Grip_Lat_Pulldown/0.jpg', 'Wide-Grip_Lat_Pulldown/1.jpg'],
    steps: [
      '坐入高位下拉器，调整大腿护垫贴紧大腿。',
      '双手宽握横杆（比肩宽 1.5 倍），挺胸后仰约 15°。',
      '呼气用背阔肌发力，将横杆下拉至锁骨或胸口上方。',
      '吸气控制横杆缓慢回到手臂近乎伸直的起始位。',
    ],
  },
  '坐姿划船': {
    en_id: 'Seated_Cable_Rows',
    muscles_primary: ['middle back'], muscles_secondary: ['biceps', 'lats', 'shoulders'],
    equipment: 'cable', level: 'beginner',
    images: ['Seated_Cable_Rows/0.jpg', 'Seated_Cable_Rows/1.jpg'],
    steps: [
      '坐于坐姿划船器，双脚顶住踏板，膝盖微屈。',
      '双手握住 V 把手，背部挺直，肩胛下沉。',
      '呼气用背发力将手柄拉至腹部，肘贴身体。',
      '吸气控制手柄缓慢前送，感受背阔拉伸。',
    ],
  },
  'T 杆划船器': {
    en_id: 'T-Bar_Row_with_Handle',
    muscles_primary: ['middle back'], muscles_secondary: ['biceps', 'lats'],
    equipment: 'other', level: 'intermediate',
    images: ['T-Bar_Row_with_Handle/0.jpg', 'T-Bar_Row_with_Handle/1.jpg'],
    steps: [
      '双脚跨立于 T 杆两侧，膝盖微屈，俯身约 45°。',
      '双手握把手，腰背挺直不塌腰。',
      '呼气用背拉起把手至腹部下方。',
      '吸气缓慢下放，感受背部拉伸，保持核心稳定。',
    ],
  },
  '器械反向飞鸟': {
    en_id: 'Reverse_Machine_Flyes',
    muscles_primary: ['shoulders'], muscles_secondary: ['middle back'],
    equipment: 'machine', level: 'beginner',
    images: ['Reverse_Machine_Flyes/0.jpg', 'Reverse_Machine_Flyes/1.jpg'],
    steps: [
      '面朝反向飞鸟器坐下，胸靠护垫，双手握把手。',
      '肘部微屈保持固定角度。',
      '呼气用后束发力将双臂向两侧打开。',
      '在顶峰收缩一秒，吸气缓慢还原。',
    ],
  },
  '助力引体向上': {
    en_id: 'Band_Assisted_Pull-Up',
    muscles_primary: ['lats'], muscles_secondary: ['biceps', 'middle back'],
    equipment: 'other', level: 'beginner',
    images: ['Band_Assisted_Pull-Up/0.jpg', 'Band_Assisted_Pull-Up/1.jpg'],
    steps: [
      '将弹力带套在单杠上，另一端踩在脚下（或膝盖）。',
      '双手正握杠铃，肩胛下沉激活背阔肌。',
      '呼气拉起身体至下巴过杠。',
      '吸气缓慢下降至手臂完全伸直，保持背部张力。',
    ],
  },
  '杠铃划船': {
    en_id: 'Bent_Over_Barbell_Row',
    muscles_primary: ['middle back'], muscles_secondary: ['biceps', 'lats', 'shoulders'],
    equipment: 'barbell', level: 'intermediate',
    images: ['Bent_Over_Barbell_Row/0.jpg', 'Bent_Over_Barbell_Row/1.jpg'],
    steps: [
      '双脚与肩同宽站立，屈髋俯身至躯干约 45°，腰背挺直。',
      '双手比肩略宽正握杠铃，手臂自然下垂。',
      '呼气用背发力将杠铃拉至小腹，肘部贴身。',
      '吸气缓慢下放至起始位，全程保持腰背中立。',
    ],
  },
  '哑铃单臂划船': {
    en_id: 'One-Arm_Dumbbell_Row',
    muscles_primary: ['middle back'], muscles_secondary: ['biceps', 'lats', 'shoulders'],
    equipment: 'dumbbell', level: 'beginner',
    images: ['One-Arm_Dumbbell_Row/0.jpg', 'One-Arm_Dumbbell_Row/1.jpg'],
    steps: [
      '一手一膝支撑在平板凳上，另一手持哑铃自然下垂。',
      '背部保持中立，腰不塌不弓。',
      '呼气用背发力将哑铃拉至髋部旁，肘贴身体。',
      '吸气缓慢下放，重复完成一侧再换边。',
    ],
  },
  '引体向上': {
    en_id: 'Pullups',
    muscles_primary: ['lats'], muscles_secondary: ['biceps', 'middle back', 'shoulders'],
    equipment: 'body only', level: 'expert',
    images: ['Pullups/0.jpg', 'Pullups/1.jpg'],
    steps: [
      '双手正握单杠，比肩略宽，手臂完全伸直悬垂。',
      '肩胛下沉激活背阔肌，双腿屈膝交叉。',
      '呼气用背发力拉起身体至下巴过杠。',
      '吸气缓慢下降至完全悬垂，避免利用惯性摆动。',
    ],
  },
  '硬拉': {
    en_id: 'Barbell_Deadlift',
    muscles_primary: ['lower back'], muscles_secondary: ['glutes', 'hamstrings', 'quadriceps', 'lats', 'traps', 'forearms'],
    equipment: 'barbell', level: 'intermediate',
    images: ['Barbell_Deadlift/0.jpg', 'Barbell_Deadlift/1.jpg'],
    steps: [
      '双脚与髋同宽，杠铃在脚背中央上方。',
      '屈髋屈膝下蹲，双手比肩略窄握杠，挺胸腰背中立。',
      '呼气腿臀同时发力站起，杠铃贴腿上行。',
      '锁定髋部后吸气以铰链发力缓慢下放，重复动作。',
    ],
  },
  '哑铃俯身飞鸟': {
    en_id: 'Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench',
    muscles_primary: ['shoulders'], muscles_secondary: ['middle back'],
    equipment: 'dumbbell', level: 'beginner',
    images: ['Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench/0.jpg', 'Bent_Over_Dumbbell_Rear_Delt_Raise_With_Head_On_Bench/1.jpg'],
    steps: [
      '前额抵住上斜卧推凳，双手各持一只哑铃自然下垂。',
      '肘部保持微屈，掌心相对。',
      '呼气用后束发力将双臂向两侧张开至与地面平行。',
      '吸气缓慢下放，避免借助腰部摆动发力。',
    ],
  },

  // ===== 腿 =====
  '腿举机': {
    en_id: 'Leg_Press',
    muscles_primary: ['quadriceps'], muscles_secondary: ['glutes', 'hamstrings', 'calves'],
    equipment: 'machine', level: 'beginner',
    images: ['Leg_Press/0.jpg', 'Leg_Press/1.jpg'],
    steps: [
      '坐入腿举机，双脚与肩同宽踩踏板中部，膝盖对准脚尖。',
      '解锁安全销，双手握把稳定躯干。',
      '吸气缓慢屈膝下放至大腿与踏板约 90°。',
      '呼气用腿发力蹬起，膝关节不要完全锁死。',
    ],
  },
  '腿屈伸': {
    en_id: 'Leg_Extensions',
    muscles_primary: ['quadriceps'], muscles_secondary: [],
    equipment: 'machine', level: 'beginner',
    images: ['Leg_Extensions/0.jpg', 'Leg_Extensions/1.jpg'],
    steps: [
      '坐入腿屈伸机，调整靠垫使膝盖与转轴对齐。',
      '踝部护垫压在小腿下端，双手握把稳定。',
      '呼气用股四头肌发力将小腿伸直至顶点。',
      '顶峰收缩一秒，吸气缓慢还原。',
    ],
  },
  '腿弯举': {
    en_id: 'Lying_Leg_Curls',
    muscles_primary: ['hamstrings'], muscles_secondary: ['calves'],
    equipment: 'machine', level: 'beginner',
    images: ['Lying_Leg_Curls/0.jpg', 'Lying_Leg_Curls/1.jpg'],
    steps: [
      '俯卧于腿弯举机，膝盖略超出靠垫边缘。',
      '踝部护垫贴紧跟腱上方，双手握把。',
      '呼气用腘绳肌发力将小腿卷向臀部。',
      '吸气缓慢下放至腿近乎伸直，保持全程控制。',
    ],
  },
  '史密斯深蹲': {
    en_id: 'Smith_Machine_Squat',
    muscles_primary: ['quadriceps'], muscles_secondary: ['glutes', 'hamstrings', 'calves'],
    equipment: 'machine', level: 'beginner',
    images: ['Smith_Machine_Squat/0.jpg', 'Smith_Machine_Squat/1.jpg'],
    steps: [
      '将史密斯杠放于斜方肌上部，双脚与肩同宽略前踩。',
      '扭转解锁挂钩，站直取下杠铃。',
      '吸气屈髋屈膝缓慢下蹲，大腿至少平行地面。',
      '呼气腿臀发力站起，膝盖对准脚尖方向。',
    ],
  },
  '小腿提踵机': {
    en_id: 'Standing_Calf_Raises',
    muscles_primary: ['calves'], muscles_secondary: [],
    equipment: 'machine', level: 'beginner',
    images: ['Standing_Calf_Raises/0.jpg', 'Standing_Calf_Raises/1.jpg'],
    steps: [
      '肩膀顶在小腿提踵机护垫下，前脚掌踩踏板边缘。',
      '双腿伸直，脚跟悬于踏板外。',
      '呼气踮起脚跟至最高点，顶峰收缩一秒。',
      '吸气缓慢下放，感受小腿充分拉伸。',
    ],
  },
  '杠铃深蹲': {
    en_id: 'Barbell_Squat',
    muscles_primary: ['quadriceps'], muscles_secondary: ['glutes', 'hamstrings', 'calves', 'lower back'],
    equipment: 'barbell', level: 'intermediate',
    images: ['Barbell_Squat/0.jpg', 'Barbell_Squat/1.jpg'],
    steps: [
      '将杠铃架于斜方肌上部，双手握杠比肩略宽。',
      '双脚与肩同宽，脚尖略外八，收紧核心。',
      '吸气屈髋屈膝下蹲，大腿至少平行地面。',
      '呼气腿臀发力站起，膝盖对准脚尖方向。',
    ],
  },
  '哑铃箭步蹲': {
    en_id: 'Dumbbell_Lunges',
    muscles_primary: ['quadriceps'], muscles_secondary: ['glutes', 'hamstrings', 'calves'],
    equipment: 'dumbbell', level: 'intermediate',
    images: ['Dumbbell_Lunges/0.jpg', 'Dumbbell_Lunges/1.jpg'],
    steps: [
      '双手各持一只哑铃自然下垂于体侧，躯干竖直。',
      '向前迈出一大步，前腿膝盖弯曲约 90°。',
      '后膝下降至距地面约 5cm，前腿膝盖不超脚尖。',
      '呼气前腿发力蹬起还原，交替换腿。',
    ],
  },
  '罗马尼亚硬拉': {
    en_id: 'Romanian_Deadlift',
    muscles_primary: ['hamstrings'], muscles_secondary: ['glutes', 'lower back', 'lats'],
    equipment: 'barbell', level: 'intermediate',
    images: ['Romanian_Deadlift/0.jpg', 'Romanian_Deadlift/1.jpg'],
    steps: [
      '双脚与髋同宽，双手比肩略宽握杠，站直起始。',
      '膝盖保持微屈固定角度，臀部向后推。',
      '吸气缓慢下放杠铃贴腿至胫骨中段，感受腘绳拉伸。',
      '呼气用臀腿发力还原至站直位，杠铃始终贴腿。',
    ],
  },
  '保加利亚分腿蹲': {
    en_id: 'Dumbbell_Rear_Lunge',
    muscles_primary: ['quadriceps'], muscles_secondary: ['glutes', 'hamstrings'],
    equipment: 'dumbbell', level: 'expert',
    images: ['Dumbbell_Rear_Lunge/0.jpg', 'Dumbbell_Rear_Lunge/1.jpg'],
    steps: [
      '双手持哑铃于体侧，一只后脚脚背搭在身后长凳上。',
      '前脚离凳约一大步距离，躯干竖直。',
      '吸气屈前腿下蹲至大腿平行地面，膝盖对齐脚尖。',
      '呼气前腿发力蹬起还原，完成一侧再换边。',
    ],
  },
  '壶铃摆壶': {
    en_id: 'One-Arm_Kettlebell_Swings',
    muscles_primary: ['hamstrings'], muscles_secondary: ['glutes', 'lower back', 'shoulders'],
    equipment: 'kettlebells', level: 'intermediate',
    images: ['One-Arm_Kettlebell_Swings/0.jpg', 'One-Arm_Kettlebell_Swings/1.jpg'],
    steps: [
      '双脚与肩同宽，一手持壶铃于身前。',
      '屈髋后推，壶铃在两腿间自然后摆。',
      '呼气用臀腿爆发发力，将壶铃甩至胸前高度。',
      '吸气顺势让壶铃回摆，进入下一次髋铰链。',
    ],
  },

  // ===== 肩 =====
  '器械肩推': {
    en_id: 'Leverage_Shoulder_Press',
    muscles_primary: ['shoulders'], muscles_secondary: ['triceps'],
    equipment: 'machine', level: 'beginner',
    images: ['Leverage_Shoulder_Press/0.jpg', 'Leverage_Shoulder_Press/1.jpg'],
    steps: [
      '坐入器械肩推机，调整座椅高度使把手与肩齐。',
      '双手握把手，背贴靠垫，双脚踩稳。',
      '呼气用肩部发力将把手向上推起至手臂近乎伸直。',
      '吸气缓慢回落至起始位，保持全程控制。',
    ],
  },
  '器械侧平举': {
    en_id: 'Cable_Seated_Lateral_Raise',
    muscles_primary: ['shoulders'], muscles_secondary: [],
    equipment: 'cable', level: 'beginner',
    images: ['Cable_Seated_Lateral_Raise/0.jpg', 'Cable_Seated_Lateral_Raise/1.jpg'],
    steps: [
      '坐于低位龙门架前，一手握手柄，绳索交叉至对侧膝下。',
      '肘部保持微屈固定角度。',
      '呼气用三角肌侧束将手臂向体侧上抬至肩高。',
      '吸气缓慢下放，避免使用躯干代偿。',
    ],
  },
  '史密斯肩推': {
    en_id: 'Smith_Machine_Overhead_Shoulder_Press',
    muscles_primary: ['shoulders'], muscles_secondary: ['triceps'],
    equipment: 'machine', level: 'beginner',
    images: ['Smith_Machine_Overhead_Shoulder_Press/0.jpg', 'Smith_Machine_Overhead_Shoulder_Press/1.jpg'],
    steps: [
      '将卧推凳设为竖直坐姿并放于史密斯机内。',
      '双手比肩略宽握杠，起始位于锁骨上方。',
      '呼气用肩发力将杠铃向上推起至手臂近乎伸直。',
      '吸气缓慢下放至起始位，避免下放过低伤肩。',
    ],
  },
  '龙门架面拉': {
    en_id: 'Face_Pull',
    muscles_primary: ['shoulders'], muscles_secondary: ['middle back'],
    equipment: 'cable', level: 'beginner',
    images: ['Face_Pull/0.jpg', 'Face_Pull/1.jpg'],
    steps: [
      '将龙门架滑轮调至面部高度，装绳索把手。',
      '双手正握绳索两端，后退至绳索完全绷紧。',
      '呼气将绳索拉向面部，肘部高于肩，外旋肩关节。',
      '吸气缓慢还原，感受后束及肩袖肌群参与。',
    ],
  },
  '哑铃肩推': {
    en_id: 'Seated_Dumbbell_Press',
    muscles_primary: ['shoulders'], muscles_secondary: ['triceps'],
    equipment: 'dumbbell', level: 'intermediate',
    images: ['Seated_Dumbbell_Press/0.jpg', 'Seated_Dumbbell_Press/1.jpg'],
    steps: [
      '坐于竖直靠背凳，双手各持哑铃举至肩两侧，掌心朝前。',
      '沉肩挺胸，收紧核心稳定躯干。',
      '呼气用肩推起哑铃至头顶近乎伸直，避免哑铃相撞。',
      '吸气缓慢下放至肩两侧起始位，重复动作。',
    ],
  },
  '哑铃侧平举': {
    en_id: 'Side_Lateral_Raise',
    muscles_primary: ['shoulders'], muscles_secondary: [],
    equipment: 'dumbbell', level: 'beginner',
    images: ['Side_Lateral_Raise/0.jpg', 'Side_Lateral_Raise/1.jpg'],
    steps: [
      '双脚与肩同宽站立，双手各持一只哑铃于体侧。',
      '肘部微屈固定角度，躯干挺直。',
      '呼气用侧束发力将双臂向两侧抬起至与地面平行。',
      '吸气缓慢下放至起始位，避免借助身体摆动。',
    ],
  },
  '哑铃前平举': {
    en_id: 'Front_Dumbbell_Raise',
    muscles_primary: ['shoulders'], muscles_secondary: [],
    equipment: 'dumbbell', level: 'beginner',
    images: ['Front_Dumbbell_Raise/0.jpg', 'Front_Dumbbell_Raise/1.jpg'],
    steps: [
      '双手各持一只哑铃于大腿前方，掌心朝身体。',
      '肘部保持微屈固定角度，核心收紧。',
      '呼气用前束将一只手臂前抬至肩高。',
      '吸气缓慢下放，另一侧交替执行。',
    ],
  },
  '杠铃提拉': {
    en_id: 'Upright_Barbell_Row',
    muscles_primary: ['shoulders'], muscles_secondary: ['traps', 'biceps'],
    equipment: 'barbell', level: 'intermediate',
    images: ['Upright_Barbell_Row/0.jpg', 'Upright_Barbell_Row/1.jpg'],
    steps: [
      '双手窄握杠铃于大腿前方，掌心朝身体。',
      '躯干挺直，双脚与肩同宽。',
      '呼气用肩带发力将杠铃沿身体上提至锁骨高度，肘高于手。',
      '吸气缓慢下放至起始位，避免耸肩。',
    ],
  },
  '阿诺德推举': {
    en_id: 'Arnold_Dumbbell_Press',
    muscles_primary: ['shoulders'], muscles_secondary: ['triceps'],
    equipment: 'dumbbell', level: 'intermediate',
    images: ['Arnold_Dumbbell_Press/0.jpg', 'Arnold_Dumbbell_Press/1.jpg'],
    steps: [
      '坐于竖直靠背凳，双手持哑铃于胸前，掌心朝身体。',
      '推起哑铃时同时向外旋转手腕，顶点掌心朝前。',
      '吸气反向下放，手腕旋回胸前掌心朝身体位置。',
      '整个过程流畅连贯，全面刺激三角肌各束。',
    ],
  },

  // ===== 臂 =====
  '绳索弯举': {
    en_id: 'Standing_Biceps_Cable_Curl',
    muscles_primary: ['biceps'], muscles_secondary: ['forearms'],
    equipment: 'cable', level: 'beginner',
    images: ['Standing_Biceps_Cable_Curl/0.jpg', 'Standing_Biceps_Cable_Curl/1.jpg'],
    steps: [
      '面朝低位龙门架站立，双手握直杆或短杆手柄。',
      '大臂夹紧体侧，肘部固定不前后移动。',
      '呼气用二头发力将手柄弯举至胸前。',
      '吸气缓慢下放至手臂近乎伸直，全程恒定张力。',
    ],
  },
  '绳索下压': {
    en_id: 'Triceps_Pushdown',
    muscles_primary: ['triceps'], muscles_secondary: [],
    equipment: 'cable', level: 'beginner',
    images: ['Triceps_Pushdown/0.jpg', 'Triceps_Pushdown/1.jpg'],
    steps: [
      '面朝高位龙门架站立，双手握直杆或 V 杆。',
      '大臂夹紧体侧，肘部固定不前后移动。',
      '呼气用三头发力将手柄下压至手臂完全伸直。',
      '吸气缓慢还原至手柄回到胸前起始位。',
    ],
  },
  '牧师凳弯举机': {
    en_id: 'Machine_Preacher_Curls',
    muscles_primary: ['biceps'], muscles_secondary: ['forearms'],
    equipment: 'machine', level: 'beginner',
    images: ['Machine_Preacher_Curls/0.jpg', 'Machine_Preacher_Curls/1.jpg'],
    steps: [
      '坐入牧师凳弯举机，胸靠护垫，大臂放在斜面上。',
      '双手握把手，手臂近乎伸直起始。',
      '呼气用二头发力弯举把手至最高点。',
      '吸气缓慢下放，避免手臂完全伸直借力。',
    ],
  },
  '器械臂屈伸': {
    en_id: 'Cable_Rope_Overhead_Triceps_Extension',
    muscles_primary: ['triceps'], muscles_secondary: [],
    equipment: 'cable', level: 'beginner',
    images: ['Cable_Rope_Overhead_Triceps_Extension/0.jpg', 'Cable_Rope_Overhead_Triceps_Extension/1.jpg'],
    steps: [
      '将龙门架滑轮调至低位或高位，装绳索。',
      '双手握绳索两端，转身背对滑轮，绳索经过头顶。',
      '大臂夹紧头两侧固定，肘部不前后移动。',
      '呼气用三头将绳索推至手臂完全伸直，吸气缓慢还原。',
    ],
  },
  '龙门架锤式弯举': {
    en_id: 'Cable_Hammer_Curls_-_Rope_Attachment',
    muscles_primary: ['biceps'], muscles_secondary: ['forearms'],
    equipment: 'cable', level: 'intermediate',
    images: ['Cable_Hammer_Curls_-_Rope_Attachment/0.jpg', 'Cable_Hammer_Curls_-_Rope_Attachment/1.jpg'],
    steps: [
      '面朝低位龙门架站立，双手握绳索两端，掌心相对。',
      '大臂夹紧体侧，肘部固定。',
      '呼气用二头和肱桡肌发力将绳索弯举至胸前。',
      '吸气缓慢下放至手臂近乎伸直，重复动作。',
    ],
  },
  '杠铃弯举': {
    en_id: 'Barbell_Curl',
    muscles_primary: ['biceps'], muscles_secondary: ['forearms'],
    equipment: 'barbell', level: 'intermediate',
    images: ['Barbell_Curl/0.jpg', 'Barbell_Curl/1.jpg'],
    steps: [
      '双脚与肩同宽站立，双手比肩略窄反握杠铃。',
      '大臂夹紧体侧，肘部固定不前后移动。',
      '呼气用二头发力将杠铃弯举至胸前。',
      '吸气缓慢下放至手臂近乎伸直，避免用腰借力。',
    ],
  },
  '哑铃锤式弯举': {
    en_id: 'Hammer_Curls',
    muscles_primary: ['biceps'], muscles_secondary: ['forearms'],
    equipment: 'dumbbell', level: 'beginner',
    images: ['Hammer_Curls/0.jpg', 'Hammer_Curls/1.jpg'],
    steps: [
      '双脚与肩同宽站立，双手各持哑铃于体侧，掌心相对。',
      '大臂夹紧体侧，肘部固定不动。',
      '呼气用二头和肱桡肌将哑铃弯举至肩前，掌心始终相对。',
      '吸气缓慢下放至手臂近乎伸直。',
    ],
  },
  '窄距卧推': {
    en_id: 'Close-Grip_Barbell_Bench_Press',
    muscles_primary: ['triceps'], muscles_secondary: ['chest', 'shoulders'],
    equipment: 'barbell', level: 'intermediate',
    images: ['Close-Grip_Barbell_Bench_Press/0.jpg', 'Close-Grip_Barbell_Bench_Press/1.jpg'],
    steps: [
      '仰卧于平板卧推凳，双手窄于肩宽握杠（约与肩同宽）。',
      '取下杠铃后肩胛下沉稳定。',
      '吸气缓慢下放至胸口下部，肘部贴身体两侧。',
      '呼气用三头为主发力推起，避免肘部外展。',
    ],
  },
  '颅骨粉碎者': {
    en_id: 'EZ-Bar_Skullcrusher',
    muscles_primary: ['triceps'], muscles_secondary: [],
    equipment: 'e-z curl bar', level: 'expert',
    images: ['EZ-Bar_Skullcrusher/0.jpg', 'EZ-Bar_Skullcrusher/1.jpg'],
    steps: [
      '仰卧于平板凳，双手窄握 EZ 杠举于胸口正上方。',
      '大臂垂直地面固定不动。',
      '吸气屈肘缓慢下放杠铃至额头正上方或略后。',
      '呼气用三头发力推起还原，肘部保持稳定不外展。',
    ],
  },
  '哑铃集中弯举': {
    en_id: 'Concentration_Curls',
    muscles_primary: ['biceps'], muscles_secondary: ['forearms'],
    equipment: 'dumbbell', level: 'beginner',
    images: ['Concentration_Curls/0.jpg', 'Concentration_Curls/1.jpg'],
    steps: [
      '坐于平板凳边缘，一手持哑铃，肘部抵住同侧大腿内侧。',
      '大臂固定不动，手臂自然下垂。',
      '呼气用二头发力将哑铃弯举至肩前。',
      '吸气缓慢下放至手臂近乎伸直，完成一侧再换边。',
    ],
  },

  // ===== 核心 =====
  '器械卷腹': {
    en_id: 'Ab_Crunch_Machine',
    muscles_primary: ['abdominals'], muscles_secondary: [],
    equipment: 'machine', level: 'beginner',
    images: ['Ab_Crunch_Machine/0.jpg', 'Ab_Crunch_Machine/1.jpg'],
    steps: [
      '坐入卷腹机，双手抓握把手，胸部贴护垫。',
      '双脚固定于踏板下。',
      '呼气用腹肌发力将上身向前卷曲。',
      '吸气缓慢还原至起始位，全程保持腹部张力。',
    ],
  },
  '绳索卷腹': {
    en_id: 'Cable_Crunch',
    muscles_primary: ['abdominals'], muscles_secondary: [],
    equipment: 'cable', level: 'intermediate',
    images: ['Cable_Crunch/0.jpg', 'Cable_Crunch/1.jpg'],
    steps: [
      '将龙门架滑轮调至高位，装绳索把手。',
      '跪于滑轮前方，双手握绳索两端置于头两侧。',
      '呼气用腹肌发力将上身向下卷曲，直至肘接近膝。',
      '吸气缓慢还原至躯干近乎直立，保持腹肌张力。',
    ],
  },
  '罗马椅背伸展': {
    en_id: 'Hyperextensions_Back_Extensions',
    muscles_primary: ['lower back'], muscles_secondary: ['glutes', 'hamstrings'],
    equipment: 'other', level: 'beginner',
    images: ['Hyperextensions_Back_Extensions/0.jpg', 'Hyperextensions_Back_Extensions/1.jpg'],
    steps: [
      '俯卧于罗马椅，脚跟卡入护垫下方，髋骨顶在前护垫上。',
      '双手交叉抱于胸前或抱头，保持腰背中立。',
      '吸气缓慢向下屈体，感受腘绳和下背拉伸。',
      '呼气用下背和臀部发力还原至躯干与腿在一条线上。',
    ],
  },
  '器械转体': {
    en_id: 'Seated_Barbell_Twist',
    muscles_primary: ['abdominals'], muscles_secondary: ['lower back'],
    equipment: 'barbell', level: 'beginner',
    images: ['Seated_Barbell_Twist/0.jpg', 'Seated_Barbell_Twist/1.jpg'],
    steps: [
      '坐于平板凳，将空杠铃或杠杆放于斜方肌上，双手扶稳。',
      '躯干挺直，双脚踩稳地面。',
      '腹斜肌发力将躯干向一侧旋转至最大幅度。',
      '缓慢回到中间位并向另一侧旋转，重复动作。',
    ],
  },
  '悬垂举腿架': {
    en_id: 'Hanging_Leg_Raise',
    muscles_primary: ['abdominals'], muscles_secondary: [],
    equipment: 'body only', level: 'intermediate',
    images: ['Hanging_Leg_Raise/0.jpg', 'Hanging_Leg_Raise/1.jpg'],
    steps: [
      '使用带靠背和护肘的举腿架，双臂夹紧护垫悬垂。',
      '躯干挺直，双腿自然下垂。',
      '呼气用下腹发力将双腿抬至与躯干呈 90°。',
      '吸气缓慢下放，避免利用惯性摆动。',
    ],
  },
  '平板支撑': {
    en_id: 'Plank',
    muscles_primary: ['abdominals'], muscles_secondary: [],
    equipment: 'body only', level: 'beginner',
    images: ['Plank/0.jpg', 'Plank/1.jpg'],
    steps: [
      '前臂支撑于地面，肘部位于肩正下方，双脚脚尖撑地。',
      '身体从头到脚保持一条直线，不塌腰不翘臀。',
      '收紧核心、臀部和大腿，正常呼吸。',
      '保持目标时间（30 秒到 2 分钟）后放松。',
    ],
  },
  '卷腹': {
    en_id: 'Crunches',
    muscles_primary: ['abdominals'], muscles_secondary: [],
    equipment: 'body only', level: 'beginner',
    images: ['Crunches/0.jpg', 'Crunches/1.jpg'],
    steps: [
      '仰卧于地面，双腿屈膝踩地，双手交叉于胸前或轻放耳后。',
      '腰部贴地，颈部保持中立不用力。',
      '呼气用腹肌发力将肩胛骨卷离地面，下背仍贴地。',
      '吸气缓慢还原，避免用手拉扯颈部。',
    ],
  },
  '俄罗斯转体': {
    en_id: 'Russian_Twist',
    muscles_primary: ['abdominals'], muscles_secondary: ['lower back'],
    equipment: 'body only', level: 'intermediate',
    images: ['Russian_Twist/0.jpg', 'Russian_Twist/1.jpg'],
    steps: [
      '坐于地面，膝盖弯曲，双脚离地或轻踏地面。',
      '躯干后倾约 45°，双手在胸前合十或抓握重物。',
      '腹斜肌发力将躯干向一侧旋转，双手随之移到体侧。',
      '缓慢向另一侧旋转，左右交替完成。',
    ],
  },
  '死虫式': {
    en_id: 'Dead_Bug',
    muscles_primary: ['abdominals'], muscles_secondary: [],
    equipment: 'body only', level: 'beginner',
    images: ['Dead_Bug/0.jpg', 'Dead_Bug/1.jpg'],
    steps: [
      '仰卧于地面，双臂垂直向上举起，双腿屈膝抬至 90°。',
      '腰部贴地，收紧核心稳定骨盆。',
      '呼气缓慢伸出对侧手臂和腿至接近地面。',
      '吸气收回起始位，交替进行两侧。',
    ],
  },
  '悬垂举腿': {
    en_id: 'Hanging_Leg_Raise',
    muscles_primary: ['abdominals'], muscles_secondary: [],
    equipment: 'body only', level: 'expert',
    images: ['Hanging_Leg_Raise/0.jpg', 'Hanging_Leg_Raise/1.jpg'],
    steps: [
      '双手正握单杠，肩胛下沉，身体自然悬垂。',
      '收紧核心避免身体摆动。',
      '呼气用下腹发力将双腿并拢抬起至与躯干呈 90°。',
      '吸气缓慢下放至完全悬垂，避免利用惯性。',
    ],
  },
};

export function getExerciseDetail(name) {
  return EXERCISE_DB[name] || null;
}

export function hasExerciseDetail(name) {
  return !!EXERCISE_DB[name];
}

export function getMuscleLabel(m) {
  return MUSCLE_ZH[m] || m;
}

export function getLevelLabel(l) {
  return LEVEL_ZH[l] || l;
}

export function getEquipmentLabel(e) {
  return EQUIPMENT_ZH[e] || e;
}
