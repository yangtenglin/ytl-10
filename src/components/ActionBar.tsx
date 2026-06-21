import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { Store, Pause, Play, SkipForward, Save, RotateCcw, CalendarCheck, Heart, Bike } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ActionBar: React.FC = () => {
  const { isPaused, togglePause, nextDay, openUpgradeModal, openReservationPanel, openCatTraining, openDeliveryPanel, saveGame, resetGame, timeOfDay, todayCustomers, reservations, deliveryOrders } = useGameStore();

  const handleReset = () => {
    if (confirm('确定要重置游戏吗？所有进度将丢失！')) {
      resetGame();
    }
  };

  const canEndDay = timeOfDay >= 20 || (todayCustomers > 0 && timeOfDay >= 10);
  const activeReservations = reservations.filter((r) => r.status !== 'settled' && r.status !== 'expired');
  const pendingDeliveries = deliveryOrders.filter((o) => o.status === 'pending' || o.status === 'accepted' || o.status === 'making');

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
          onClick={openReservationPanel}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-lavender to-pink text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all border-2 border-white/30 relative"
        >
          <CalendarCheck className="w-4 h-4" />
          <span className="text-sm">预约管理</span>
          {activeReservations.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-danger text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-bounce">
              {activeReservations.length}
            </span>
          )}
        </button>

        <button
          onClick={openCatTraining}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-pink to-lavender text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all border-2 border-white/30"
        >
          <Heart className="w-4 h-4 fill-white" />
          <span className="text-sm">亲密训练</span>
        </button>

        <button
          onClick={openDeliveryPanel}
          className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-sunset to-peach text-white font-bold rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all border-2 border-white/30 relative"
        >
          <Bike className="w-4 h-4" />
          <span className="text-sm">外卖订单</span>
          {pendingDeliveries.length > 0 && (
            <span className="absolute -top-1.5 -right-1.5 w-5 h-5 bg-danger text-white text-[10px] font-black rounded-full flex items-center justify-center shadow-md animate-bounce">
              {pendingDeliveries.length}
            </span>
          )}
        </button>

        <button
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
