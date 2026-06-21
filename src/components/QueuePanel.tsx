import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { ProgressBar } from './ProgressBar';
import { Users, Coffee, AlertTriangle, ArrowRight, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';
import { GAME_CONFIG } from '@/utils/constants';

export const QueuePanel: React.FC = () => {
  const { queue, drinks, isRushHour, todayQueueServed, todayQueueLeftAngry, seatNextFromQueue, timeOfDay } = useGameStore();

  const drinkMap = new Map(drinks.map((d) => [d.id, d]));

  const totalQueueStats = {
    served: todayQueueServed,
    angry: todayQueueLeftAngry,
  };

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-sunset/5 via-cream to-warm-100 rounded-3xl border-2 border-sunset/30 shadow-xl overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-sunset via-peach to-sunset border-b-4 border-sunset/50">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="relative">
              <Users className="w-5 h-5 text-white drop-shadow" />
              {isRushHour && (
                <span className="absolute -top-1 -right-1 w-3 h-3 bg-danger rounded-full animate-ping" />
              )}
            </div>
            <h2 className="font-black text-white text-sm drop-shadow">
              早高峰排队
            </h2>
          </div>
          {isRushHour ? (
            <div className="flex items-center gap-1 px-2 py-0.5 bg-danger/80 rounded-full border border-white/30">
              <Zap className="w-3 h-3 text-white fill-white animate-pulse" />
              <span className="text-white text-[10px] font-black">火热进行中</span>
            </div>
          ) : (
              <div className="px-2 py-0.5 bg-warm-300/50 rounded-full border border-white/20">
                <span className="text-white/80 text-[10px] font-bold">非高峰时段</span>
              </div>
            )}
        </div>
      </div>

      <div className="px-3 py-2 bg-white/40 border-b border-warm-200">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="py-1.5 bg-white/70 rounded-xl border border-warm-200">
            <div className="text-lg font-black text-coffee-dark">{queue.length}</div>
            <div className="text-[9px] text-coffee-light font-bold">排队中</div>
          </div>
          <div className="py-1.5 bg-mint/10 rounded-xl border border-mint/30">
            <div className="text-lg font-black text-mint-dark">{totalQueueStats.served}</div>
            <div className="text-[9px] text-coffee-light font-bold">已入座</div>
          </div>
          <div className="py-1.5 bg-danger/10 rounded-xl border border-danger/30">
            <div className="text-lg font-black text-danger">{totalQueueStats.angry}</div>
            <div className="text-[9px] text-coffee-light font-bold">不耐烦走掉</div>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2">
        {queue.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-center py-8">
            <div className="text-4xl mb-2 opacity-40">☕</div>
            <p className="text-sm text-coffee-light font-bold">
              {isRushHour ? '正在招揽顾客...' : '暂无顾客排队'}
            </p>
            {!isRushHour && (
              <p className="text-[10px] text-coffee-light/70 mt-1">
                时间 {Math.round(timeOfDay)}% · 早高峰 5%-45%
              </p>
            )}
          </div>
        ) : (
          queue.map((customer, index) => {
          const desiredDrink = customer.desiredDrinkId ? drinkMap.get(customer.desiredDrinkId) : undefined;
          const patiencePercent = (customer.patience / customer.maxPatience) * 100;
          const patienceColor =
            patiencePercent > 50
              ? 'bg-mint'
              : patiencePercent > 25
                ? 'bg-sunset'
                : 'bg-danger animate-pulse';
          const isFirst = index === 0;

          return (
            <div
              key={customer.id}
              className={cn(
                'relative rounded-2xl border-2 transition-all duration-300 p-2.5',
                isFirst
                  ? 'bg-gradient-to-r from-peach/30 via-white to-white border-peach/50 shadow-lg'
                  : 'bg-white/70 border-warm-200 shadow-sm'
              )}
            >
              <div className="flex items-center gap-2.5">
                <div className={cn(
                  'flex-shrink-0 w-9 h-9 rounded-full flex items-center justify-center border-2',
                  isFirst
                    ? 'bg-peach/20 border-peach/50 text-xl'
                    : 'bg-warm-100 border-warm-200 text-lg'
                )}>
                  <span className={cn(
                    customer.status === 'leaving-queue' && 'animate-shake opacity-60 grayscale'
                  )}>
                    {customer.emoji}
                  </span>
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-1.5">
                    <span className={cn(
                      'text-xs font-black truncate',
                      isFirst ? 'text-coffee-dark' : 'text-coffee'
                    )}>
                      {customer.name}
                    </span>
                    {isFirst && (
                      <span className="px-1.5 py-0.5 bg-peach rounded-full text-[9px] font-black text-white">
                        下一位
                      </span>
                    )}
                  </div>

                  <div className="flex items-center gap-2 mt-1">
                    <div className="flex-1">
                      <ProgressBar
                        value={customer.patience}
                        max={customer.maxPatience}
                        colorClass={patienceColor}
                        bgClass="bg-warm-200/60"
                        height="h-1"
                      />
                    </div>
                    <span className="text-[9px] font-bold text-coffee-light w-8 text-right">
                      {Math.round(customer.patience)}
                    </span>
                  </div>

                  {desiredDrink && (
                    <div className="flex items-center gap-1 mt-1.5 px-2 py-0.5 bg-coffee/5 rounded-lg border border-coffee/10">
                      <Coffee className="w-2.5 h-2.5 text-coffee" />
                      <span className="text-[10px] font-bold text-coffee truncate">
                        想喝 {desiredDrink.emoji} {desiredDrink.name}
                      </span>
                    </div>
                  )}
                </div>

                <div className="flex-shrink-0 flex flex-col items-end gap-1">
                  <div className={cn(
                    'px-2 py-0.5 rounded-full border text-[10px] font-black',
                    isFirst
                      ? 'bg-peach/20 border-peach/40 text-peach'
                      : 'bg-warm-100 border-warm-200 text-coffee-light'
                  )}>
                    #{customer.queuePosition}
                  </div>
                  {isFirst && (
                    <button
                      onClick={seatNextFromQueue}
                      className="p-1 bg-gradient-to-r from-mint to-mint-dark rounded-full border border-white/50 shadow-md hover:shadow-lg hover:scale-110 active:scale-95 transition-all"
                      title="优先安排入座"
                    >
                      <ArrowRight className="w-3.5 h-3.5 text-white" />
                    </button>
                  )}
                </div>
              </div>

              {patiencePercent < 25 && (
                <div className="absolute top-1 right-1">
                  <AlertTriangle className="w-3.5 h-3.5 text-danger animate-pulse" />
                </div>
              )}
            </div>
          );
        }))}
      </div>

      {queue.length > 0 && (
        <div className="px-3 py-2 bg-warm-100/60 border-t border-warm-200">
          <div className="flex items-center justify-between">
            <p className="text-[10px] text-coffee-light font-bold">
              💡 座位空闲自动安排入座
            </p>
            <p className="text-[10px] text-coffee-light">
              点击 ➡️ 可优先安排
            </p>
          </div>
        </div>
      )}

      {queue.length >= GAME_CONFIG.RUSH_HOUR_MAX_QUEUE && (
        <div className="px-3 py-1.5 bg-danger/15 border-t-2 border-danger/40">
          <div className="flex items-center gap-1.5 text-center justify-center">
            <AlertTriangle className="w-3 h-3 text-danger animate-pulse" />
            <span className="text-[10px] font-black text-danger">
              队伍已满！请加快服务速度
            </span>
          </div>
        </div>
      )}
    </div>
  );
};
