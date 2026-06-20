import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import type { Seat, Customer, Cat, Drink, MakingDrink } from '@/types/game';
import { ProgressBar } from './ProgressBar';
import { Star, Coffee, UserX, Sparkles } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SeatCardProps {
  seat: Seat;
  customer?: Customer;
  cat?: Cat;
  makingDrink?: MakingDrink;
  drink?: Drink;
  isSelected: boolean;
}

export const SeatCard: React.FC<SeatCardProps> = ({
  seat,
  customer,
  cat,
  makingDrink,
  drink,
  isSelected,
}) => {
  const { selectSeat, selectedSeatId } = useGameStore();

  const handleClick = () => {
    if (customer) {
      selectSeat(isSelected ? null : seat.id);
    } else {
      if (selectedSeatId === seat.id) {
        selectSeat(null);
      }
    }
  };

  const patiencePercent = customer ? (customer.patience / customer.maxPatience) * 100 : 100;
  const patienceColor = customer
    ? patiencePercent > 50
      ? 'bg-mint'
      : patiencePercent > 25
        ? 'bg-sunset'
        : 'bg-danger animate-pulse'
    : 'bg-warm-200';

  const satisfactionPercent = customer ? (customer.satisfaction / 100) * 100 : 0;

  return (
    <div
      onClick={handleClick}
      className={cn(
        'relative rounded-3xl border-2 transition-all duration-300 p-3 min-h-[170px]',
        isSelected
          ? 'bg-gradient-to-br from-peach/50 to-pink/30 border-peach shadow-xl scale-[1.03] ring-4 ring-peach/30'
          : customer
            ? 'bg-gradient-to-br from-cream to-warm-100 border-coffee-light shadow-lg hover:shadow-xl hover:scale-[1.01] cursor-pointer hover:border-coffee'
            : 'bg-gradient-to-br from-warm-50/80 to-warm-100/40 border-warm-200 border-dashed shadow-sm'
      )}
    >
      <div className="absolute top-2 left-2 flex items-center gap-1">
        <div className="w-6 h-6 rounded-full bg-coffee flex items-center justify-center shadow">
          <span className="text-white text-[11px] font-black">{seat.seatNumber}</span>
        </div>
        <div className="flex gap-0.5">
          {Array.from({ length: seat.level }).map((_, i) => (
            <Star key={i} className="w-3 h-3 text-gold fill-gold drop-shadow-sm" />
          ))}
        </div>
      </div>

      {seat.revenueBonus > 0 && (
        <div className="absolute top-2 right-2 px-2 py-0.5 bg-gold/20 rounded-full text-[10px] font-bold text-gold border border-gold/40">
          +{Math.round(seat.revenueBonus * 100)}%
        </div>
      )}

      <div className="mt-8 flex items-center justify-center gap-2 min-h-[60px]">
        <div className="relative">
          {customer ? (
            <div
              className={cn(
                'text-5xl transition-all duration-300',
                customer.status === 'leaving-angry' && 'animate-shake opacity-60 grayscale',
                customer.status === 'leaving-happy' && 'animate-bounce',
                customer.status === 'drinking' && 'animate-happy',
                customer.status === 'ordering' && 'animate-bob'
              )}
            >
              {customer.emoji}
            </div>
          ) : (
            <div className="text-4xl opacity-30">🪑</div>
          )}

          {cat && (
            <div className="absolute -right-4 -bottom-3 text-3xl animate-bounce-slow drop-shadow-md">
              {cat.emoji}
            </div>
          )}
        </div>
      </div>

      {customer && (
        <div className="mt-2 space-y-1.5">
          {customer.status === 'waiting' && (
            <div className="flex items-center gap-1 text-center justify-center text-xs">
              <span className="text-coffee-light">等待点单</span>
              <Sparkles className="w-3 h-3 text-peach animate-pulse" />
            </div>
          )}
          {customer.status === 'ordering' && (
            <div className="flex items-center gap-1 text-center justify-center text-xs">
              <Coffee className="w-3 h-3 text-coffee animate-bounce" />
              <span className="text-coffee font-bold">制作中...</span>
            </div>
          )}
          {customer.status === 'served' && (
            <div className="flex items-center gap-1 text-center justify-center text-xs text-mint font-bold animate-pulse">
              <Sparkles className="w-3 h-3" />
              <span>请享用~</span>
            </div>
          )}
          {customer.status === 'drinking' && (
            <div className="flex items-center gap-1 text-center justify-center text-xs text-mint font-bold">
              😋 <span>愉快用餐</span>
            </div>
          )}

          <div className="space-y-0.5">
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-coffee-light w-4">⏰</span>
              <ProgressBar
                value={customer.patience}
                max={customer.maxPatience}
                colorClass={patienceColor}
                bgClass="bg-warm-200/60"
                height="h-1.5"
              />
            </div>
            <div className="flex items-center gap-1">
              <span className="text-[9px] text-coffee-light w-4">💖</span>
              <ProgressBar
                value={customer.satisfaction}
                max={100}
                colorClass="bg-pink"
                bgClass="bg-warm-200/60"
                height="h-1.5"
              />
            </div>
          </div>

          {makingDrink && drink && (
            <div className="mt-1.5 px-2 py-1 bg-coffee/10 rounded-xl border border-coffee/20">
              <div className="flex items-center justify-between text-[11px] mb-0.5">
                <span className="flex items-center gap-1">
                  <span>{drink.emoji}</span>
                  <span className="font-bold text-coffee">{drink.name}</span>
                </span>
                <span className="font-black text-coffee-dark">{Math.round(makingDrink.progress)}%</span>
              </div>
              <ProgressBar
                value={makingDrink.progress}
                max={100}
                colorClass="bg-gradient-to-r from-coffee to-coffee-light"
                bgClass="bg-warm-200"
                height="h-1"
              />
            </div>
          )}
        </div>
      )}

      {!customer && (
        <div className="mt-6 text-center">
          <UserX className="w-6 h-6 mx-auto text-warm-300 mb-1" />
          <p className="text-[10px] text-warm-400">空座位</p>
        </div>
      )}

      {isSelected && (
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2">
          <div className="px-3 py-0.5 bg-peach rounded-full text-[10px] font-black text-white shadow-lg border-2 border-white animate-bounce">
            已选中
          </div>
        </div>
      )}

      {satisfactionPercent >= 90 && customer && customer.status !== 'ordering' && (
        <div className="absolute top-1/2 right-1 text-xl animate-float-heart">
          💕
        </div>
      )}
    </div>
  );
};
