import React, { useState } from 'react';
import { useGameStore } from '@/store/useGameStore';
import { ReservationCard } from './ReservationCard';
import { TIME_SLOTS, TIME_SLOT_LABELS, GAME_CONFIG } from '@/utils/constants';
import { X, CalendarPlus, Coins, Cat, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

export const ReservationPanel: React.FC = () => {
  const {
    showReservationPanel,
    closeReservationPanel,
    reservations,
    seats,
    cats,
    coins,
    timeOfDay,
    createReservation,
  } = useGameStore();

  const [selectedSeatId, setSelectedSeatId] = useState<string | null>(null);
  const [selectedTimeSlot, setSelectedTimeSlot] = useState<number | null>(null);
  const [selectedCatId, setSelectedCatId] = useState<string | null>(null);

  if (!showReservationPanel) return null;

  const availableCats = cats.filter((c) => c.unlocked && !c.isResting && !c.assignedSeatId);

  const activeReservations = reservations.filter(
    (r) => r.status !== 'settled' && r.status !== 'expired'
  );
  const pastReservations = reservations.filter(
    (r) => r.status === 'settled' || r.status === 'expired'
  );

  const existingSlotSeat = new Set(
    activeReservations.map((r) => `${r.seatId}-${r.timeSlot}`)
  );

  const canCreate =
    selectedSeatId &&
    selectedTimeSlot !== null &&
    coins >= GAME_CONFIG.RESERVATION_DEPOSIT &&
    !existingSlotSeat.has(`${selectedSeatId}-${selectedTimeSlot}`);

  const handleCreate = () => {
    if (!selectedSeatId || selectedTimeSlot === null) return;
    const success = createReservation(selectedSeatId, selectedTimeSlot, selectedCatId);
    if (success) {
      setSelectedSeatId(null);
      setSelectedTimeSlot(null);
      setSelectedCatId(null);
    }
  };

  const seatWithReservations = (seatId: string) =>
    activeReservations.filter((r) => r.seatId === seatId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeReservationPanel} />
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-gradient-to-b from-cream to-warm-50 rounded-3xl shadow-2xl border-4 border-coffee-light overflow-hidden animate-scale-in">
        <div className="sticky top-0 z-10 px-6 py-4 bg-gradient-to-r from-coffee via-coffee-light to-coffee border-b-4 border-coffee-dark">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <CalendarPlus className="w-7 h-7 text-cream drop-shadow" />
              <h2 className="text-2xl font-black text-cream drop-shadow">📋 撸猫桌预约</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-gold to-yellow-400 rounded-full shadow-md border-2 border-white/50">
                <Coins className="w-5 h-5 text-white drop-shadow" />
                <span className="font-black text-white text-lg drop-shadow">{coins}</span>
              </div>
              <button
                onClick={closeReservationPanel}
                className="p-2 rounded-full bg-cream/20 hover:bg-cream/30 text-cream transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)] space-y-6">
          <section className="p-5 bg-gradient-to-br from-lavender/20 to-pink/10 rounded-2xl border-2 border-lavender/40">
            <div className="flex items-center gap-2 mb-4">
              <CalendarPlus className="w-5 h-5 text-lavender" />
              <h3 className="text-lg font-black text-coffee-dark">新建预约</h3>
              <span className="ml-auto px-3 py-1 bg-gold/20 rounded-full text-xs font-bold text-gold border border-gold/40">
                定金 {GAME_CONFIG.RESERVATION_DEPOSIT} 💰
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-coffee-dark mb-2">
                  <Clock className="w-4 h-4 text-coffee" />
                  选择时段
                </label>
                <div className="flex flex-wrap gap-2">
                  {TIME_SLOTS.map((slot) => {
                    const isPast = slot <= timeOfDay + 2;
                    const isTaken = selectedSeatId
                      ? existingSlotSeat.has(`${selectedSeatId}-${slot}`)
                      : false;
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
                              : 'bg-white text-coffee border-warm-200 hover:border-lavender hover:bg-lavender/10'
                        )}
                      >
                        {TIME_SLOT_LABELS[slot]}
                        {isTaken && ' 🔒'}
                        {isPast && !isTaken && ' ⏳'}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-coffee-dark mb-2">
                  🪑 选择座位
                </label>
                <div className="flex flex-wrap gap-2">
                  {seats.map((seat) => {
                    const isOccupied = !!seat.customerId;
                    const seatReservations = seatWithReservations(seat.id);
                    const hasConflict =
                      selectedTimeSlot !== null &&
                      existingSlotSeat.has(`${seat.id}-${selectedTimeSlot}`);
                    const disabled = isOccupied || hasConflict;
                    return (
                      <button
                        key={seat.id}
                        onClick={() => !disabled && setSelectedSeatId(seat.id)}
                        disabled={disabled}
                        className={cn(
                          'px-3 py-1.5 rounded-xl text-sm font-bold transition-all border-2',
                          selectedSeatId === seat.id
                            ? 'bg-gradient-to-r from-mint to-mint-dark text-white border-transparent shadow-md scale-105'
                            : disabled
                              ? 'bg-gray-200 text-gray-400 border-gray-300 cursor-not-allowed'
                              : 'bg-white text-coffee border-warm-200 hover:border-mint hover:bg-mint/10'
                        )}
                      >
                        #{seat.seatNumber}
                        {isOccupied && ' 👤'}
                        {seatReservations.length > 0 && !isOccupied && ` 📋${seatReservations.length}`}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-sm font-bold text-coffee-dark mb-2">
                  <Cat className="w-4 h-4 text-pink" />
                  偏好猫咪 <span className="font-normal text-coffee-light text-xs">(可选)</span>
                </label>
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => setSelectedCatId(null)}
                    className={cn(
                      'px-3 py-1.5 rounded-xl text-sm font-bold transition-all border-2',
                      selectedCatId === null
                        ? 'bg-gradient-to-r from-warm-200 to-warm-300 text-coffee-dark border-transparent shadow-md scale-105'
                        : 'bg-white text-coffee-light border-warm-200 hover:border-warm-300'
                    )}
                  >
                    无偏好
                  </button>
                  {availableCats.map((cat) => (
                    <button
                      key={cat.id}
                      onClick={() => setSelectedCatId(cat.id)}
                      className={cn(
                        'px-3 py-1.5 rounded-xl text-sm font-bold transition-all border-2',
                        selectedCatId === cat.id
                          ? 'bg-gradient-to-r from-pink to-lavender text-white border-transparent shadow-md scale-105'
                          : 'bg-white text-coffee border-warm-200 hover:border-pink hover:bg-pink/10'
                      )}
                    >
                      {cat.emoji} {cat.name}
                    </button>
                  ))}
                  {cats.filter((c) => c.unlocked && (c.isResting || c.assignedSeatId)).map((cat) => (
                    <span
                      key={cat.id}
                      className="px-3 py-1.5 rounded-xl text-sm font-bold bg-gray-200 text-gray-400 border-2 border-gray-300 cursor-not-allowed"
                    >
                      {cat.emoji} {cat.name}{cat.isResting ? '😴' : '🐾'}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={handleCreate}
                disabled={!canCreate}
                className={cn(
                  'w-full py-3 rounded-xl font-black text-base transition-all',
                  canCreate
                    ? 'bg-gradient-to-r from-lavender to-pink text-white shadow-lg hover:shadow-xl hover:scale-[1.02] active:scale-[0.98]'
                    : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                )}
              >
                {canCreate ? (
                  <span className="flex items-center justify-center gap-2">
                    <CalendarPlus className="w-5 h-5" />
                    确认预约 · 支付定金 {GAME_CONFIG.RESERVATION_DEPOSIT}💰
                  </span>
                ) : (
                  '请选择时段和座位'
                )}
              </button>
            </div>
          </section>

          {activeReservations.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-sunset/20">
                  <Clock className="w-5 h-5 text-sunset" />
                </div>
                <h3 className="text-lg font-black text-coffee-dark">当前预约</h3>
                <span className="ml-auto px-2.5 py-0.5 bg-sunset/15 rounded-full text-xs font-bold text-sunset">
                  {activeReservations.length} 位
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {activeReservations.map((r) => (
                  <ReservationCard key={r.id} reservation={r} />
                ))}
              </div>
            </section>
          )}

          {pastReservations.length > 0 && (
            <section>
              <div className="flex items-center gap-2 mb-3">
                <div className="p-2 rounded-xl bg-gray-200">
                  <Clock className="w-5 h-5 text-gray-400" />
                </div>
                <h3 className="text-lg font-black text-gray-400">历史记录</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pastReservations.map((r) => (
                  <ReservationCard key={r.id} reservation={r} />
                ))}
              </div>
            </section>
          )}

          {reservations.length === 0 && (
            <div className="text-center py-8">
              <div className="text-5xl mb-3">📋</div>
              <p className="text-coffee-light font-bold">还没有预约记录</p>
              <p className="text-coffee-light/60 text-sm mt-1">为熟客创建撸猫桌预约吧！</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
