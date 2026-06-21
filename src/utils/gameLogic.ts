import type { Customer, Cat, Seat, Drink, DailyReport, Reservation, DeliveryOrder, DeliveryDailyStats } from '../types/game';
import { GAME_CONFIG, CUSTOMER_EMOJIS, CUSTOMER_NAMES, REGULAR_CUSTOMER_NAMES, REGULAR_CUSTOMER_EMOJIS, CAT_SKILLS, CAT_INTIMACY_EXP_TABLE, CAT_MAX_INTIMACY_LEVEL, CAT_ACCOMPANY_EXP_GAIN, DELIVERY_CUSTOMER_NAMES, DELIVERY_CUSTOMER_EMOJIS } from './constants';

export const generateId = (): string => {
  return Math.random().toString(36).substring(2, 11);
};

export const randInt = (min: number, max: number): number => {
  return Math.floor(Math.random() * (max - min + 1)) + min;
};

export const randChoice = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

export const clamp = (val: number, min: number, max: number): number => {
  return Math.max(min, Math.min(max, val));
};

export const createCustomer = (seat: Seat | null): Customer => {
  const maxPatience = randInt(70, 100);
  return {
    id: generateId(),
    emoji: randChoice(CUSTOMER_EMOJIS),
    name: randChoice(CUSTOMER_NAMES),
    patience: maxPatience,
    maxPatience,
    satisfaction: 50,
    orderedDrinkId: null,
    desiredDrinkId: null,
    seatId: seat ? seat.id : null,
    queuePosition: null,
    status: seat ? 'waiting' : 'entering',
    tipMultiplier: 1 + Math.random() * 0.5,
  };
};

export const createQueueCustomer = (drinks: Drink[], queuePosition: number): Customer => {
  const unlockedDrinks = drinks.filter((d) => d.unlocked);
  const desiredDrink = unlockedDrinks.length > 0 ? randChoice(unlockedDrinks) : null;
  const maxPatience = randInt(GAME_CONFIG.RUSH_HOUR_PATIENCE_MIN, GAME_CONFIG.RUSH_HOUR_PATIENCE_MAX);
  return {
    id: generateId(),
    emoji: randChoice(CUSTOMER_EMOJIS),
    name: randChoice(CUSTOMER_NAMES),
    patience: maxPatience,
    maxPatience,
    satisfaction: 50,
    orderedDrinkId: null,
    desiredDrinkId: desiredDrink ? desiredDrink.id : null,
    seatId: null,
    queuePosition,
    status: 'queuing',
    tipMultiplier: 1 + Math.random() * 0.5,
  };
};

export const calculatePayment = (
  drink: Drink,
  seat: Seat,
  cat: Cat | null,
  combo: number,
  satisfaction: number,
  tipMultiplier: number
): { base: number; catBonus: number; seatBonus: number; comboBonus: number; total: number } => {
  const base = drink.basePrice;
  const seatBonus = Math.round(base * seat.revenueBonus);
  const catBonus = cat ? Math.round(base * cat.charmBonus) : 0;
  const comboLevel = Math.min(combo, GAME_CONFIG.MAX_COMBO);
  const comboBonus = Math.round(base * comboLevel * GAME_CONFIG.COMBO_BONUS_PER_LEVEL);
  const satisfactionMultiplier = 0.7 + (satisfaction / 100) * 0.6;
  const total = Math.round((base + seatBonus + catBonus + comboBonus) * satisfactionMultiplier * tipMultiplier);
  return { base, catBonus, seatBonus, comboBonus, total };
};

export const createDailyReport = (
  day: number,
  revenue: number,
  expense: number,
  customersServed: number,
  happyCustomers: number,
  maxCombo: number,
  comboBonusTotal: number
): DailyReport => {
  const happyRate = customersServed > 0 ? Math.round((happyCustomers / customersServed) * 100) : 0;
  return {
    day,
    revenue,
    expense,
    profit: revenue - expense,
    customersServed,
    happyRate,
    maxCombo,
    comboBonus: comboBonusTotal,
  };
};

export const findEmptySeat = (seats: Seat[], reservedSeatIds: string[] = []): Seat | null => {
  const emptySeats = seats.filter((s) => !s.customerId && !reservedSeatIds.includes(s.id));
  if (emptySeats.length === 0) return null;
  return emptySeats[randInt(0, emptySeats.length - 1)];
};

export const isCatAvailable = (cat: Cat): boolean => {
  return cat.unlocked && !cat.isResting && cat.fatigue < cat.maxFatigue && !cat.assignedSeatId;
};

export const formatTime = (timeOfDay: number): string => {
  const totalMinutes = Math.round(timeOfDay * 10 * 0.6);
  const hours = 9 + Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;
  return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
};

export const createReservation = (
  seatId: string,
  timeSlot: number,
  preferredCatId: string | null,
): Reservation => {
  return {
    id: generateId(),
    customerName: randChoice(REGULAR_CUSTOMER_NAMES),
    customerEmoji: randChoice(REGULAR_CUSTOMER_EMOJIS),
    timeSlot,
    preferredCatId,
    deposit: GAME_CONFIG.RESERVATION_DEPOSIT,
    status: 'pending',
    seatId,
    customerId: null,
    lateness: 0,
    satisfactionPenalty: 0,
    rescheduled: false,
    originalTimeSlot: timeSlot,
    originalSeatId: seatId,
  };
};

export const createReservedCustomer = (reservation: Reservation): Customer => {
  const maxPatience = randInt(80, 110);
  return {
    id: generateId(),
    emoji: reservation.customerEmoji,
    name: reservation.customerName,
    patience: maxPatience,
    maxPatience,
    satisfaction: Math.max(0, 70 - reservation.satisfactionPenalty),
    orderedDrinkId: null,
    desiredDrinkId: null,
    seatId: reservation.seatId,
    queuePosition: null,
    status: 'waiting',
    tipMultiplier: 1.2 + Math.random() * 0.4,
  };
};

export const getCatEffectiveCharmBonus = (cat: Cat): number => {
  let bonus = cat.charmBonus;
  for (const skill of CAT_SKILLS) {
    if (cat.intimacyLevel >= skill.levelRequired) {
      bonus += skill.charmBonusAdd;
    }
  }
  return bonus;
};

export const getCatEffectiveFatigueRate = (cat: Cat): number => {
  let mul = 1;
  for (const skill of CAT_SKILLS) {
    if (cat.intimacyLevel >= skill.levelRequired) {
      mul += skill.fatigueRateMul;
    }
  }
  return GAME_CONFIG.CAT_FATIGUE_RATE * mul;
};

export const getCatEffectiveTipBonus = (cat: Cat): number => {
  let bonus = 0;
  for (const skill of CAT_SKILLS) {
    if (cat.intimacyLevel >= skill.levelRequired) {
      bonus += skill.tipBonusAdd;
    }
  }
  return bonus;
};

export const getCatEffectiveSatisfactionBoost = (cat: Cat): number => {
  let boost = 0.8;
  for (const skill of CAT_SKILLS) {
    if (cat.intimacyLevel >= skill.levelRequired) {
      boost += skill.satisfactionBoostAdd;
    }
  }
  return boost;
};

export const addCatExp = (cat: Cat, expGain: number): { intimacyLevel: number; intimacyExp: number } => {
  if (cat.intimacyLevel >= CAT_MAX_INTIMACY_LEVEL) {
    return { intimacyLevel: cat.intimacyLevel, intimacyExp: cat.intimacyExp };
  }
  let newExp = cat.intimacyExp + expGain;
  let newLevel = cat.intimacyLevel;
  while (newLevel < CAT_MAX_INTIMACY_LEVEL && newExp >= CAT_INTIMACY_EXP_TABLE[newLevel]) {
    newExp -= CAT_INTIMACY_EXP_TABLE[newLevel];
    newLevel++;
  }
  if (newLevel >= CAT_MAX_INTIMACY_LEVEL) {
    newLevel = CAT_MAX_INTIMACY_LEVEL;
    newExp = 0;
  }
  return { intimacyLevel: newLevel, intimacyExp: newExp };
};

export const getAccompanyExpGain = (): number => {
  return CAT_ACCOMPANY_EXP_GAIN;
};

export const createDeliveryOrder = (drinks: Drink[]): DeliveryOrder | null => {
  const unlockedDrinks = drinks.filter((d) => d.unlocked);
  if (unlockedDrinks.length === 0) return null;

  const drink = randChoice(unlockedDrinks);
  const deliveryFee = Math.round(GAME_CONFIG.DELIVERY_BASE_FEE + drink.basePrice * GAME_CONFIG.DELIVERY_FEE_PER_PRICE);
  const totalPrice = drink.basePrice + deliveryFee;
  const maxTime = randInt(GAME_CONFIG.DELIVERY_TIME_MIN, GAME_CONFIG.DELIVERY_TIME_MAX);

  return {
    id: generateId(),
    customerName: randChoice(DELIVERY_CUSTOMER_NAMES),
    customerEmoji: randChoice(DELIVERY_CUSTOMER_EMOJIS),
    drinkId: drink.id,
    drinkName: drink.name,
    drinkEmoji: drink.emoji,
    drinkPrice: drink.basePrice,
    deliveryFee,
    totalPrice,
    timeLeft: maxTime,
    maxTime,
    status: 'pending',
    barStationId: null,
    barStationName: null,
    makeProgress: 0,
    createdAt: Date.now(),
    acceptedAt: null,
    startedMakingAt: null,
    deliveredAt: null,
    refundedAt: null,
  };
};

export const findEmptyBarStation = (stations: any[]): any | null => {
  const emptyStations = stations.filter((s) => !s.occupied);
  if (emptyStations.length === 0) return null;
  return emptyStations[0];
};

export const createDeliveryDailyStats = (
  stats: DeliveryDailyStats
): DeliveryDailyStats => {
  return {
    ...stats,
    deliveryProfit: stats.deliveryRevenue - stats.deliveryRefunds,
  };
};

export const calculateDeliveryPayment = (order: DeliveryOrder): number => {
  return order.totalPrice;
};

export const formatDeliveryTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60);
  const secs = Math.floor(seconds % 60);
  return `${mins}:${secs.toString().padStart(2, '0')}`;
};
