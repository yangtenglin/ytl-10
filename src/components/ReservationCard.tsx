import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import type { Reservation } from '@/types/game';
import { TIME_SLOT_LABELS } from '@/utils/constants';
import { cn } from '@/lib/utils';
import { Clock, Cat, Coins, AlertTriangle, CheckCircle, Armchair } from 'lucide-react';

interface ReservationCardProps {
  reservation: Reservation;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({ reservation }) => {
  const { cats, seats, seatReservation, settleReservation } = useGameStore();

  const preferredCat = reservation.preferredCatId
    ? cats.find((c) => c.id === reservation.preferredCatId)
    : null;

  const seat = seats.find((s) => s.id === reservation.seatId);

  const statusConfig: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    pending: {
      label: '等待中',
      color: 'text-coffee',
      bg: 'bg-coffee/10 border-coffee/30',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
    arrived: {
      label: '已到店',
      color: 'text-sunset',
      bg: 'bg-sunset/15 border-sunset/40',
      icon: <AlertTriangle className="w-3.5 h-3.5 animate-pulse" />,
    },
    seated: {
      label: '已入座',
      color: 'text-mint-dark',
      bg: 'bg-mint/15 border-mint/40',
      icon: <Armchair className="w-3.5 h-3.5" />,
    },
    settled: {
      label: '已结算',
      color: 'text-gray-400',
      bg: 'bg-gray-100 border-gray-300',
      icon: <CheckCircle className="w-3.5 h-3.5" />,
    },
    expired: {
      label: '已过期',
      color: 'text-gray-400',
      bg: 'bg-gray-100 border-gray-300',
      icon: <Clock className="w-3.5 h-3.5" />,
    },
  };

  const config = statusConfig[reservation.status] || statusConfig.pending;
  const isLate = reservation.lateness > 5;
  const isActionable = reservation.status === 'arrived';

  return (
    <div
      className={cn(
        'rounded-2xl border-2 p-3.5 transition-all',
        config.bg,
        reservation.status === 'settled' || reservation.status === 'expired'
          ? 'opacity-60'
          : 'shadow-sm hover:shadow-md'
      )}
    >
      <div className="flex items-start gap-3">
        <div className="text-3xl">{reservation.customerEmoji}</div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center justify-between mb-1.5">
            <span className="font-black text-coffee-dark text-sm truncate">
              {reservation.customerName}
            </span>
            <div className={cn('flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold', config.color)}>
              {config.icon}
              <span>{config.label}</span>
            </div>
          </div>

          <div className="space-y-1 text-xs text-coffee-light">
            <div className="flex items-center gap-1.5">
              <Clock className="w-3 h-3" />
              <span>时段: <span className="font-bold text-coffee">{TIME_SLOT_LABELS[reservation.timeSlot] || `${reservation.timeSlot}`}</span></span>
            </div>

            <div className="flex items-center gap-1.5">
              <Cat className="w-3 h-3" />
              <span>偏好猫: {preferredCat ? (
                <span className="font-bold text-coffee">{preferredCat.emoji} {preferredCat.name}</span>
              ) : (
                <span className="text-coffee-light/60">无</span>
              )}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <Coins className="w-3 h-3" />
              <span>定金: <span className="font-bold text-gold">{reservation.deposit}💰</span></span>
            </div>

            {seat && (
              <div className="flex items-center gap-1.5">
                <Armchair className="w-3 h-3" />
                <span>座位: <span className="font-bold text-coffee">#{seat.seatNumber}</span></span>
              </div>
            )}
          </div>

          {isLate && reservation.status === 'arrived' && (
            <div className="mt-2 px-2.5 py-1.5 bg-danger/10 border border-danger/30 rounded-xl">
              <div className="flex items-center gap-1 text-[11px] font-bold text-danger">
                <AlertTriangle className="w-3 h-3" />
                <span>迟到 {Math.round(reservation.lateness)}s · 满意度 -{Math.round(reservation.satisfactionPenalty)}</span>
              </div>
            </div>
          )}

          {isActionable && (
            <button
              onClick={() => seatReservation(reservation.id)}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-mint to-mint-dark text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <Armchair className="w-4 h-4" />
              安排入座
            </button>
          )}

          {reservation.status === 'seated' && (
            <button
              onClick={() => settleReservation(reservation.id)}
              className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-peach to-sunset text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
            >
              <CheckCircle className="w-4 h-4" />
              结算离店
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
