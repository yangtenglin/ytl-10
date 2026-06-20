export interface Cat {
  id: string;
  name: string;
  emoji: string;
  fatigue: number;
  maxFatigue: number;
  charmBonus: number;
  assignedSeatId: string | null;
  isResting: boolean;
  unlocked: boolean;
  unlockCost: number;
}

export type CustomerStatus =
  | 'entering'
  | 'waiting'
  | 'ordering'
  | 'served'
  | 'drinking'
  | 'leaving-happy'
  | 'leaving-angry';

export interface Customer {
  id: string;
  emoji: string;
  name: string;
  patience: number;
  maxPatience: number;
  satisfaction: number;
  orderedDrinkId: string | null;
  seatId: string | null;
  status: CustomerStatus;
  tipMultiplier: number;
}

export interface Seat {
  id: string;
  seatNumber: number;
  level: number;
  customerId: string | null;
  catId: string | null;
  revenueBonus: number;
  upgradeCost: number;
}

export interface Drink {
  id: string;
  name: string;
  emoji: string;
  basePrice: number;
  makeTime: number;
  unlocked: boolean;
  unlockCost: number;
}

export interface MakingDrink {
  seatId: string;
  drinkId: string;
  progress: number;
}

export interface DailyReport {
  day: number;
  revenue: number;
  expense: number;
  profit: number;
  customersServed: number;
  happyRate: number;
  maxCombo: number;
  comboBonus: number;
}

export interface GameState {
  coins: number;
  day: number;
  timeOfDay: number;
  combo: number;
  maxCombo: number;
  comboTimer: number;
  isPaused: boolean;
  todayRevenue: number;
  todayExpense: number;
  todayCustomers: number;
  todayHappyCustomers: number;
  comboBonusTotal: number;
  cats: Cat[];
  customers: Customer[];
  seats: Seat[];
  drinks: Drink[];
  makingDrinks: MakingDrink[];
  customerSpawnTimer: number;
  expandCost: number;
  showDailyReport: boolean;
  lastReport: DailyReport | null;
  showUpgradeModal: boolean;
  selectedSeatId: string | null;
  floatTexts: { id: string; text: string; x: number; y: number; color: string }[];
}

export interface GameActions {
  tick: (deltaSeconds: number) => void;
  spawnCustomer: () => void;
  customerLeave: (customerId: string, happy: boolean) => void;
  assignCatToSeat: (catId: string, seatId: string) => void;
  unassignCat: (catId: string) => void;
  toggleRestCat: (catId: string) => void;
  startMakingDrink: (drinkId: string, seatId: string) => void;
  completeDrink: (seatId: string) => void;
  serveCustomer: (customerId: string) => void;
  upgradeSeat: (seatId: string) => boolean;
  unlockCat: (catId: string) => boolean;
  unlockDrink: (drinkId: string) => boolean;
  expandShop: () => boolean;
  togglePause: () => void;
  nextDay: () => void;
  closeDailyReport: () => void;
  openUpgradeModal: () => void;
  closeUpgradeModal: () => void;
  selectSeat: (seatId: string | null) => void;
  addFloatText: (text: string, x: number, y: number, color: string) => void;
  removeFloatText: (id: string) => void;
  resetGame: () => void;
  saveGame: () => void;
  loadGame: () => boolean;
}
