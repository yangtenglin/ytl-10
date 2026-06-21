import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { SeatCard } from './SeatCard';
import { Store, Users, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ShopArea: React.FC = () => {
  const { seats, customers, cats, makingDrinks, drinks, selectedSeatId, floatTexts, reservations, isRushHour, queue, todayQueueServed, todayQueueLeftAngry } = useGameStore();

  const customerMap = new Map(customers.map((c) => [c.id, c]));
  const catMap = new Map(cats.map((c) => [c.id, c]));
  const drinkMap = new Map(drinks.map((d) => [d.id, d]));

  return (
    <div className="relative flex flex-col h-full bg-gradient-to-b from-cream via-warm-50 to-warm-100 rounded-3xl border-2 border-warm-200 shadow-xl overflow-hidden">
      <div className={cn(
        "px-5 py-3 border-b-4 transition-all duration-500",
        isRushHour
          ? "bg-gradient-to-r from-sunset via-peach to-sunset border-sunset/60"
          : "bg-gradient-to-r from-coffee-light via-coffee to-coffee-dark border-coffee-dark"
      )}>
        <div className="flex items-center justify-between max-w-4xl mx-auto">
          <div className="flex items-center gap-2">
            <Store className={cn("w-5 h-5 drop-shadow", isRushHour ? "text-white" : "text-cream")} />
            <h2 className={cn("font-black text-base drop-shadow", isRushHour ? "text-white" : "text-cream")}>
              🐾 猫咪咖啡店
            </h2>
            {isRushHour && (
              <div className="flex items-center gap-1 px-2 py-0.5 bg-white/20 rounded-full border border-white/30">
                <Zap className="w-3 h-3 text-white fill-white animate-pulse" />
                <span className="text-white text-[10px] font-black">早高峰</span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-3">
            {isRushHour && (
              <div className="flex items-center gap-1.5 px-2 py-0.5 bg-white/15 rounded-full border border-white/20">
                <Users className="w-3.5 h-3.5 text-white" />
                <span className="text-white text-[10px] font-bold">
                  排队 {queue.length}
                </span>
                {todayQueueServed > 0 && (
                  <span className="text-mint-light text-[10px] font-bold ml-1">
                    ✓{todayQueueServed}
                  </span>
                )}
                {todayQueueLeftAngry > 0 && (
                  <span className="text-danger text-[10px] font-bold ml-1">
                    ✗{todayQueueLeftAngry}
                  </span>
                )}
              </div>
            )}
            <div className={cn("text-xs", isRushHour ? "text-white/80" : "text-cream/80")}>
              座位 <span className="font-bold text-white">{seats.filter(s => s.customerId).length}/{seats.length}</span>
            </div>
            <div className={cn("text-xs", isRushHour ? "text-white/80" : "text-cream/80")}>
              猫咪 <span className="font-bold text-white">{cats.filter(c => c.unlocked).length}</span>
            </div>
          </div>
        </div>
      </div>

      <div className="relative flex-1 overflow-y-auto p-5">
        <div
          className="absolute inset-0 opacity-[0.03] pointer-events-none"
          style={{
            backgroundImage: "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='60' height='60' viewBox='0 0 60 60'%3E%3Ctext x='0' y='40' font-size='40' opacity='0.5'%3E🐾%3C/text%3E%3C/svg%3E\")",
          }}
        />

        {floatTexts.map((ft) => (
          <div
            key={ft.id}
            className="absolute font-black text-xl pointer-events-none animate-float-up z-50 drop-shadow-lg"
            style={{ left: `${ft.x}%`, top: `${ft.y}%`, color: ft.color }}
          >
            {ft.text}
          </div>
        ))}

        <div className="relative grid grid-cols-2 md:grid-cols-3 gap-4 max-w-4xl mx-auto">
          {seats.map((seat) => {
            const customer = seat.customerId ? customerMap.get(seat.customerId) : undefined;
            const cat = seat.catId ? catMap.get(seat.catId) : undefined;
            const makingDrink = makingDrinks.find((m) => m.seatId === seat.id);
            const drink = makingDrink ? drinkMap.get(makingDrink.drinkId) : undefined;
            const reservation = reservations.find(
              (r) => r.seatId === seat.id && r.status !== 'settled' && r.status !== 'expired'
            );

            return (
              <SeatCard
                key={seat.id}
                seat={seat}
                customer={customer}
                cat={cat}
                makingDrink={makingDrink}
                drink={drink}
                isSelected={selectedSeatId === seat.id}
                reservation={reservation}
              />
            );
          })}
        </div>

        {selectedSeatId && (
          <div className="mt-4 mx-auto max-w-4xl">
            <div className="p-3 bg-gradient-to-r from-peach/20 to-pink/20 rounded-2xl border-2 border-dashed border-peach text-center">
              <p className="text-sm text-coffee-dark font-bold">
                ✨ 座位已选中！从左侧选择猫咪指派陪客，或从右侧菜单点单
              </p>
            </div>
          </div>
        )}
      </div>

      <div className="px-4 py-2 bg-warm-100/60 border-t border-warm-200 flex items-center justify-between">
        <p className="text-[11px] text-coffee-light">
          💡 点击座位选中 → 指派猫咪/点饮品
        </p>
        <p className="text-[11px] text-coffee-light">
          ⚡ 快速服务获得连击奖励！
        </p>
      </div>
    </div>
  );
};
