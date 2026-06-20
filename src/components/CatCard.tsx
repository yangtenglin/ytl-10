import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import type { Cat } from '@/types/game';
import { ProgressBar } from './ProgressBar';
import { Moon, Heart, Zap, Lock, Star } from 'lucide-react';
import { cn } from '@/lib/utils';
import { getCatEffectiveCharmBonus } from '@/utils/gameLogic';

interface CatCardProps {
  cat: Cat;
  selectedSeatId: string | null;
}

export const CatCard: React.FC<CatCardProps> = ({ cat, selectedSeatId }) => {
  const { assignCatToSeat, toggleRestCat, unlockCat, coins, unassignCat } = useGameStore();

  const handleClick = () => {
    if (!cat.unlocked) {
      unlockCat(cat.id);
      return;
    }
    if (selectedSeatId && !cat.assignedSeatId && !cat.isResting && cat.fatigue < cat.maxFatigue) {
      assignCatToSeat(cat.id, selectedSeatId);
    }
  };

  const handleUnassign = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (cat.assignedSeatId) {
      unassignCat(cat.id);
    }
  };

  const handleRest = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleRestCat(cat.id);
  };

  const handleUnlock = (e: React.MouseEvent) => {
    e.stopPropagation();
    unlockCat(cat.id);
  };

  const fatiguePercent = (cat.fatigue / cat.maxFatigue) * 100;
  const fatigueColor = fatiguePercent > 80
    ? 'bg-danger'
    : fatiguePercent > 50
      ? 'bg-sunset'
      : 'bg-mint';

  const canAssign = selectedSeatId && !cat.assignedSeatId && !cat.isResting && cat.fatigue < cat.maxFatigue && cat.unlocked;

  return (
    <div
      onClick={handleClick}
      className={cn(
        'relative p-3 rounded-2xl border-2 transition-all duration-300 cursor-pointer group',
        cat.unlocked
          ? cat.assignedSeatId
            ? 'bg-gradient-to-br from-lavender/80 to-cream border-lavender shadow-md'
            : cat.isResting
              ? 'bg-gradient-to-br from-indigo-100 to-cream border-indigo-300 shadow-md'
              : canAssign
                ? 'bg-gradient-to-br from-cream to-warm-100 border-peach shadow-lg scale-[1.02] hover:shadow-xl ring-2 ring-peach/30'
                : 'bg-gradient-to-br from-cream to-warm-50 border-warm-200 shadow-sm hover:shadow-md hover:border-coffee-light'
          : 'bg-gradient-to-br from-gray-100 to-gray-50 border-gray-300 shadow-sm opacity-80'
      )}
    >
      {!cat.unlocked && (
        <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-gray-900/30 backdrop-blur-[1px] z-10">
          <button
            onClick={handleUnlock}
            disabled={coins < cat.unlockCost}
            className={cn(
              'flex flex-col items-center gap-1 px-4 py-2 rounded-xl font-bold text-sm transition-all',
              coins >= cat.unlockCost
                ? 'bg-gradient-to-r from-gold to-yellow-400 text-white shadow-lg hover:scale-105 hover:shadow-xl border-2 border-white/50'
                : 'bg-gray-400 text-gray-200 cursor-not-allowed'
            )}
          >
            <Lock className="w-4 h-4" />
            <span>{cat.unlockCost}💰</span>
          </button>
        </div>
      )}

      <div className="flex items-start gap-3">
        <div className={cn(
          'text-4xl transition-transform duration-300',
          cat.isResting ? 'opacity-60 grayscale' : '',
          cat.assignedSeatId ? 'animate-bounce-slow' : ''
        )}>
          {cat.emoji}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="font-black text-coffee-dark text-sm truncate">{cat.name}</span>
            <div className="flex items-center gap-1.5">
              <div className="flex items-center gap-0.5 text-xs text-pink">
                <Heart className="w-3 h-3 fill-current" />
                <span className="font-bold">+{Math.round(getCatEffectiveCharmBonus(cat) * 100)}%</span>
              </div>
              {cat.intimacyLevel > 1 && (
                <div className="flex items-center gap-0.5 px-1.5 py-0.5 bg-gradient-to-r from-pink/20 to-lavender/20 rounded-full">
                  <Star className="w-2.5 h-2.5 text-pink fill-pink" />
                  <span className="text-[10px] font-bold text-pink">Lv.{cat.intimacyLevel}</span>
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-1.5 mb-1.5">
            <Zap className="w-3 h-3 text-sunset flex-shrink-0" />
            <ProgressBar
              value={cat.maxFatigue - cat.fatigue}
              max={cat.maxFatigue}
              colorClass={fatigueColor}
              bgClass="bg-warm-200"
              height="h-1.5"
            />
          </div>

          <div className="flex gap-1.5">
            {cat.assignedSeatId ? (
              <button
                onClick={handleUnassign}
                className="flex-1 flex items-center justify-center gap-1 px-2 py-1 bg-danger/20 hover:bg-danger/30 text-danger text-xs font-bold rounded-lg transition-colors"
              >
                召回
              </button>
            ) : (
              <button
                onClick={handleRest}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1 px-2 py-1 text-xs font-bold rounded-lg transition-all',
                  cat.isResting
                    ? 'bg-mint text-white shadow-sm'
                    : 'bg-indigo-100 hover:bg-indigo-200 text-indigo-600'
                )}
              >
                <Moon className="w-3 h-3" />
                {cat.isResting ? '休息中' : '休息'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
