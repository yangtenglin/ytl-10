import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import type { Drink } from '../types/game';
import { Clock, Lock, Coins } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DrinkCardProps {
  drink: Drink;
  selectedSeatHasCustomer: boolean;
  selectedSeatIsOrdering: boolean;
}

export const DrinkCard: React.FC<DrinkCardProps> = ({
  drink,
  selectedSeatHasCustomer,
  selectedSeatIsOrdering,
}) => {
  const { startMakingDrink, unlockDrink, coins, selectedSeatId } = useGameStore();

  const canMake = drink.unlocked && selectedSeatHasCustomer && !selectedSeatIsOrdering && selectedSeatId;

  const handleMake = () => {
    if (canMake && selectedSeatId) {
      startMakingDrink(drink.id, selectedSeatId);
    }
  };

  const handleUnlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    unlockDrink(drink.id);
  };

  return (
    <div
      onClick={handleMake}
      className={cn(
        'relative p-3 rounded-2xl border-2 transition-all duration-300 overflow-hidden',
        drink.unlocked
          ? canMake
            ? 'bg-gradient-to-br from-cream to-warm-100 border-coffee-light shadow-lg cursor-pointer hover:shadow-xl hover:scale-[1.03] hover:border-coffee active:scale-[0.98]'
            : 'bg-gradient-to-br from-warm-50 to-warm-100/70 border-warm-200 shadow-sm opacity-80'
          : 'bg-gradient-to-br from-gray-100 to-gray-50 border-gray-300 shadow-sm opacity-80'
      )}
    >
      {!drink.unlocked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gray-900/30 backdrop-blur-[1px] z-10">
          <button
            onClick={handleUnlock}
            disabled={coins < drink.unlockCost}
            className={cn(
              'flex flex-col items-center gap-1 px-3 py-1.5 rounded-xl font-bold text-xs transition-all',
              coins >= drink.unlockCost
                ? 'bg-gradient-to-r from-gold to-yellow-400 text-white shadow-lg hover:scale-105 hover:shadow-xl border-2 border-white/50'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            )}
          >
            <Lock className="w-3 h-3" />
            <span>{drink.unlockCost}💰</span>
          </button>
        </div>
      )}

      <div className="flex items-center gap-2.5">
        <div className={cn(
          'text-3xl p-1.5 rounded-xl bg-white/60 shadow-sm transition-transform',
          canMake ? 'hover:scale-110 animate-bob-slow' : ''
        )}>
          {drink.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <span className="font-black text-coffee-dark text-xs truncate">{drink.name}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                <Clock className="w-3 h-3 text-coffee-light" />
                <span className="text-[10px] font-bold text-coffee-light">{drink.makeTime}s</span>
              </div>
            </div>
            <div className="flex items-center gap-0.5">
              <Coins className="w-3 h-3 text-gold" />
              <span className="text-[11px] font-black text-gold">{drink.basePrice}</span>
            </div>
          </div>
        </div>
      </div>

      {canMake && (
        <div className="absolute inset-0 rounded-2xl ring-2 ring-peach/20 pointer-events-none animate-pulse" />
      )}
    </div>
  );
};
