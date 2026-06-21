import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import type { DeliveryOrder } from '@/types/game';
import { formatDeliveryTime } from '@/utils/gameLogic';
import { cn } from '@/lib/utils';
import { Clock, Coffee, Coins, AlertTriangle, CheckCircle, PlayCircle, Package, TrendingDown, ChefHat } from 'lucide-react';
import { ProgressBar } from './ProgressBar';

interface DeliveryCardProps {
  order: DeliveryOrder;
}

export const DeliveryCard: React.FC<DeliveryCardProps> = ({ order }) => {
  const { acceptDeliveryOrder, startMakingDelivery, completeDeliveryOrder, refundDeliveryOrder, barStations } = useGameStore();

  const station = order.barStationId
    ? barStations.find((s) => s.id === order.barStationId)
    : null;

  const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pending: {
      label: '待接单',
      color: 'text-sunset',
      bg: 'bg-sunset/10 border-sunset/30',
      icon: <Clock className="w-3.5 h-3.5 animate-pulse" />,
    },
    accepted: {
      label: '已接单',
      color: 'text-coffee',
      bg: 'bg-coffee/10 border-coffee/30',
      icon: <CheckCircle className="w-3.5 h-3.5" />,
    },
    making: {
      label: '制作中',
      color: 'text-lavender',
      bg: 'bg-lavender/15 border-lavender/40',
      icon: <ChefHat className="w-3.5 h-3.5" />,
    },
    delivering: {
      label: '配送中',
      color: 'text-mint-dark',
      bg: 'bg-mint/15 border-mint/40',
      icon: <Package className="w-3.5 h-3.5" />,
    },
    completed: {
      label: '已完成',
      color: 'text-gray-400',
      bg: 'bg-gray-100 border-gray-300',
      icon: <CheckCircle className="w-3.5 h-3.5" />,
    },
    refunded: {
      label: '已退款',
      color: 'text-danger',
      bg: 'bg-danger/10 border-danger/30',
      icon: <TrendingDown className="w-3.5 h-3.5" />,
    },
    expired: {
      label: '已过期',
      color: 'text-gray-400',
      bg: 'bg-gray-100 border-gray-30',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
  };

  const config = statusConfig[order.status] || statusConfig.pending;
  const timePercent = (order.timeLeft / order.maxTime) * 100;
  const isUrgent = timePercent < 30;
  const hasEmptyStation = barStations.some((s) => !s.occupied);

  return (
    <div
      className={cn(
        'rounded-2xl border-2 p-3.5 transition-all',
        config.bg,
        order.status === 'completed' || order.status === 'refunded' || order.status === 'expired'
          ? 'opacity-60'
          : 'shadow-sm hover:shadow-md',
        isUrgent && (order.status === 'pending' || order.status === 'accepted' || order.status === 'making') && 'animate-pulse'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl">{order.customerEmoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-black text-coffee-dark text-sm truncate">
              {order.customerName}
            </span>
            <div className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold', config.color)}>
              {config.icon}
              <span>{config.label}</span>
            </div>
          </div>

          <div className="space-y-1.5 text-xs">
            <div className="flex items-center gap-1.5 text-coffee-light">
              <Coffee className="w-3 h-3" />
              <span>饮品: <span className="font-bold text-coffee">{order.drinkEmoji} {order.drinkName}</span></span>
            </div>

            <div className="flex items-center gap-1.5 text-coffee-light">
              <Coins className="w-3 h-3" />
              <span>
                饮品: <span className="font-bold text-gold">{order.drinkPrice}💰</span>
                {' + '}
                配送: <span className="font-bold text-gold">{order.deliveryFee}💰</span>
                {' = '}
                总计: <span className="font-black text-mint-dark">{order.totalPrice}💰</span>
              </span>
            </div>

            <div className="space-y-1">
              <div className={cn(
                'flex items-center justify-between text-[11px] font-bold',
                isUrgent ? 'text-danger' : 'text-coffee-light'
              )}>
                <div className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  <span>剩余时间</span>
                </div>
                <span>{formatDeliveryTime(Math.max(0, order.timeLeft))}</span>
              </div>
              <ProgressBar
                value={Math.max(0, order.timeLeft)}
                max={order.maxTime}
                colorClass={isUrgent ? 'bg-danger' : 'bg-mint'}
                height="h-1.5"
              />
            </div>

            {order.status === 'making' && (
              <div className="space-y-1 mt-2">
                <div className="flex items-center justify-between text-[11px] font-bold text-lavender">
                  <div className="flex items-center gap-1">
                    <ChefHat className="w-3 h-3" />
                    <span>制作进度</span>
                  </div>
                  <span>{Math.round(order.makeProgress)}%</span>
                </div>
                <ProgressBar
                  value={order.makeProgress}
                  max={100}
                  colorClass="bg-lavender"
                  height="h-1.5"
                />
                {station && (
                  <div className="text-[10px] text-coffee-light/80">
                    {station.name} · Lv.{station.level} · 速度+{Math.round(station.speedBonus * 100)}%
                  </div>
                )}
              </div>
            )}

            {station && order.status !== 'making' && order.status !== 'delivering' && (
              <div className="text-[10px] text-coffee-light/80">
                占用: {station.name}
              </div>
            )}
          </div>

          {order.status === 'pending' && (
            <div className="flex gap-2 mt-2.5">
              <button
                onClick={() => acceptDeliveryOrder(order.id)}
                disabled={!hasEmptyStation}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2 font-bold text-sm rounded-xl shadow-md transition-all',
                  hasEmptyStation
                    ? 'bg-gradient-to-r from-mint to-mint-dark text-white hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                )}
              >
                <CheckCircle className="w-4 h-4" />
                {hasEmptyStation ? '接单' : '吧台已满'}
              </button>
            </div>
          )}

          {order.status === 'accepted' && (
            <div className="flex gap-2 mt-2.5">
              <button
                onClick={() => startMakingDelivery(order.id)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-lavender to-pink text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <PlayCircle className="w-4 h-4" />
                开始制作
              </button>
              <button
                onClick={() => refundDeliveryOrder(order.id)}
                className="flex items-center justify-center gap-1.5 px-3 py-2 bg-danger/20 text-danger font-bold text-sm rounded-xl shadow-sm hover:bg-danger/30 transition-all"
              >
                <TrendingDown className="w-4 h-4" />
                退款
              </button>
            </div>
          )}

          {order.status === 'making' && order.makeProgress >= 100 && (
            <button
              onClick={() => completeDeliveryOrder(order.id)}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-mint to-mint-dark text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all animate-bounce-slow"
            >
              <Package className="w-4 h-4" />
              送出并完成
            </button>
          )}

          {order.status === 'delivering' && order.makeProgress >= 100 && (
            <button
              onClick={() => completeDeliveryOrder(order.id)}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-mint to-mint-dark text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              确认送达
            </button>
          )}

          {(order.status === 'making' || order.status === 'delivering') && order.makeProgress < 100 && (
            <button
              onClick={() => refundDeliveryOrder(order.id)}
              className="mt-2 w-full flex items-center justify-center gap-1.5 py-1.5 bg-danger/20 text-danger font-bold text-xs rounded-xl hover:bg-danger/30 transition-all"
            >
              <AlertTriangle className="w-3.5 h-3.5" />
              取消并退款
            </button>
          )}

          {isUrgent && (order.status === 'pending' || order.status === 'accepted') && (
            <div className="mt-2 px-2.5 py-1.5 bg-danger/10 border border-danger/30 rounded-xl">
              <div className="flex items-center gap-1 text-[11px] font-bold text-danger">
                <AlertTriangle className="w-3 h-3" />
                <span>即将超时！请尽快处理</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
