import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import type { Reservation } from '@/types/game';
import { TIME_SLOTS, TIME_SLOT_LABELS, GAME_CONFIG } from '@/utils/constants';
import { cn } from '@/lib/utils';
import { Clock, Cat, Coins, AlertTriangle, CheckCircle, Armchair, RefreshCw, X } from 'lucide-react';

interface ReservationCardProps {
  reservation: Reservation;
}

export const ReservationCard: React.FC<ReservationCardProps> = ({ reservation }) => {
  const { cats, seats, reservations, timeOfDay, seatReservation, settleReservation, rescheduleReservation } = useGameStore();
  const [showRescheduleModal, setShowRescheduleModal] = useState(false);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null);
  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);

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
  const canReschedule = !reservation.rescheduled && (reservation.status === 'pending' || reservation.status === 'arrived');
  const isPastArrival = reservation.status === 'arrived' || timeOfDay >= reservation.timeSlot;
  const depositLoss = isPastArrival
    ? Math.round(reservation.deposit * GAME_CONFIG.RESERVATION_RESCHEDULE_DEPOSIT_LOSS)
    : 0;

  const activeReservations = reservations.filter(
    (r) => r.id !== reservation.id && r.status !== 'settled' && r.status !== 'expired'
  );
  const existingSlotSeat = new Set(
    activeReservations.map((r) => `${r.seatId}-${r.timeSlot}`)
  );

  const handleReschedule = () => {
    if (!selectedSeatId || selectedTimeSlot === null) return;
    const success = rescheduleReservation(reservation.id, selectedSeatId, selectedTimeSlot);
    if (success) {
      setShowRescheduleModal(false);
      setSelectedTimeSlot(null);
      setSelectedSeatId(null);
    }
  };

  const canConfirmReschedule =
    selectedSeatId !== null &&
    selectedTimeSlot !== null &&
    !existingSlotSeat.has(`${selectedSeatId}-${selectedTimeSlot}`);

  const openRescheduleModal = () => {
    setSelectedTimeSlot(reservation.timeSlot);
    setSelectedSeatId(reservation.seatId);
    setShowRescheduleModal(true);
  };

  return (
    <>
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
                {reservation.rescheduled && (
                  <span className="ml-1 px-1.5 py-0.5 bg-lavender/20 text-lavender rounded text-[10px] font-bold">
                    已改约
                  </span>
                )}
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

            {canReschedule && (
              <button
                onClick={openRescheduleModal}
                className="mt-2.5 w-full flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-lavender to-pink text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <RefreshCw className="w-4 h-4" />
                改约一次
                {isPastArrival && (
                  <span className="text-[10px] opacity-90">（扣{depositLoss}💰）</span>
                )}
              </button>
            )}

            {isActionable && (
              <button
                onClick={() => seatReservation(reservation.id)}
                className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-mint to-mint-dark text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <Armchair className="w-4 h-4" />
                安排入座
              </button>
            )}

            {reservation.status === 'seated' && (
              <button
                onClick={() => settleReservation(reservation.id)}
                className="mt-2 w-full flex items-center justify-center gap-1.5 py-2 bg-gradient-to-r from-peach to-sunset text-white font-bold text-sm rounded-xl shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98] transition-all"
              >
                <CheckCircle className="w-4 h-4" />
                结算离店
              </button>
            )}
          </div>
        </div>
      </div>

      {showRescheduleModal && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 animate-fade-in">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowRescheduleModal(false)} />
          <div className="relative w-full max-w-md bg-gradient-to-b from-cream to-warm-50 rounded-3xl shadow-2xl border-4 border-lavender overflow-hidden animate-scale-in">
            <div className="px-5 py-4 bg-gradient-to-r from-lavender via-pink to-lavender border-b-4 border-pink">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <RefreshCw className="w-5 h-5 text-white drop-shadow" />
                  <h3 className="text-lg font-black text-white drop-shadow">改约预约</h3>
                </div>
                <button
                  onClick={() => setShowRescheduleModal(false)}
                  className="p-1.5 rounded-full bg-white/20 hover:bg-white/30 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              {reservation.rescheduled && (
                <p className="text-white/80 text-xs mt-1">每位顾客仅可改约一次</p>
              )}
            </div>

            <div className="p-5 space-y-4 max-h-[60vh] overflow-y-auto">
              {isPastArrival && (
                <div className="p-3 bg-danger/10 border-2 border-danger/30 rounded-xl">
                  <div className="flex items-center gap-2 text-sm font-bold text-danger">
                    <AlertTriangle className="w-4 h-4" />
                    <span>已超过原定到店时间</span>
                  </div>
                  <p className="text-xs text-danger/80 mt-1">
                    改约将扣除 50% 定金：<span className="font-bold">-{depositLoss}💰</span>
                  </p>
                </div>
              )}

              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-coffee-dark mb-2">
                  <Clock className="w-4 h-4 text-coffee" />
                  选择新时段
                </label>
                <div className="flex flex-wrap gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isPast = slot <= timeOfDay + 2;
                    const isTaken = selectedSeatId
                      ? existingSlotSeat.has(`${selectedSeatId}-${slot}`)
                      : false;
                    const isCurrent = slot === reservation.timeSlot;
                    const disabled = isPast || isTaken;
                    return (
                      <button
                        key={slot}
                        onClick={() => !disabled && setSelectedTimeSlot(slot)}
                        disabled={disabled}
                        className={cn(
                          'px-3 py-1.5 rounded-xl text-sm font-bold transition-all border-2',
                          selectedTimeSlot === slot
                            ? 'bg-gradient-to-r from-lavender to-pink text-white border-transparent shadow-md scale-105'
                            : disabled
                              ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                              : isCurrent
                                ? 'bg-lavender/10 text-lavender border-lavender/40 hover:bg-lavender/20'
                                : 'bg-white text-coffee border-warm-200 hover:border-lavender hover:bg-lavender/10'
                        )}
                      >
                        {TIME_SLOT_LABELS[slot]}
                        {isCurrent && ' · 原'}
                        {isTaken && ' 🔒'}
                        {isPast && !isTaken && ' ⏳'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-coffee-dark mb-2">
                  <Armchair className="w-4 h-4 text-mint-dark" />
                  选择新座位
                </label>
                <div className="flex flex-wrap gap-2">
                  {seats.map((s) => {
                    const isOccupied = !!s.customerId;
                    const hasConflict =
                      selectedTimeSlot !== null &&
                      existingSlotSeat.has(`${s.id}-${selectedTimeSlot}`);
                    const isCurrent = s.id === reservation.seatId;
                    const disabled = isOccupied || hasConflict;
                    return (
                      <button
                        key={s.id}
                        onClick={() => !disabled && setSelectedSeatId(s.id)}
                        disabled={disabled}
                        className={cn(
                          'px-3 py-1.5 rounded-xl text-sm font-bold transition-all border-2',
                          selectedSeatId === s.id
                            ? 'bg-gradient-to-r from-mint to-mint-dark text-white border-transparent shadow-md scale-105'
                            : disabled
                              ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                              : isCurrent
                                ? 'bg-mint/10 text-mint-dark border-mint/40 hover:bg-mint/20'
                                : 'bg-white text-coffee border-warm-200 hover:border-mint hover:bg-mint/10'
                        )}
                      >
                        #{s.seatNumber}
                        {isCurrent && ' · 原'}
                        {isOccupied && ' 👤'}
                        {hasConflict && ' 🔒'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="p-3 bg-gold/10 border-2 border-gold/30 rounded-xl">
                <div className="flex items-center justify-between">
                  <span className="text-sm font-bold text-coffee-dark">定金变更</span>
                  <div className="text-right">
                    {depositLoss > 0 ? (
                      <>
                        <div className="text-xs text-coffee-light line-through">
                          原定金 {reservation.deposit}💰
                        </div>
                        <div className="text-sm font-black text-danger">
                          扣除 {depositLoss}💰 → 剩余 {reservation.deposit - depositLoss}💰
                        </div>
                      </>
                    ) : (
                      <div className="text-sm font-bold text-gold">
                        定金不变 {reservation.deposit}💰
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="px-5 py-4 bg-warm-50 border-t-2 border-warm-200">
              <button
                onClick={handleReschedule}
                disabled={!canConfirmReschedule}
                className={cn(
                  'w-full py-2.5 rounded-xl font-black text-base transition-all',
                  canConfirmReschedule
                    ? 'bg-gradient-to-r from-lavender to-pink text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                )}
              >
                {canConfirmReschedule ? '确认改约' : '请选择时段和座位'}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};
