import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { DeliveryCard } from './DeliveryCard';
import { GAME_CONFIG } from '@/utils/constants';
import { X, Bike, ChefHat, Coins, TrendingUp, TrendingDown, CheckCircle, Clock, AlertTriangle, Plus, Zap } from 'lucide-react';
import { cn } from '@/lib/utils';

export const DeliveryPanel: React.FC = () => {
  const {
    showDeliveryPanel,
    closeDeliveryPanel,
    deliveryOrders,
    barStations,
    coins,
    todayDeliveryStats,
    upgradeBarStation,
    expandBarStation,
  } = useGameStore();

  if (!showDeliveryPanel) return null;

  const pendingOrders = deliveryOrders.filter((o) => o.status === 'pending');
  const activeOrders = deliveryOrders.filter((o) => o.status !== 'pending' && o.status !== 'completed' && o.status !== 'refunded' && o.status !== 'expired');
  const completedCount = todayDeliveryStats.completedOrders;
  const successRate = todayDeliveryStats.totalOrders > 0
    ? Math.round((completedCount / todayDeliveryStats.totalOrders) * 100)
    : 0;

  const expandCost = GAME_CONFIG.DELIVERY_EXPAND_COST_BASE * Math.pow(GAME_CONFIG.DELIVERY_EXPAND_COST_MULTIPLIER, barStations.length - 1);
  const canExpand = barStations.length < GAME_CONFIG.DELIVERY_MAX_STATIONS && coins >= expandCost;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeDeliveryPanel} />
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-gradient-to-b from-cream to-warm-50 rounded-3xl shadow-2xl border-4 border-coffee-light overflow-hidden animate-scale-in">
        <div className="sticky top-0 z-10 px-6 py-4 bg-gradient-to-r from-sunset via-peach to-sunset border-b-4 border-coffee-dark">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Bike className="w-7 h-7 text-cream drop-shadow" />
              <h2 className="text-2xl font-black text-cream drop-shadow">🛵 外卖订单</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-gold to-yellow-400 rounded-full shadow-md border-2 border-white/50">
                <Coins className="w-5 h-5 text-white drop-shadow" />
                <span className="font-black text-white text-lg drop-shadow">{coins}</span>
              </div>
              <button
                onClick={closeDeliveryPanel}
                className="p-2 rounded-full bg-cream/20 hover:bg-cream/30 text-cream transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)] space-y-6">
          <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="p-4 bg-gradient-to-br from-mint/20 to-mint/10 rounded-2xl border-2 border-mint/40">
              <div className="flex items-center gap-2 mb-2">
                <TrendingUp className="w-4 h-4 text-mint" />
                <span className="text-xs font-bold text-mint">外卖收入</span>
              </div>
              <div className="text-2xl font-black text-mint-dark">+{todayDeliveryStats.deliveryRevenue}💰</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-danger/20 to-danger/10 rounded-2xl border-2 border-danger/40">
              <div className="flex items-center gap-2 mb-2">
                <TrendingDown className="w-4 h-4 text-danger" />
                <span className="text-xs font-bold text-danger">超时退款</span>
              </div>
              <div className="text-2xl font-black text-danger">-{todayDeliveryStats.deliveryRefunds}💰</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-lavender/20 to-lavender/10 rounded-2xl border-2 border-lavender/40">
              <div className="flex items-center gap-2 mb-2">
                <CheckCircle className="w-4 h-4 text-lavender" />
                <span className="text-xs font-bold text-lavender">完成/总计</span>
              </div>
              <div className="text-2xl font-black text-lavender-dark">{completedCount}/{todayDeliveryStats.totalOrders}</div>
            </div>
            <div className="p-4 bg-gradient-to-br from-gold/20 to-gold/10 rounded-2xl border-2 border-gold/40">
              <div className="flex items-center gap-2 mb-2">
                <Zap className="w-4 h-4 text-gold" />
                <span className="text-xs font-bold text-gold">完成率</span>
              </div>
              <div className="text-2xl font-black text-gold">{successRate}%</div>
            </div>
          </section>

          <section className="p-5 bg-gradient-to-br from-lavender/20 to-pink/10 rounded-2xl border-2 border-lavender/40">
            <div className="flex items-center gap-2 mb-4">
              <ChefHat className="w-5 h-5 text-lavender" />
              <h3 className="text-lg font-black text-coffee-dark">吧台管理</h3>
              <span className="ml-auto text-xs text-coffee-light">
                {barStations.filter((s) => !s.occupied).length}/{barStations.length} 空闲
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
              {barStations.map((station) => (
                <div
                  key={station.id}
                  className={cn(
                    'p-3 rounded-xl border-2 transition-all',
                    station.occupied
                      ? 'bg-sunset/10 border-sunset/40'
                      : 'bg-mint/10 border-mint/40'
                  )}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="font-black text-coffee-dark text-sm">{station.name}</span>
                    <span className={cn(
                      'px-2 py-0.5 rounded-full text-[10px] font-bold',
                      station.occupied
                        ? 'bg-sunset/20 text-sunset'
                        : 'bg-mint/20 text-mint'
                    )}>
                      {station.occupied ? '使用中' : '空闲'}
                    </span>
                  </div>
                  <div className="text-xs text-coffee-light mb-2">
                    Lv.{station.level} · 速度+{Math.round(station.speedBonus * 100)}%
                  </div>
                  <button
                    onClick={() => upgradeBarStation(station.id)}
                    disabled={coins < station.upgradeCost || station.occupied}
                    className={cn(
                      'w-full flex items-center justify-center gap-1 py-1.5 rounded-lg text-[11px] font-bold transition-all',
                      coins >= station.upgradeCost && !station.occupied
                        ? 'bg-gradient-to-r from-lavender to-pink text-white hover:shadow-md hover:scale-[1.02]'
                        : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                    )}
                  >
                    <Zap className="w-3 h-3" />
                    升级 {station.upgradeCost}💰
                  </button>
                </div>
              ))}

              {barStations.length < GAME_CONFIG.DELIVERY_MAX_STATIONS && (
                <button
                  onClick={expandBarStation}
                  disabled={!canExpand}
                  className={cn(
                    'p-3 rounded-xl border-2 border-dashed transition-all flex flex-col items-center justify-center gap-2',
                    canExpand
                      ? 'border-mint/40 bg-mint/5 hover:bg-mint/10 text-mint'
                      : 'border-gray-300 bg-gray-50 text-gray-400 cursor-not-allowed'
                  )}
                >
                  <Plus className="w-6 h-6" />
                  <span className="text-xs font-bold">新增吧台</span>
                  <span className="text-[10px]">{expandCost}💰</span>
                </button>
              )}
            </div>
          </section>

          {pendingOrders.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-sunset/20 animate-pulse">
                  <Clock className="w-5 h-5 text-sunset" />
                </div>
                <h3 className="text-lg font-black text-coffee-dark">待接单</h3>
                <span className="ml-auto px-2.5 py-0.5 bg-sunset/15 rounded-full text-xs font-bold text-sunset">
                  {pendingOrders.length} 单
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pendingOrders.map((order) => (
                  <DeliveryCard key={order.id} order={order} />
                ))}
              </div>
            </section>
          )}

          {activeOrders.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-lavender/20">
                  <ChefHat className="w-5 h-5 text-lavender" />
                </div>
                <h3 className="text-lg font-black text-coffee-dark">处理中</h3>
                <span className="ml-auto px-2.5 py-0.5 bg-lavender/15 rounded-full text-xs font-bold text-lavender">
                  {activeOrders.length} 单
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeOrders.map((order) => (
                  <DeliveryCard key={order.id} order={order} />
                ))}
              </div>
            </section>
          )}

          {todayDeliveryStats.totalOrders > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-gray-200">
                  <CheckCircle className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-black text-gray-500">今日统计</h3>
              </div>
              <div className="p-4 bg-white/50 rounded-2xl border border-warm-200">
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div className="text-center">
                    <div className="text-2xl font-black text-coffee-dark">{todayDeliveryStats.totalOrders}</div>
                    <div className="text-xs text-coffee-light">总订单数</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-mint">{todayDeliveryStats.completedOrders}</div>
                    <div className="text-xs text-coffee-light">已完成</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-danger">{todayDeliveryStats.refundedOrders}</div>
                    <div className="text-xs text-coffee-light">已退款</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-black text-gray-400">{todayDeliveryStats.expiredOrders}</div>
                    <div className="text-xs text-coffee-light">已过期</div>
                  </div>
                </div>
                <div className="mt-4 pt-4 border-t border-dashed border-warm-300 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-mint" />
                    <span className="text-sm font-bold text-coffee-dark">净利润</span>
                  </div>
                  <span className={cn(
                    'text-xl font-black',
                    todayDeliveryStats.deliveryRevenue - todayDeliveryStats.deliveryRefunds >= 0
                      ? 'text-mint'
                      : 'text-danger'
                  )}>
                    {todayDeliveryStats.deliveryRevenue - todayDeliveryStats.deliveryRefunds >= 0 ? '+' : ''}
                    {todayDeliveryStats.deliveryRevenue - todayDeliveryStats.deliveryRefunds}💰
                  </span>
                </div>
              </div>
            </section>
          )}

          {deliveryOrders.length === 0 && todayDeliveryStats.totalOrders === 0 && (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">🛵</div>
              <p className="text-coffee-light font-bold">暂无外卖订单</p>
              <p className="text-coffee-light/60 text-sm mt-1">外卖订单会自动生成，请耐心等待~</p>
            </div>
          )}

          {pendingOrders.length === 0 && activeOrders.length === 0 && todayDeliveryStats.totalOrders > 0 && (
            <div className="text-center py-6">
              <div className="text-4xl mb-2 animate-bounce-slow">✨</div>
              <p className="text-coffee-light font-bold">所有订单已处理完毕！</p>
            </div>
          )}

          {pendingOrders.some((o) => o.timeLeft / o.maxTime < 0.3) && (
            <div className="p-4 bg-danger/10 border-2 border-danger/30 rounded-2xl">
              <div className="flex items-center gap-2 text-danger">
                <AlertTriangle className="w-5 h-5 animate-pulse" />
                <span className="font-bold">有订单即将超时！请尽快处理！</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
