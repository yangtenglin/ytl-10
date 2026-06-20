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
} as const;

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
