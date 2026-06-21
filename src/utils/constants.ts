export const GAME_CONFIG = {
  TICK_INTERVAL: 100,
  DAY_DURATION: 150,
  CUSTOMER_SPAWN_MIN: 5,
  CUSTOMER_SPAWN_MAX: 10,
  PATIENCE_DECAY_RATE: 2.0,
  CAT_FATIGUE_RATE: 1.2,
  CAT_REST_RATE: 6,
  CAT_ASSIGN_PATIENCE_BOOST: 15,
  COMBO_TIMEOUT: 20,
  COMBO_BONUS_PER_LEVEL: 0.05,
  MAX_COMBO: 20,
  SEAT_BASE_BONUS: 0.12,
  CAT_CHARM_BASE: 0.18,
  SERVE_SATISFACTION_BOOST: 40,
  DRINKING_DURATION: 3,
  LEAVING_DURATION: 1.5,
  INITIAL_COINS: 200,
  INITIAL_SEATS: 3,
  EXPAND_COST_BASE: 500,
  EXPAND_COST_MULTIPLIER: 1.8,
  RESERVATION_DEPOSIT: 30,
  RESERVATION_LATE_GRACE: 5,
  RESERVATION_LATE_SATISFACTION_RATE: 3,
  RESERVATION_ARRIVAL_THRESHOLD: 3,
  DELIVERY_SPAWN_MIN: 8,
  DELIVERY_SPAWN_MAX: 15,
  DELIVERY_INITIAL_STATIONS: 1,
  DELIVERY_BASE_FEE: 8,
  DELIVERY_FEE_PER_PRICE: 0.15,
  DELIVERY_TIME_MIN: 45,
  DELIVERY_TIME_MAX: 75,
  DELIVERY_ACCEPT_WINDOW: 10,
  DELIVERY_EXPAND_COST_BASE: 400,
  DELIVERY_EXPAND_COST_MULTIPLIER: 2.0,
  DELIVERY_BAR_UPGRADE_BASE: 250,
  DELIVERY_BAR_UPGRADE_MULTIPLIER: 1.8,
  DELIVERY_BAR_SPEED_BONUS_PER_LEVEL: 0.15,
  DELIVERY_MAX_STATIONS: 4,
} as const;

export const TIME_SLOTS = [10, 20, 30, 40, 50, 60, 70, 80, 90] as const;

export const TIME_SLOT_LABELS: Record<number, string> = {
  10: '10:00',
  20: '11:00',
  30: '12:00',
  40: '13:00',
  50: '14:00',
  60: '15:00',
  70: '16:00',
  80: '17:00',
  90: '18:00',
};

export const REGULAR_CUSTOMER_NAMES = [
  '猫奴小王', '铲屎官阿花', '撸猫达人', '猫薄荷星人',
  '吸猫成瘾', '猫咖老客', '喵星人挚友', '猫咪收藏家',
];

export const REGULAR_CUSTOMER_EMOJIS = [
  '🧑‍🎤', '👩‍🎨', '👨‍💻', '🧕',
  '👩‍🔬', '🧑‍🍳', '👨‍🎓', '👸',
];

export const CAT_INTIMACY_EXP_TABLE = [0, 20, 60, 130, 240, 400] as const;

export const CAT_MAX_INTIMACY_LEVEL = CAT_INTIMACY_EXP_TABLE.length - 1;

export const CAT_TRAINING_COST = 50;

export const CAT_TRAINING_EXP_GAIN = 12;

export const CAT_ACCOMPANY_EXP_GAIN = 8;

export const CAT_SKILLS: import('../types/game').CatSkill[] = [
  {
    id: 'skill-gentle',
    name: '乖巧',
    emoji: '🐾',
    description: '魅力加成提升，顾客更喜欢你',
    levelRequired: 2,
    charmBonusAdd: 0.06,
    fatigueRateMul: 0,
    tipBonusAdd: 0,
    satisfactionBoostAdd: 0,
  },
  {
    id: 'skill-affectionate',
    name: '亲昵',
    emoji: '💕',
    description: '陪伴时顾客满意度额外提升',
    levelRequired: 3,
    charmBonusAdd: 0,
    fatigueRateMul: 0,
    tipBonusAdd: 0,
    satisfactionBoostAdd: 8,
  },
  {
    id: 'skill-warmheart',
    name: '暖心',
    emoji: '🌟',
    description: '疲劳积累减缓，陪伴更持久',
    levelRequired: 4,
    charmBonusAdd: 0,
    fatigueRateMul: -0.2,
    tipBonusAdd: 0,
    satisfactionBoostAdd: 0,
  },
  {
    id: 'skill-luckycat',
    name: '招财猫',
    emoji: '💰',
    description: '小费加成大幅提升',
    levelRequired: 5,
    charmBonusAdd: 0,
    fatigueRateMul: 0,
    tipBonusAdd: 0.15,
    satisfactionBoostAdd: 0,
  },
];

export const COLORS = {
  bg: '#FFF8F0',
  bgCard: '#FFFBF5',
  primary: '#C4956A',
  primaryDark: '#A67B50',
  accent: '#FFB6C1',
  accentDark: '#FF9EB0',
  success: '#98D8C8',
  successDark: '#7BC4B2',
  warning: '#FFB38A',
  warningDark: '#FF9B6B',
  danger: '#FF8A8A',
  text: '#5C4033',
  textLight: '#8B7355',
  border: '#E8DCC8',
  shadow: 'rgba(196, 149, 106, 0.15)',
} as const;

export const CUSTOMER_EMOJIS = [
  '🧑', '👩', '👨', '👧', '👦', '🧓', '👵', '👴',
  '👩‍🎓', '👨‍💼', '👩‍🍳', '🧑‍🎨', '👨‍🔬', '👩‍💻', '🧕', '👮',
];

export const CUSTOMER_NAMES = [
  '小明', '小红', '阿花', '大壮', '小美', '老王', '张三', '李四',
  '咖啡控', '喵星人', '书虫', '白领', '学生党', '老爷爷', '老奶奶', '艺术家',
];

export const DELIVERY_CUSTOMER_NAMES = [
  '外卖小哥', '加班族', '宅家党', '下午茶爱好者', '咖啡达人',
  '甜品控', '上班族', '学生宿舍', '办公族', '追剧党',
];

export const DELIVERY_CUSTOMER_EMOJIS = [
  '👨‍💼', '👩‍💻', '🧑‍🎓', '👨‍🏫', '👩‍⚕️',
  '🧑‍🍳', '👨‍🎨', '👩‍🎤', '🧑‍🔬', '👨‍✈️',
];
