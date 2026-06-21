import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { formatTime } from '@/utils/gameLogic';
import { Coins, Clock, Flame, Calendar, TrendingUp, Zap } from 'lucide-react';

export const StatusBar: React.FC = () => {
  const { coins, day, timeOfDay, combo, todayRevenue, isRushHour, queue } = useGameStore();

  return (
    <div className="relative bg-gradient-to-r from-coffee via-coffee-light to-coffee px-6 py-3 shadow-lg border-b-4 border-coffee-dark">
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(circle_at_20%_50%,#fff_0%,transparent_50%),radial-gradient(circle_at_80%_50%,#fff_0%,transparent_50%)]" />
      <div className="relative flex items-center justify-between gap-4 max-w-7xl mx-auto">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 bg-warm-100/30 px-4 py-1.5 rounded-full backdrop-blur-sm border border-warm-100/40">
            <Calendar className="w-4 h-4 text-cream" />
            <span className="font-bold text-cream text-sm">第 {day} 天</span>
          </div>
          <div className="flex items-center gap-2 bg-warm-100/30 px-4 py-1.5 rounded-full backdrop-blur-sm border border-warm-100/40">
            <Clock className="w-4 h-4 text-cream" />
            <span className="font-bold text-cream text-sm">{formatTime(timeOfDay)}</span>
          </div>
          <div className="relative w-48 h-2 bg-warm-900/30 rounded-full overflow-hidden border border-warm-100/20">
            <div
              className="absolute inset-y-0 left-0 bg-gradient-to-r from-sunset to-peach rounded-full transition-all duration-500"
              style={{ width: `${timeOfDay}%` }}
            />
          </div>
        </div>

        <div className="flex items-center gap-6">
          {isRushHour && (
            <div className="flex items-center gap-1.5 bg-gradient-to-r from-danger via-sunset to-peach px-4 py-1.5 rounded-full shadow-md animate-pulse-slow border-2 border-white/50 relative">
              <Zap className="w-4 h-4 text-white fill-white drop-shadow-md" />
              <span className="font-black text-white drop-shadow-md text-sm">
                早高峰
              </span>
              {queue.length > 0 && (
                <span className="absolute -top-1.5 -right-1.5 min-w-[22px] h-[22px] px-1 bg-white text-coffee-dark text-[10px] font-black rounded-full flex items-center justify-center shadow-md border-2 border-sunset">
                  {queue.length}
                </span>
              )}
            </div>
          )}
          {combo > 0 && (
            <div className="flex items-center gap-2 bg-gradient-to-r from-peach to-sunset px-4 py-1.5 rounded-full shadow-md animate-pulse border-2 border-white/50">
              <Flame className="w-4 h-4 text-white drop-shadow-md" />
              <span className="font-black text-white drop-shadow-md">
                {combo}x 连击!
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 bg-warm-100/30 px-4 py-1.5 rounded-full backdrop-blur-sm border border-warm-100/40">
            <TrendingUp className="w-4 h-4 text-mint" />
            <span className="font-bold text-mint text-sm">+{todayRevenue}</span>
          </div>
          <div className="flex items-center gap-2 bg-gradient-to-r from-gold to-yellow-400 px-5 py-2 rounded-full shadow-md border-2 border-white/50">
            <Coins className="w-5 h-5 text-white drop-shadow" />
            <span className="font-black text-white text-lg drop-shadow">{coins}</span>
          </div>
        </div>
      </div>
    </div>
  );
};
