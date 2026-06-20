import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Store, Pause, Play, SkipForward, Save, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ActionBar: React.FC = () => {
  const { isPaused, togglePause, nextDay, openUpgradeModal, saveGame, resetGame, timeOfDay } = useGameStore();

  const handleReset = () => {
    if (confirm('确定要重置游戏吗？所有进度将丢失！')) {
      resetGame();
    }
  };

  const canEndDay = timeOfDay >= 10 || true;

  return (
    <div className="bg-gradient-to-r from-coffee-dark via-coffee to-coffee-dark px-6 py-3 shadow-2xl border-t-4 border-warm-900/30">
      <div className="max-w-7xl mx-auto flex items-center justify-center gap-3 flex-wrap">
        <button
          onClick={openUpgradeModal}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-peach to-pink text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all border-2 border-white/30"
        >
          <Store className="w-4 h-4" />
          <span className="text-sm">升级商店</span>
        </button>

        <button
          onClick={togglePause}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all border-2',
            isPaused
              ? 'bg-gradient-to-r from-mint to-mint-dark text-white border-white/30'
              : 'bg-gradient-to-r from-sunset to-peach text-white border-white/30'
          )}
        >
          {isPaused ? <Play className="w-4 h-4" /> : <Pause className="w-4 h-4" />}
          <span className="text-sm">{isPaused ? '继续' : '暂停'}</span>
        </button>

        <button
          onClick={nextDay}
          disabled={!canEndDay}
          className={cn(
            'flex items-center gap-2 px-5 py-2.5 font-bold rounded-full shadow-lg transition-all border-2 border-white/30',
            canEndDay
              ? 'bg-gradient-to-r from-lavender to-pink text-white hover:shadow-xl hover:scale-105 active:scale-95'
              : 'bg-gray-400 text-gray-200 cursor-not-allowed opacity-60'
          )}
        >
          <SkipForward className="w-4 h-4" />
          <span className="text-sm">结束今天</span>
        </button>

        <div className="w-px h-8 bg-white/20 mx-2" />

        <button
          onClick={saveGame}
          className="flex items-center gap-2 px-4 py-2.5 bg-white/20 hover:bg-white/30 text-cream font-bold rounded-full transition-all border border-white/30"
          title="保存游戏"
        >
          <Save className="w-4 h-4" />
          <span className="text-sm">保存</span>
        </button>

        <button
          onClick={handleReset}
          className="flex items-center gap-2 px-4 py-2.5 bg-danger/30 hover:bg-danger/50 text-white font-bold rounded-full transition-all border border-white/20"
          title="重置游戏"
        >
          <RotateCcw className="w-4 h-4" />
          <span className="text-sm">重置</span>
        </button>
      </div>
    </div>
  );
};
