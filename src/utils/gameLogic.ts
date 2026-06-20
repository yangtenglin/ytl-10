import type { Customer, Cat, Seat, Drink, DailyReport } from '../types/game';
import { GAME_CONFIG, CUSTOMER_EMOJIS, CUSTOMER_NAMES } from './constants';

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
    seatId: seat ? seat.id : null,
    status: seat ? 'waiting' : 'entering',
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

export const findEmptySeat = (seats: Seat[]): Seat | null => {
  const emptySeats = seats.filter((s) => !s.customerId);
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
