export interface CatSkill {
  id: string;
  name: string;
  emoji: string;
  description: string;
  levelRequired: number;
  charmBonusAdd: number;
  fatigueRateMul: number;
  tipBonusAdd: number;
  satisfactionBoostAdd: number;
}

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
  intimacyLevel: number;
  intimacyExp: number;
}

export type CustomerStatus =
  | 'queuing'
  | 'entering'
  | 'waiting'
  | 'ordering'
  | 'served'
  | 'drinking'
  | 'leaving-happy'
  | 'leaving-angry'
  | 'leaving-queue';

export interface Customer {
  id: string;
  emoji: string;
  name: string;
  patience: number;
  maxPatience: number;
  satisfaction: number;
  orderedDrinkId: string | null;
  desiredDrinkId: string | null;
  seatId: string | null;
  queuePosition: number | null;
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

export type ReservationStatus = 'pending' | 'arrived' | 'seated' | 'settled' | 'expired';

export interface Reservation {
  id: string;
  customerName: string;
  customerEmoji: string;
  timeSlot: number;
  preferredCatId: string | null;
  deposit: number;
  status: ReservationStatus;
  seatId: string | null;
  customerId: string | null;
  lateness: number;
  satisfactionPenalty: number;
  rescheduled: boolean;
  originalTimeSlot: number;
  originalSeatId: string | null;
}

export type DeliveryStatus = 'pending' | 'accepted' | 'making' | 'delivering' | 'completed' | 'refunded' | 'expired';

export interface DeliveryOrder {
  id: string;
  customerName: string;
  customerEmoji: string;
  drinkId: string;
  drinkName: string;
  drinkEmoji: string;
  drinkPrice: number;
  deliveryFee: number;
  totalPrice: number;
  timeLeft: number;
  maxTime: number;
  status: DeliveryStatus;
  barStationId: string | null;
  makeProgress: number;
  createdAt: number;
}

export interface BarStation {
  id: string;
  name: string;
  level: number;
  occupied: boolean;
  deliveryOrderId: string | null;
  speedBonus: number;
  upgradeCost: number;
}

export interface DeliveryDailyStats {
  totalOrders: number;
  completedOrders: number;
  expiredOrders: number;
  refundedOrders: number;
  deliveryRevenue: number;
  deliveryRefunds: number;
  deliveryProfit: number;
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
  queue: Customer[];
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
  reservations: Reservation[];
  showReservationPanel: boolean;
  showCatTraining: boolean;
  deliveryOrders: DeliveryOrder[];
  barStations: BarStation[];
  showDeliveryPanel: boolean;
  todayDeliveryStats: DeliveryDailyStats;
  deliverySpawnTimer: number;
  isRushHour: boolean;
  rushHourSpawnTimer: number;
  todayQueueLeftAngry: number;
  todayQueueServed: number;
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
  createReservation: (seatId: string, timeSlot: number, preferredCatId: string | null) => boolean;
  rescheduleReservation: (reservationId: string, newSeatId: string, newTimeSlot: number) => boolean;
  seatReservation: (reservationId: string) => void;
  settleReservation: (reservationId: string) => void;
  openReservationPanel: () => void;
  closeReservationPanel: () => void;
  trainCat: (catId: string) => boolean;
  openCatTraining: () => void;
  closeCatTraining: () => void;
  acceptDeliveryOrder: (orderId: string) => boolean;
  startMakingDelivery: (orderId: string) => boolean;
  completeDeliveryOrder: (orderId: string) => void;
  refundDeliveryOrder: (orderId: string) => void;
  openDeliveryPanel: () => void;
  closeDeliveryPanel: () => void;
  upgradeBarStation: (stationId: string) => boolean;
  expandBarStation: () => boolean;
  toggleRushHour: () => void;
  seatNextFromQueue: () => boolean;
  queueCustomerLeave: (customerId: string, angry: boolean) => void;
}
