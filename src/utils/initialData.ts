import type { Cat, Seat, Drink, BarStation, DeliveryDailyStats } from '../types/game';
import { GAME_CONFIG } from './constants';

export const createInitialCats = (): Cat[] => [
  {
    id: 'cat-1',
    name: '小橘',
    emoji: '🐱',
    fatigue: 0,
    maxFatigue: 100,
    charmBonus: 0.18,
    assignedSeatId: null,
    isResting: false,
    unlocked: true,
    unlockCost: 0,
    intimacyLevel: 1,
    intimacyExp: 0,
  },
  {
    id: 'cat-2',
    name: '奶牛',
    emoji: '😺',
    fatigue: 0,
    maxFatigue: 100,
    charmBonus: 0.22,
    assignedSeatId: null,
    isResting: false,
    unlocked: true,
    unlockCost: 0,
    intimacyLevel: 1,
    intimacyExp: 0,
  },
  {
    id: 'cat-3',
    name: '黑炭',
    emoji: '😸',
    fatigue: 0,
    maxFatigue: 100,
    charmBonus: 0.25,
    assignedSeatId: null,
    isResting: false,
    unlocked: false,
    unlockCost: 300,
    intimacyLevel: 1,
    intimacyExp: 0,
  },
  {
    id: 'cat-4',
    name: '布偶',
    emoji: '😻',
    fatigue: 0,
    maxFatigue: 100,
    charmBonus: 0.32,
    assignedSeatId: null,
    isResting: false,
    unlocked: false,
    unlockCost: 600,
    intimacyLevel: 1,
    intimacyExp: 0,
  },
  {
    id: 'cat-5',
    name: '蓝胖',
    emoji: '🐈',
    fatigue: 0,
    maxFatigue: 100,
    charmBonus: 0.38,
    assignedSeatId: null,
    isResting: false,
    unlocked: false,
    unlockCost: 1000,
    intimacyLevel: 1,
    intimacyExp: 0,
  },
  {
    id: 'cat-6',
    name: '三花',
    emoji: '🐈‍⬛',
    fatigue: 0,
    maxFatigue: 100,
    charmBonus: 0.45,
    assignedSeatId: null,
    isResting: false,
    unlocked: false,
    unlockCost: 1800,
    intimacyLevel: 1,
    intimacyExp: 0,
  },
];

export const createInitialSeats = (): Seat[] => {
  const seats: Seat[] = [];
  for (let i = 0; i < GAME_CONFIG.INITIAL_SEATS; i++) {
    seats.push({
      id: `seat-${i + 1}`,
      seatNumber: i + 1,
      level: 1,
      customerId: null,
      catId: null,
      revenueBonus: 0,
      upgradeCost: 150,
    });
  }
  return seats;
};

export const createInitialDrinks = (): Drink[] => [
  {
    id: 'drink-1',
    name: '美式咖啡',
    emoji: '☕',
    basePrice: 18,
    makeTime: 4,
    unlocked: true,
    unlockCost: 0,
  },
  {
    id: 'drink-2',
    name: '拿铁',
    emoji: '🥛',
    basePrice: 25,
    makeTime: 5,
    unlocked: true,
    unlockCost: 0,
  },
  {
    id: 'drink-3',
    name: '卡布奇诺',
    emoji: '🍵',
    basePrice: 28,
    makeTime: 6,
    unlocked: false,
    unlockCost: 200,
  },
  {
    id: 'drink-4',
    name: '抹茶拿铁',
    emoji: '🍃',
    basePrice: 32,
    makeTime: 6,
    unlocked: false,
    unlockCost: 400,
  },
  {
    id: 'drink-5',
    name: '焦糖玛奇朵',
    emoji: '🍮',
    basePrice: 38,
    makeTime: 7,
    unlocked: false,
    unlockCost: 700,
  },
  {
    id: 'drink-6',
    name: '猫爪蛋糕',
    emoji: '🍰',
    basePrice: 45,
    makeTime: 5,
    unlocked: false,
    unlockCost: 1200,
  },
];

export const createInitialBarStations = (): BarStation[] => {
  const stations: BarStation[] = [];
  for (let i = 0; i < GAME_CONFIG.DELIVERY_INITIAL_STATIONS; i++) {
    stations.push({
      id: `bar-${i + 1}`,
      name: `吧台${i + 1}`,
      level: 1,
      occupied: false,
      deliveryOrderId: null,
      speedBonus: 0,
      upgradeCost: GAME_CONFIG.DELIVERY_BAR_UPGRADE_BASE,
    });
  }
  return stations;
};

export const createInitialDeliveryStats = (): DeliveryDailyStats => ({
  totalOrders: 0,
  completedOrders: 0,
  expiredOrders: 0,
  refundedOrders: 0,
  deliveryRevenue: 0,
  deliveryRefunds: 0,
  deliveryProfit: 0,
});
