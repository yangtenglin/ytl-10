import { create } from 'zustand';
import type { GameState, GameActions, Customer, Reservation, DeliveryOrder, DeliveryDailyStats } from '../types/game';
import { GAME_CONFIG, CAT_MAX_INTIMACY_LEVEL, CAT_TRAINING_COST, CAT_TRAINING_EXP_GAIN } from '../utils/constants';
import { createInitialCats, createInitialSeats, createInitialDrinks, createInitialBarStations, createInitialDeliveryStats } from '../utils/initialData';
import {
  generateId,
  randInt,
  clamp,
  createCustomer,
  calculatePayment,
  createDailyReport,
  findEmptySeat,
  createReservation as buildReservation,
  createReservedCustomer,
  addCatExp,
  getCatEffectiveCharmBonus,
  getCatEffectiveFatigueRate,
  getCatEffectiveTipBonus,
  getCatEffectiveSatisfactionBoost,
  getAccompanyExpGain,
  createDeliveryOrder,
  findEmptyBarStation,
  calculateDeliveryPayment,
} from '../utils/gameLogic';

const getInitialState = (): GameState => ({
  coins: GAME_CONFIG.INITIAL_COINS,
  day: 1,
  timeOfDay: 0,
  combo: 0,
  maxCombo: 0,
  comboTimer: 0,
  isPaused: false,
  todayRevenue: 0,
  todayExpense: 0,
  todayCustomers: 0,
  todayHappyCustomers: 0,
  comboBonusTotal: 0,
  cats: createInitialCats(),
  customers: [],
  seats: createInitialSeats(),
  drinks: createInitialDrinks(),
  makingDrinks: [],
  customerSpawnTimer: randInt(GAME_CONFIG.CUSTOMER_SPAWN_MIN, GAME_CONFIG.CUSTOMER_SPAWN_MAX),
  expandCost: GAME_CONFIG.EXPAND_COST_BASE,
  showDailyReport: false,
  lastReport: null,
  showUpgradeModal: false,
  selectedSeatId: null,
  floatTexts: [],
  reservations: [],
  showReservationPanel: false,
  showCatTraining: false,
  deliveryOrders: [],
  barStations: createInitialBarStations(),
  showDeliveryPanel: false,
  todayDeliveryStats: createInitialDeliveryStats(),
  deliverySpawnTimer: randInt(GAME_CONFIG.DELIVERY_SPAWN_MIN, GAME_CONFIG.DELIVERY_SPAWN_MAX),
});

const STORAGE_KEY = 'cat-cafe-save';

export const useGameStore = create<GameState & GameActions>((set, get) => ({
  ...getInitialState(),

  tick: (deltaSeconds: number) => {
    const state = get();
    if (state.isPaused || state.showDailyReport) return;

    set((s) => {
      const newState = { ...s };

      newState.timeOfDay = clamp(s.timeOfDay + (deltaSeconds / GAME_CONFIG.DAY_DURATION) * 100, 0, 100);

      if (s.combo > 0) {
        newState.comboTimer = s.comboTimer - deltaSeconds;
        if (newState.comboTimer <= 0) {
          newState.combo = 0;
          newState.comboTimer = 0;
        }
      }

      newState.customerSpawnTimer = s.customerSpawnTimer - deltaSeconds;
      if (newState.customerSpawnTimer <= 0 && newState.timeOfDay < 95) {
        const reservedSeatIds = newState.reservations
          .filter((r) => r.status !== 'settled' && r.status !== 'expired')
          .map((r) => r.seatId);
        const emptySeat = findEmptySeat(newState.seats, reservedSeatIds);
        if (emptySeat) {
          const newCustomer = createCustomer(emptySeat);
          newState.customers = [...s.customers, newCustomer];
          newState.seats = s.seats.map((seat) =>
            seat.id === emptySeat.id ? { ...seat, customerId: newCustomer.id } : seat
          );
          newState.todayCustomers = s.todayCustomers + 1;
        }
        newState.customerSpawnTimer = randInt(GAME_CONFIG.CUSTOMER_SPAWN_MIN, GAME_CONFIG.CUSTOMER_SPAWN_MAX);
      }

      newState.cats = s.cats.map((cat) => {
        if (!cat.unlocked) return cat;
        if (cat.isResting) {
          return {
            ...cat,
            fatigue: clamp(cat.fatigue - GAME_CONFIG.CAT_REST_RATE * deltaSeconds, 0, cat.maxFatigue),
          };
        }
        if (cat.assignedSeatId) {
          const effectiveFatigueRate = getCatEffectiveFatigueRate(cat);
          return {
            ...cat,
            fatigue: clamp(cat.fatigue + effectiveFatigueRate * deltaSeconds, 0, cat.maxFatigue),
          };
        }
        return cat;
      });

      const updatedCustomers: Customer[] = [];
      let coinsGained = 0;
      let revenueGained = 0;
      let comboBonusGained = 0;
      let happyCount = 0;

      for (const customer of s.customers) {
        const c = { ...customer };
        const seat = newState.seats.find((st) => st.id === c.seatId);
        const assignedCat = seat?.catId
          ? newState.cats.find((ct) => ct.id === seat.catId)
          : null;

        switch (c.status) {
          case 'entering':
            break;

          case 'waiting':
          case 'ordering':
            c.patience = clamp(c.patience - GAME_CONFIG.PATIENCE_DECAY_RATE * deltaSeconds, 0, c.maxPatience);
            if (assignedCat) {
              const effectiveSatBoost = getCatEffectiveSatisfactionBoost(assignedCat);
              c.satisfaction = clamp(c.satisfaction + effectiveSatBoost * deltaSeconds, 0, 100);
            }
            if (c.patience <= 0) {
              c.status = 'leaving-angry';
              if (seat) {
                newState.seats = newState.seats.map((st) =>
                  st.id === seat.id ? { ...st, customerId: null, catId: null } : st
                );
              }
              newState.makingDrinks = newState.makingDrinks.filter((m) => m.seatId !== c.seatId);
              newState.combo = 0;
              newState.comboTimer = 0;
              c.seatId = null;
              setTimeout(() => {
                get().customerLeave(c.id, false);
              }, GAME_CONFIG.LEAVING_DURATION * 1000);
            }
            break;

          case 'served':
            c.status = 'drinking';
            break;

          case 'drinking':
            c.patience = c.maxPatience;
            break;

          case 'leaving-happy':
          case 'leaving-angry':
            break;
        }

        if (c.status === 'drinking' && seat) {
          const drink = s.drinks.find((d) => d.id === c.orderedDrinkId);
          if (drink) {
            const effectiveCharm = assignedCat ? getCatEffectiveCharmBonus(assignedCat) : 0;
            const effectiveTipCat = assignedCat ? getCatEffectiveTipBonus(assignedCat) : 0;
            const catForPayment = assignedCat ? { ...assignedCat, charmBonus: effectiveCharm } : null;
            const payment = calculatePayment(
              drink,
              seat,
              catForPayment,
              s.combo,
              c.satisfaction,
              c.tipMultiplier + effectiveTipCat
            );
            coinsGained += payment.total;
            revenueGained += payment.total;
            comboBonusGained += payment.comboBonus;
            happyCount++;

            if (assignedCat) {
              const expResult = addCatExp(assignedCat, getAccompanyExpGain());
              newState.cats = newState.cats.map((ct) =>
                ct.id === assignedCat.id ? { ...ct, intimacyLevel: expResult.intimacyLevel, intimacyExp: expResult.intimacyExp } : ct
              );
            }

            const nextCombo = Math.min(s.combo + 1, GAME_CONFIG.MAX_COMBO);
            newState.combo = nextCombo;
            newState.maxCombo = Math.max(s.maxCombo, nextCombo);
            newState.comboTimer = GAME_CONFIG.COMBO_TIMEOUT;

            newState.seats = newState.seats.map((st) =>
              st.id === seat.id ? { ...st, customerId: null, catId: null } : st
            );
            if (assignedCat) {
              newState.cats = newState.cats.map((ct) =>
                ct.id === assignedCat.id ? { ...ct, assignedSeatId: null } : ct
              );
            }
            c.status = 'leaving-happy';
            c.seatId = null;
            setTimeout(() => {
              get().customerLeave(c.id, true);
            }, GAME_CONFIG.LEAVING_DURATION * 1000);
          }
        }

        updatedCustomers.push(c);
      }

      newState.customers = updatedCustomers.filter(
        (c) => c.status !== 'leaving-happy' && c.status !== 'leaving-angry'
      );
      newState.coins = s.coins + coinsGained;
      newState.todayRevenue = s.todayRevenue + revenueGained;
      newState.todayHappyCustomers = s.todayHappyCustomers + happyCount;
      newState.comboBonusTotal = s.comboBonusTotal + comboBonusGained;

      newState.makingDrinks = s.makingDrinks
        .map((m) => {
          const drink = s.drinks.find((d) => d.id === m.drinkId);
          if (!drink) return m;
          const increment = (100 / drink.makeTime) * deltaSeconds;
          return { ...m, progress: clamp(m.progress + increment, 0, 100) };
        })
        .filter((m) => {
          if (m.progress >= 100) {
            get().completeDrink(m.seatId);
            return false;
          }
          return true;
        });

      const oldFloatIds = new Set(s.floatTexts.map((f) => f.id));
      const newFloats = newState.floatTexts.filter((f) => !oldFloatIds.has(f.id));
      if (coinsGained > 0) {
        newFloats.push({
          id: generateId(),
          text: `+${coinsGained}💰`,
          x: 50 + randInt(-20, 20),
          y: 30,
          color: '#FFD700',
        });
      }
      newState.floatTexts = [...s.floatTexts, ...newFloats].slice(-10);

      const updatedReservations: Reservation[] = [];
      for (const res of newState.reservations) {
        const r = { ...res };
        if (r.status === 'pending' && newState.timeOfDay >= r.timeSlot - GAME_CONFIG.RESERVATION_ARRIVAL_THRESHOLD) {
          r.status = 'arrived';
        }
        if (r.status === 'arrived') {
          r.lateness += deltaSeconds;
          if (r.lateness > GAME_CONFIG.RESERVATION_LATE_GRACE) {
            r.satisfactionPenalty += GAME_CONFIG.RESERVATION_LATE_SATISFACTION_RATE * deltaSeconds;
          }
          const seat = newState.seats.find((st) => st.id === r.seatId);
          if (seat && !seat.customerId) {
            const reservedCustomer = createReservedCustomer(r);
            newState.customers = [...newState.customers, reservedCustomer];
            newState.seats = newState.seats.map((st) =>
              st.id === r.seatId ? { ...st, customerId: reservedCustomer.id } : st
            );
            newState.todayCustomers = (newState.todayCustomers || s.todayCustomers) + 1;
            r.customerId = reservedCustomer.id;
            r.status = 'seated';
          }
        }
        if (r.status === 'seated' && r.customerId) {
          const customerStillExists = newState.customers.some((c) => c.id === r.customerId);
          if (!customerStillExists) {
            r.status = 'settled';
          }
        }
        updatedReservations.push(r);
      }
      newState.reservations = updatedReservations;

      newState.deliverySpawnTimer = s.deliverySpawnTimer - deltaSeconds;
      if (newState.deliverySpawnTimer <= 0 && newState.timeOfDay < 90) {
        const pendingCount = newState.deliveryOrders.filter((o) => o.status === 'pending').length;
        if (pendingCount < 5) {
          const newDelivery = createDeliveryOrder(newState.drinks);
          if (newDelivery) {
            newState.deliveryOrders = [...newState.deliveryOrders, newDelivery];
            newState.todayDeliveryStats = {
              ...newState.todayDeliveryStats,
              totalOrders: newState.todayDeliveryStats.totalOrders + 1,
            };
          }
        }
        newState.deliverySpawnTimer = randInt(GAME_CONFIG.DELIVERY_SPAWN_MIN, GAME_CONFIG.DELIVERY_SPAWN_MAX);
      }

      const updatedDeliveryOrders: DeliveryOrder[] = [];
      let deliveryCoinsGained = 0;
      let deliveryRevenueGained = 0;
      let deliveryRefunds = 0;
      let completedCount = 0;
      let expiredCount = 0;
      let refundedCount = 0;

      for (const order of newState.deliveryOrders) {
        const o = { ...order };

        if (o.status === 'pending') {
          o.timeLeft = o.timeLeft - deltaSeconds;
          if (o.timeLeft <= o.maxTime - GAME_CONFIG.DELIVERY_ACCEPT_WINDOW) {
            o.status = 'expired';
            expiredCount++;
          }
        } else if (o.status === 'accepted') {
          o.timeLeft = o.timeLeft - deltaSeconds;
          if (o.timeLeft <= 0) {
            o.status = 'refunded';
            refundedCount++;
            deliveryRefunds += o.totalPrice;
            newState.coins = newState.coins - o.totalPrice;
            if (o.barStationId) {
              newState.barStations = newState.barStations.map((st) =>
                st.id === o.barStationId ? { ...st, occupied: false, deliveryOrderId: null } : st
              );
            }
          }
        } else if (o.status === 'making') {
          o.timeLeft = o.timeLeft - deltaSeconds;
          const station = newState.barStations.find((st) => st.id === o.barStationId);
          const drink = s.drinks.find((d) => d.id === o.drinkId);
          if (station && drink) {
            const speedMultiplier = 1 + station.speedBonus;
            const increment = (100 / drink.makeTime) * deltaSeconds * speedMultiplier;
            o.makeProgress = clamp(o.makeProgress + increment, 0, 100);
          }
          if (o.makeProgress >= 100) {
            o.status = 'delivering';
          }
          if (o.timeLeft <= 0) {
            o.status = 'refunded';
            refundedCount++;
            deliveryRefunds += o.totalPrice;
            newState.coins = newState.coins - o.totalPrice;
            if (o.barStationId) {
              newState.barStations = newState.barStations.map((st) =>
                st.id === o.barStationId ? { ...st, occupied: false, deliveryOrderId: null } : st
              );
            }
          }
        } else if (o.status === 'delivering') {
          o.timeLeft = o.timeLeft - deltaSeconds;
          if (o.timeLeft <= 0) {
            o.status = 'refunded';
            refundedCount++;
            deliveryRefunds += o.totalPrice;
            newState.coins = newState.coins - o.totalPrice;
            if (o.barStationId) {
              newState.barStations = newState.barStations.map((st) =>
                st.id === o.barStationId ? { ...st, occupied: false, deliveryOrderId: null } : st
              );
            }
          }
        }

        if (o.status !== 'expired' && o.status !== 'refunded' && o.status !== 'completed') {
          updatedDeliveryOrders.push(o);
        }
      }

      newState.deliveryOrders = updatedDeliveryOrders;
      newState.coins += deliveryCoinsGained;

      newState.todayDeliveryStats = {
        ...newState.todayDeliveryStats,
        completedOrders: newState.todayDeliveryStats.completedOrders + completedCount,
        expiredOrders: newState.todayDeliveryStats.expiredOrders + expiredCount,
        refundedOrders: newState.todayDeliveryStats.refundedOrders + refundedCount,
        deliveryRevenue: newState.todayDeliveryStats.deliveryRevenue + deliveryRevenueGained,
        deliveryRefunds: newState.todayDeliveryStats.deliveryRefunds + deliveryRefunds,
      };

      if (deliveryRevenueGained > 0) {
        newState.floatTexts = [
          ...newState.floatTexts,
          {
            id: generateId(),
            text: `外卖+${deliveryRevenueGained}💰`,
            x: 50 + randInt(-20, 20),
            y: 40,
            color: '#4CAF50',
          },
        ].slice(-10);
      }
      if (deliveryRefunds > 0) {
        newState.floatTexts = [
          ...newState.floatTexts,
          {
            id: generateId(),
            text: `超时退款-${deliveryRefunds}💰`,
            x: 50 + randInt(-20, 20),
            y: 40,
            color: '#FF5252',
          },
        ].slice(-10);
      }

      return newState;
    });
  },

  spawnCustomer: () => {
    set((s) => {
      const reservedSeatIds = s.reservations
        .filter((r) => r.status !== 'settled' && r.status !== 'expired')
        .map((r) => r.seatId);
      const emptySeat = findEmptySeat(s.seats, reservedSeatIds);
      if (!emptySeat) return s;
      const newCustomer = createCustomer(emptySeat);
      return {
        ...s,
        customers: [...s.customers, newCustomer],
        seats: s.seats.map((seat) =>
          seat.id === emptySeat.id ? { ...seat, customerId: newCustomer.id } : seat
        ),
        todayCustomers: s.todayCustomers + 1,
      };
    });
  },

  customerLeave: (customerId: string, happy: boolean) => {
    set((s) => ({
      ...s,
      customers: s.customers.filter((c) => c.id !== customerId),
    }));
    void happy;
  },

  assignCatToSeat: (catId: string, seatId: string) => {
    set((s) => {
      const cat = s.cats.find((c) => c.id === catId);
      const seat = s.seats.find((st) => st.id === seatId);
      if (!cat || !seat || !cat.unlocked || cat.isResting || cat.assignedSeatId) return s;
      if (cat.fatigue >= cat.maxFatigue) return s;

      const prevSeat = s.seats.find((st) => st.catId === catId);
      let newSeats = s.seats;
      if (prevSeat) {
        newSeats = newSeats.map((st) =>
          st.id === prevSeat.id ? { ...st, catId: null } : st
        );
      }
      newSeats = newSeats.map((st) =>
        st.id === seatId ? { ...st, catId } : st
      );

      const newCustomers = s.customers.map((c) => {
        if (c.seatId === seatId) {
          return {
            ...c,
            patience: clamp(c.patience + GAME_CONFIG.CAT_ASSIGN_PATIENCE_BOOST, 0, c.maxPatience),
            satisfaction: clamp(c.satisfaction + 20, 0, 100),
          };
        }
        return c;
      });

      return {
        ...s,
        cats: s.cats.map((c) =>
          c.id === catId ? { ...c, assignedSeatId: seatId } : c
        ),
        seats: newSeats,
        customers: newCustomers,
      };
    });
  },

  unassignCat: (catId: string) => {
    set((s) => {
      const cat = s.cats.find((c) => c.id === catId);
      if (!cat || !cat.assignedSeatId) return s;
      return {
        ...s,
        cats: s.cats.map((c) =>
          c.id === catId ? { ...c, assignedSeatId: null } : c
        ),
        seats: s.seats.map((st) =>
          st.id === cat.assignedSeatId ? { ...st, catId: null } : st
        ),
      };
    });
  },

  toggleRestCat: (catId: string) => {
    set((s) => {
      const cat = s.cats.find((c) => c.id === catId);
      if (!cat || !cat.unlocked) return s;
      if (cat.assignedSeatId) {
        return {
          ...s,
          cats: s.cats.map((c) =>
            c.id === catId ? { ...c, isResting: !c.isResting, assignedSeatId: null } : c
          ),
          seats: s.seats.map((st) =>
            st.id === cat.assignedSeatId ? { ...st, catId: null } : st
          ),
        };
      }
      return {
        ...s,
        cats: s.cats.map((c) =>
          c.id === catId ? { ...c, isResting: !c.isResting } : c
        ),
      };
    });
  },

  startMakingDrink: (drinkId: string, seatId: string) => {
    set((s) => {
      const drink = s.drinks.find((d) => d.id === drinkId);
      const seat = s.seats.find((st) => st.id === seatId);
      const customer = s.customers.find((c) => c.id === seat?.customerId);
      if (!drink || !drink.unlocked || !seat || !customer) return s;
      if (customer.orderedDrinkId) return s;
      if (s.makingDrinks.some((m) => m.seatId === seatId)) return s;

      return {
        ...s,
        makingDrinks: [...s.makingDrinks, { seatId, drinkId, progress: 0 }],
        customers: s.customers.map((c) =>
          c.id === customer.id
            ? { ...c, orderedDrinkId: drinkId, status: 'ordering' }
            : c
        ),
      };
    });
  },

  completeDrink: (seatId: string) => {
    set((s) => {
      const seat = s.seats.find((st) => st.id === seatId);
      if (!seat) return s;
      return {
        ...s,
        customers: s.customers.map((c) =>
          c.seatId === seatId && c.status === 'ordering'
            ? { ...c, status: 'served', patience: c.maxPatience }
            : c
        ),
      };
      void seat;
    });
  },

  serveCustomer: (customerId: string) => {
    void customerId;
  },

  upgradeSeat: (seatId: string) => {
    const s = get();
    const seat = s.seats.find((st) => st.id === seatId);
    if (!seat || s.coins < seat.upgradeCost) return false;

    set((state) => ({
      ...state,
      coins: state.coins - seat.upgradeCost,
      todayExpense: state.todayExpense + seat.upgradeCost,
      seats: state.seats.map((st) =>
        st.id === seatId
          ? {
              ...st,
              level: st.level + 1,
              revenueBonus: (st.level) * GAME_CONFIG.SEAT_BASE_BONUS,
              upgradeCost: Math.round(st.upgradeCost * 1.6),
            }
          : st
      ),
    }));
    return true;
  },

  unlockCat: (catId: string) => {
    const s = get();
    const cat = s.cats.find((c) => c.id === catId);
    if (!cat || cat.unlocked || s.coins < cat.unlockCost) return false;

    set((state) => ({
      ...state,
      coins: state.coins - cat.unlockCost,
      todayExpense: state.todayExpense + cat.unlockCost,
      cats: state.cats.map((c) =>
        c.id === catId ? { ...c, unlocked: true } : c
      ),
    }));
    return true;
  },

  unlockDrink: (drinkId: string) => {
    const s = get();
    const drink = s.drinks.find((d) => d.id === drinkId);
    if (!drink || drink.unlocked || s.coins < drink.unlockCost) return false;

    set((state) => ({
      ...state,
      coins: state.coins - drink.unlockCost,
      todayExpense: state.todayExpense + drink.unlockCost,
      drinks: state.drinks.map((d) =>
        d.id === drinkId ? { ...d, unlocked: true } : d
      ),
    }));
    return true;
  },

  expandShop: () => {
    const s = get();
    if (s.coins < s.expandCost) return false;

    const newSeatNumber = s.seats.length + 1;

    set((state) => ({
      ...state,
      coins: state.coins - state.expandCost,
      todayExpense: state.todayExpense + state.expandCost,
      seats: [
        ...state.seats,
        {
          id: `seat-${generateId()}`,
          seatNumber: newSeatNumber,
          level: 1,
          customerId: null,
          catId: null,
          revenueBonus: 0,
          upgradeCost: 150,
        },
      ],
      expandCost: Math.round(state.expandCost * GAME_CONFIG.EXPAND_COST_MULTIPLIER),
    }));
    return true;
  },

  togglePause: () => {
    set((s) => ({ ...s, isPaused: !s.isPaused }));
  },

  nextDay: () => {
    const s = get();
    const totalRevenue = s.todayRevenue + s.todayDeliveryStats.deliveryRevenue;
    const totalExpense = s.todayExpense + s.todayDeliveryStats.deliveryRefunds;
    const report = createDailyReport(
      s.day,
      totalRevenue,
      totalExpense,
      s.todayCustomers + s.todayDeliveryStats.completedOrders,
      s.todayHappyCustomers,
      s.maxCombo,
      s.comboBonusTotal
    );

    set((state) => ({
      ...state,
      customers: [],
      makingDrinks: [],
      seats: state.seats.map((st) => ({ ...st, customerId: null, catId: null })),
      cats: state.cats.map((c) => ({
        ...c,
        assignedSeatId: null,
        fatigue: clamp(c.fatigue - c.maxFatigue * 0.5, 0, c.maxFatigue),
      })),
      showDailyReport: true,
      lastReport: report,
      reservations: state.reservations.map((r) =>
        r.status === 'settled' || r.status === 'expired' ? r : { ...r, status: 'expired' as const }
      ),
      deliveryOrders: [],
      barStations: state.barStations.map((st) => ({ ...st, occupied: false, deliveryOrderId: null })),
    }));
  },

  closeDailyReport: () => {
    set((s) => ({
      ...s,
      showDailyReport: false,
      day: s.day + 1,
      timeOfDay: 0,
      combo: 0,
      maxCombo: 0,
      comboTimer: 0,
      todayRevenue: 0,
      todayExpense: 0,
      todayCustomers: 0,
      todayHappyCustomers: 0,
      comboBonusTotal: 0,
      customerSpawnTimer: randInt(GAME_CONFIG.CUSTOMER_SPAWN_MIN, GAME_CONFIG.CUSTOMER_SPAWN_MAX),
      selectedSeatId: null,
      floatTexts: [],
      reservations: [],
      todayDeliveryStats: createInitialDeliveryStats(),
      deliverySpawnTimer: randInt(GAME_CONFIG.DELIVERY_SPAWN_MIN, GAME_CONFIG.DELIVERY_SPAWN_MAX),
    }));
  },

  openUpgradeModal: () => {
    set({ showUpgradeModal: true, isPaused: true });
  },

  closeUpgradeModal: () => {
    set({ showUpgradeModal: false, isPaused: false });
  },

  selectSeat: (seatId: string | null) => {
    set({ selectedSeatId: seatId });
  },

  addFloatText: (text: string, x: number, y: number, color: string) => {
    set((s) => ({
      ...s,
      floatTexts: [...s.floatTexts, { id: generateId(), text, x, y, color }].slice(-10),
    }));
  },

  removeFloatText: (id: string) => {
    set((s) => ({
      ...s,
      floatTexts: s.floatTexts.filter((f) => f.id !== id),
    }));
  },

  resetGame: () => {
    localStorage.removeItem(STORAGE_KEY);
    set(getInitialState());
  },

  saveGame: () => {
    const state = get();
    const saveData = {
      coins: state.coins,
      day: state.day,
      cats: state.cats,
      seats: state.seats,
      drinks: state.drinks,
      expandCost: state.expandCost,
    };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(saveData));
  },

  loadGame: () => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      if (!data) return false;
      const saveData = JSON.parse(data);
      set((s) => ({
        ...s,
        coins: saveData.coins ?? s.coins,
        day: saveData.day ?? s.day,
        cats: saveData.cats ?? s.cats,
        seats: saveData.seats ?? s.seats,
        drinks: saveData.drinks ?? s.drinks,
        expandCost: saveData.expandCost ?? s.expandCost,
      }));
      return true;
    } catch {
      return false;
    }
  },

  createReservation: (seatId: string, timeSlot: number, preferredCatId: string | null) => {
    const s = get();
    if (s.coins < GAME_CONFIG.RESERVATION_DEPOSIT) return false;
    const seat = s.seats.find((st) => st.id === seatId);
    if (!seat) return false;
    const existingReservation = s.reservations.find(
      (r) => r.seatId === seatId && r.timeSlot === timeSlot && r.status !== 'settled' && r.status !== 'expired'
    );
    if (existingReservation) return false;

    const reservation = buildReservation(seatId, timeSlot, preferredCatId);
    set((state) => ({
      ...state,
      coins: state.coins - GAME_CONFIG.RESERVATION_DEPOSIT,
      todayRevenue: state.todayRevenue + GAME_CONFIG.RESERVATION_DEPOSIT,
      reservations: [...state.reservations, reservation],
    }));
    return true;
  },

  seatReservation: (reservationId: string) => {
    const s = get();
    const reservation = s.reservations.find((r) => r.id === reservationId);
    if (!reservation || reservation.status !== 'arrived') return;

    const seat = s.seats.find((st) => st.id === reservation.seatId);
    if (!seat || seat.customerId) return;

    const reservedCustomer = createReservedCustomer(reservation);
    set((state) => ({
      ...state,
      customers: [...state.customers, reservedCustomer],
      seats: state.seats.map((st) =>
        st.id === reservation.seatId ? { ...st, customerId: reservedCustomer.id } : st
      ),
      todayCustomers: state.todayCustomers + 1,
      reservations: state.reservations.map((r) =>
        r.id === reservationId ? { ...r, customerId: reservedCustomer.id, status: 'seated' } : r
      ),
    }));
  },

  settleReservation: (reservationId: string) => {
    set((state) => ({
      ...state,
      reservations: state.reservations.map((r) =>
        r.id === reservationId ? { ...r, status: 'settled' } : r
      ),
    }));
  },

  openReservationPanel: () => {
    set({ showReservationPanel: true, isPaused: true });
  },

  closeReservationPanel: () => {
    set({ showReservationPanel: false, isPaused: false });
  },

  trainCat: (catId: string) => {
    const s = get();
    const cat = s.cats.find((c) => c.id === catId);
    if (!cat || !cat.unlocked || s.coins < CAT_TRAINING_COST) return false;
    if (cat.intimacyLevel >= CAT_MAX_INTIMACY_LEVEL) return false;

    const expResult = addCatExp(cat, CAT_TRAINING_EXP_GAIN);

    set((state) => ({
      ...state,
      coins: state.coins - CAT_TRAINING_COST,
      todayExpense: state.todayExpense + CAT_TRAINING_COST,
      cats: state.cats.map((c) =>
        c.id === catId ? { ...c, intimacyLevel: expResult.intimacyLevel, intimacyExp: expResult.intimacyExp } : c
      ),
    }));
    return true;
  },

  openCatTraining: () => {
    set({ showCatTraining: true, isPaused: true });
  },

  closeCatTraining: () => {
    set({ showCatTraining: false, isPaused: false });
  },

  acceptDeliveryOrder: (orderId: string) => {
    const s = get();
    const order = s.deliveryOrders.find((o) => o.id === orderId);
    if (!order || order.status !== 'pending') return false;

    const emptyStation = findEmptyBarStation(s.barStations);
    if (!emptyStation) return false;

    set((state) => ({
      ...state,
      deliveryOrders: state.deliveryOrders.map((o) =>
        o.id === orderId ? { ...o, status: 'accepted', barStationId: emptyStation.id } : o
      ),
      barStations: state.barStations.map((st) =>
        st.id === emptyStation.id ? { ...st, occupied: true, deliveryOrderId: orderId } : st
      ),
    }));
    return true;
  },

  startMakingDelivery: (orderId: string) => {
    const s = get();
    const order = s.deliveryOrders.find((o) => o.id === orderId);
    if (!order || order.status !== 'accepted') return false;

    set((state) => ({
      ...state,
      deliveryOrders: state.deliveryOrders.map((o) =>
        o.id === orderId ? { ...o, status: 'making', makeProgress: 0 } : o
      ),
    }));
    return true;
  },

  completeDeliveryOrder: (orderId: string) => {
    const s = get();
    const order = s.deliveryOrders.find((o) => o.id === orderId);
    if (!order || (order.status !== 'delivering' && order.status !== 'making')) return;

    const payment = calculateDeliveryPayment(order);

    set((state) => ({
      ...state,
      coins: state.coins + payment,
      todayDeliveryStats: {
        ...state.todayDeliveryStats,
        completedOrders: state.todayDeliveryStats.completedOrders + 1,
        deliveryRevenue: state.todayDeliveryStats.deliveryRevenue + payment,
      },
      deliveryOrders: state.deliveryOrders.filter((o) => o.id !== orderId),
      barStations: state.barStations.map((st) =>
        st.id === order.barStationId ? { ...st, occupied: false, deliveryOrderId: null } : st
      ),
      floatTexts: [
        ...state.floatTexts,
        {
          id: generateId(),
          text: `外卖+${payment}💰`,
          x: 50 + randInt(-20, 20),
          y: 40,
          color: '#4CAF50',
        },
      ].slice(-10),
    }));
  },

  refundDeliveryOrder: (orderId: string) => {
    const s = get();
    const order = s.deliveryOrders.find((o) => o.id === orderId);
    if (!order || order.status === 'completed' || order.status === 'refunded' || order.status === 'expired') return;

    const refundAmount = order.totalPrice;

    set((state) => ({
      ...state,
      coins: Math.max(0, state.coins - refundAmount),
      todayDeliveryStats: {
        ...state.todayDeliveryStats,
        refundedOrders: state.todayDeliveryStats.refundedOrders + 1,
        deliveryRefunds: state.todayDeliveryStats.deliveryRefunds + refundAmount,
      },
      deliveryOrders: state.deliveryOrders.filter((o) => o.id !== orderId),
      barStations: state.barStations.map((st) =>
        st.id === order.barStationId ? { ...st, occupied: false, deliveryOrderId: null } : st
      ),
      floatTexts: [
        ...state.floatTexts,
        {
          id: generateId(),
          text: `退款-${refundAmount}💰`,
          x: 50 + randInt(-20, 20),
          y: 40,
          color: '#FF5252',
        },
      ].slice(-10),
    }));
  },

  openDeliveryPanel: () => {
    set({ showDeliveryPanel: true, isPaused: true });
  },

  closeDeliveryPanel: () => {
    set({ showDeliveryPanel: false, isPaused: false });
  },

  upgradeBarStation: (stationId: string) => {
    const s = get();
    const station = s.barStations.find((st) => st.id === stationId);
    if (!station || s.coins < station.upgradeCost) return false;

    set((state) => ({
      ...state,
      coins: state.coins - station.upgradeCost,
      todayExpense: state.todayExpense + station.upgradeCost,
      barStations: state.barStations.map((st) =>
        st.id === stationId
          ? {
              ...st,
              level: st.level + 1,
              speedBonus: st.speedBonus + GAME_CONFIG.DELIVERY_BAR_SPEED_BONUS_PER_LEVEL,
              upgradeCost: Math.round(st.upgradeCost * GAME_CONFIG.DELIVERY_BAR_UPGRADE_MULTIPLIER),
            }
          : st
      ),
    }));
    return true;
  },

  expandBarStation: () => {
    const s = get();
    if (s.barStations.length >= GAME_CONFIG.DELIVERY_MAX_STATIONS) return false;
    const expandCost = GAME_CONFIG.DELIVERY_EXPAND_COST_BASE * Math.pow(GAME_CONFIG.DELIVERY_EXPAND_COST_MULTIPLIER, s.barStations.length - 1);
    if (s.coins < expandCost) return false;

    const newStationNumber = s.barStations.length + 1;

    set((state) => ({
      ...state,
      coins: state.coins - expandCost,
      todayExpense: state.todayExpense + expandCost,
      barStations: [
        ...state.barStations,
        {
          id: `bar-${generateId()}`,
          name: `吧台${newStationNumber}`,
          level: 1,
          occupied: false,
          deliveryOrderId: null,
          speedBonus: 0,
          upgradeCost: GAME_CONFIG.DELIVERY_BAR_UPGRADE_BASE,
        },
      ],
    }));
    return true;
  },
}));
