import { create } from 'zustand';
import type { GameState, GameActions, DailyReport, Customer } from '../types/game';
import { GAME_CONFIG } from '../utils/constants';
import { createInitialCats, createInitialSeats, createInitialDrinks } from '../utils/initialData';
import {
  generateId,
  randInt,
  clamp,
  createCustomer,
  calculatePayment,
  createDailyReport,
  findEmptySeat,
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
        const emptySeat = findEmptySeat(newState.seats);
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
          return {
            ...cat,
            fatigue: clamp(cat.fatigue + GAME_CONFIG.CAT_FATIGUE_RATE * deltaSeconds, 0, cat.maxFatigue),
          };
        }
        return cat;
      });

      let updatedCustomers: Customer[] = [];
      let coinsGained = 0;
      let revenueGained = 0;
      let comboBonusGained = 0;
      let happyCount = 0;

      for (const customer of s.customers) {
        let c = { ...customer };
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
              c.satisfaction = clamp(c.satisfaction + 0.8 * deltaSeconds, 0, 100);
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
            const payment = calculatePayment(
              drink,
              seat,
              assignedCat,
              s.combo,
              c.satisfaction,
              c.tipMultiplier
            );
            coinsGained += payment.total;
            revenueGained += payment.total;
            comboBonusGained += payment.comboBonus;
            happyCount++;

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

      return newState;
    });
  },

  spawnCustomer: () => {
    set((s) => {
      const emptySeat = findEmptySeat(s.seats);
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
    const report = createDailyReport(
      s.day,
      s.todayRevenue,
      s.todayExpense,
      s.todayCustomers,
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
}));
