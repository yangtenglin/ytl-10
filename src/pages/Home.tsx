import React, { useEffect, useRef } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { StatusBar } from '@/components/StatusBar';
import { CatPanel } from '@/components/CatPanel';
import { ShopArea } from '@/components/ShopArea';
import { MenuPanel } from '@/components/MenuPanel';
import { ActionBar } from '@/components/ActionBar';
import { UpgradeModal } from '@/components/UpgradeModal';
import { DailyReportModal } from '@/components/DailyReportModal';
import { ReservationPanel } from '@/components/ReservationPanel';
import { CatTrainingModal } from '@/components/CatTrainingModal';
import { DeliveryPanel } from '@/components/DeliveryPanel';
import { QueuePanel } from '@/components/QueuePanel';
import { GAME_CONFIG } from '@/utils/constants';

const Home: React.FC = () => {
  const { tick, loadGame, saveGame, isPaused, showDailyReport, showUpgradeModal, showReservationPanel, showCatTraining, showDeliveryPanel, isRushHour, queue } = useGameStore();
  const lastTickRef = useRef<number>(Date.now());
  const rafRef = useRef<number>(0);
  const loadedRef = useRef(false);

  useEffect(() => {
    if (!loadedRef.current) {
      loadedRef.current = true;
      loadGame();
    }
  }, [loadGame]);

  useEffect(() => {
    const gameLoop = () => {
      const now = Date.now();
      const delta = (now - lastTickRef.current) / 1000;
      lastTickRef.current = now;

      if (!isPaused && !showDailyReport && !showUpgradeModal && !showReservationPanel && !showCatTraining && !showDeliveryPanel) {
        tick(Math.min(delta, 0.1));
      }

      rafRef.current = requestAnimationFrame(gameLoop);
    };

    rafRef.current = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [tick, isPaused, showDailyReport, showUpgradeModal, showReservationPanel, showCatTraining, showDeliveryPanel]);

  useEffect(() => {
    const interval = setInterval(() => {
      saveGame();
    }, 10000);
    return () => clearInterval(interval);
  }, [saveGame]);

  useEffect(() => {
    const handleBeforeUnload = () => {
      saveGame();
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [saveGame]);

  void GAME_CONFIG;

  const showQueuePanel = isRushHour || queue.length > 0;

  return (
    <div className="min-h-screen flex flex-col bg-texture">
      <StatusBar />

      <main className="flex-1 p-4 overflow-hidden">
        <div className="h-full max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-[280px_1fr_280px] gap-4">
          <div className="hidden lg:block h-[calc(100vh-200px)]">
            <CatPanel />
          </div>

          <div className="h-[calc(100vh-200px)] min-h-[500px]">
            <ShopArea />
          </div>

          <div className="hidden lg:flex flex-col gap-4 h-[calc(100vh-200px)]">
            {showQueuePanel && (
              <div className="flex-1 min-h-0 max-h-[55%]">
                <QueuePanel />
              </div>
            )}
            <div className={showQueuePanel ? 'flex-1 min-h-0' : 'h-full'}>
              <MenuPanel />
            </div>
          </div>
        </div>

        <div className="lg:hidden mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          {showQueuePanel && (
            <div className="h-[340px] md:col-span-2">
              <QueuePanel />
            </div>
          )}
          <div className="h-[300px]">
            <CatPanel />
          </div>
          <div className="h-[300px]">
            <MenuPanel />
          </div>
        </div>
      </main>

      <ActionBar />
      <UpgradeModal />
      <DailyReportModal />
      <ReservationPanel />
      <CatTrainingModal />
      <DeliveryPanel />

      {isPaused && !showUpgradeModal && !showDailyReport && !showReservationPanel && !showCatTraining && !showDeliveryPanel && (
        <div className="fixed inset-0 z-40 flex items-center justify-center bg-black/40 backdrop-blur-sm animate-fade-in">
          <div className="px-12 py-8 bg-gradient-to-br from-coffee via-coffee-light to-coffee rounded-3xl shadow-2xl border-4 border-white/30 animate-scale-in">
            <div className="text-7xl text-center mb-4 animate-bounce-slow">😸</div>
            <h2 className="text-4xl font-black text-cream text-center drop-shadow-lg font-cute">
              游戏暂停
            </h2>
            <p className="text-warm-100 text-center mt-2 font-bold">
              点击底部「继续」按钮恢复游戏
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default Home;
