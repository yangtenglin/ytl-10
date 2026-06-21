import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { X, Star, Cat, Coffee, Store, ArrowUp, Coins, Lock, Unlock, Cog } from 'lucide-react';
import { cn } from '@/lib/utils';

export const UpgradeModal: React.FC = () => {
  const {
    showUpgradeModal,
    closeUpgradeModal,
    seats,
    cats,
    drinks,
    coins,
    expandCost,
    coffeeMachine,
    upgradeSeat,
    unlockCat,
    unlockDrink,
    expandShop,
    upgradeCoffeeMachine,
  } = useGameStore();

  if (!showUpgradeModal) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeUpgradeModal} />
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-gradient-to-b from-cream to-warm-50 rounded-3xl shadow-2xl border-4 border-coffee-light overflow-hidden animate-scale-in">
        <div className="sticky top-0 z-10 px-6 py-4 bg-gradient-to-r from-coffee via-coffee-light to-coffee border-b-4 border-coffee-dark">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Store className="w-7 h-7 text-cream drop-shadow" />
              <h2 className="text-2xl font-black text-cream drop-shadow">🏪 升级商店</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-gold to-yellow-400 rounded-full shadow-md border-2 border-white/50">
                <Coins className="w-5 h-5 text-white drop-shadow" />
                <span className="font-black text-white text-lg drop-shadow">{coins}</span>
              </div>
              <button
                onClick={closeUpgradeModal}
                className="p-2 rounded-full bg-cream/20 hover:bg-cream/30 text-cream transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)] space-y-8">
          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-peach/20">
                <ArrowUp className="w-5 h-5 text-peach" />
              </div>
              <h3 className="text-lg font-black text-coffee-dark">座位升级</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {seats.map((seat) => (
                <div
                  key={seat.id}
                  className="p-4 bg-white/60 rounded-2xl border-2 border-warm-200 shadow-sm"
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-8 h-8 rounded-full bg-coffee text-white flex items-center justify-center font-black text-sm shadow">
                        {seat.seatNumber}
                      </span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: seat.level }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-gold fill-gold" />
                        ))}
                      </div>
                    </div>
                    <span className="text-xs font-bold text-mint bg-mint/15 px-2 py-0.5 rounded-full">
                      +{Math.round(seat.revenueBonus * 100)}%
                    </span>
                  </div>
                  <p className="text-xs text-coffee-light mb-3">
                    Lv.{seat.level} → Lv.{seat.level + 1}
                    <span className="mx-1">·</span>
                    收益加成 +12%
                  </p>
                  <button
                    onClick={() => upgradeSeat(seat.id)}
                    disabled={coins < seat.upgradeCost}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-sm transition-all',
                      coins >= seat.upgradeCost
                        ? 'bg-gradient-to-r from-mint to-mint-dark text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    )}
                  >
                    <Coins className="w-4 h-4" />
                    {seat.upgradeCost}
                  </button>
                </div>
              ))}

              <div className="p-4 bg-gradient-to-br from-lavender/40 to-pink/20 rounded-2xl border-2 border-dashed border-lavender shadow-sm flex flex-col justify-center">
                <div className="flex items-center gap-2 mb-2">
                  <div className="p-1.5 rounded-lg bg-lavender/30">
                    <Store className="w-5 h-5 text-lavender" />
                  </div>
                  <span className="font-black text-coffee-dark">扩展座位</span>
                </div>
                <p className="text-xs text-coffee-light mb-3">
                  增加新座位，容纳更多顾客
                </p>
                <button
                  onClick={expandShop}
                  disabled={coins < expandCost}
                  className={cn(
                    'w-full flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-sm transition-all',
                    coins >= expandCost
                      ? 'bg-gradient-to-r from-lavender to-pink text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                      : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                  )}
                >
                  <Coins className="w-4 h-4" />
                  {expandCost}
                </button>
              </div>
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-pink/20">
                <Cat className="w-5 h-5 text-pink" />
              </div>
              <h3 className="text-lg font-black text-coffee-dark">解锁猫咪</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {cats.map((cat) => (
                <div
                  key={cat.id}
                  className={cn(
                    'p-4 rounded-2xl border-2 shadow-sm',
                    cat.unlocked
                      ? 'bg-mint/15 border-mint/50'
                      : 'bg-white/60 border-warm-200'
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn(
                      'text-4xl transition-all',
                      cat.unlocked ? '' : 'grayscale opacity-60'
                    )}>
                      {cat.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-black text-coffee-dark truncate">{cat.name}</span>
                        {cat.unlocked ? (
                          <Unlock className="w-3.5 h-3.5 text-mint" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-gray-400" />
                        )}
                      </div>
                      <p className="text-[11px] text-coffee-light">
                        魅力 +{Math.round(cat.charmBonus * 100)}%
                      </p>
                    </div>
                  </div>
                  {cat.unlocked ? (
                    <div className="w-full py-2 rounded-xl bg-mint/20 text-mint text-center font-bold text-sm">
                      ✓ 已解锁
                    </div>
                  ) : (
                    <button
                      onClick={() => unlockCat(cat.id)}
                      disabled={coins < cat.unlockCost}
                      className={cn(
                        'w-full flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-sm transition-all',
                        coins >= cat.unlockCost
                          ? 'bg-gradient-to-r from-pink to-lavender text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      )}
                    >
                      <Coins className="w-4 h-4" />
                      {cat.unlockCost}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-coffee/20">
                <Coffee className="w-5 h-5 text-coffee" />
              </div>
              <h3 className="text-lg font-black text-coffee-dark">解锁饮品</h3>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {drinks.map((drink) => (
                <div
                  key={drink.id}
                  className={cn(
                    'p-4 rounded-2xl border-2 shadow-sm',
                    drink.unlocked
                      ? 'bg-coffee/10 border-coffee/40'
                      : 'bg-white/60 border-warm-200'
                  )}
                >
                  <div className="flex items-center gap-3 mb-2">
                    <div className={cn(
                      'text-3xl p-1.5 rounded-xl bg-white/60 shadow-sm',
                      drink.unlocked ? '' : 'grayscale opacity-60'
                    )}>
                      {drink.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1">
                        <span className="font-black text-coffee-dark truncate">{drink.name}</span>
                        {drink.unlocked ? (
                          <Unlock className="w-3.5 h-3.5 text-mint flex-shrink-0" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-coffee-light">
                        💰{drink.basePrice} · ⏱{drink.makeTime}s
                      </p>
                    </div>
                  </div>
                  {drink.unlocked ? (
                    <div className="w-full py-2 rounded-xl bg-coffee/15 text-coffee-dark text-center font-bold text-sm">
                      ✓ 已解锁
                    </div>
                  ) : (
                    <button
                      onClick={() => unlockDrink(drink.id)}
                      disabled={coins < drink.unlockCost}
                      className={cn(
                        'w-full flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-sm transition-all',
                        coins >= drink.unlockCost
                          ? 'bg-gradient-to-r from-coffee to-coffee-light text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      )}
                    >
                      <Coins className="w-4 h-4" />
                      {drink.unlockCost}
                    </button>
                  )}
                </div>
              ))}
            </div>
          </section>

          <section>
            <div className="flex items-center gap-2 mb-3">
              <div className="p-2 rounded-xl bg-sunset/20">
                <Cog className="w-5 h-5 text-sunset" />
              </div>
              <h3 className="text-lg font-black text-coffee-dark">服务设备</h3>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="p-4 bg-gradient-to-br from-sunset/10 to-orange-50 rounded-2xl border-2 border-sunset/30 shadow-sm">
                <div className="flex items-center gap-3 mb-3">
                  <div className="text-4xl p-2 rounded-xl bg-white/60 shadow-sm">
                    {coffeeMachine.emoji}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-coffee-dark">{coffeeMachine.name}</span>
                      <div className="flex gap-0.5">
                        {Array.from({ length: coffeeMachine.level }).map((_, i) => (
                          <Star key={i} className="w-3.5 h-3.5 text-sunset fill-sunset" />
                        ))}
                      </div>
                    </div>
                    <p className="text-xs text-coffee-light">
                      Lv.{coffeeMachine.level} / {coffeeMachine.maxLevel}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-coffee mb-3">
                  {coffeeMachine.level < coffeeMachine.maxLevel ? (
                    <>
                      制作速度 <span className="font-bold text-sunset">+{Math.round(coffeeMachine.speedBonus * 100)}%</span>
                      <span className="mx-1">→</span>
                      <span className="font-bold text-mint">+{Math.round((coffeeMachine.speedBonus + 0.15) * 100)}%</span>
                    </>
                  ) : (
                    <>
                      制作速度 <span className="font-bold text-mint">+{Math.round(coffeeMachine.speedBonus * 100)}%</span>
                      <span className="mx-2">·</span>
                      <span className="font-bold text-sunset">已达最高等级</span>
                    </>
                  )}
                </p>
                {coffeeMachine.level < coffeeMachine.maxLevel ? (
                  <button
                    onClick={upgradeCoffeeMachine}
                    disabled={coins < coffeeMachine.upgradeCost}
                    className={cn(
                      'w-full flex items-center justify-center gap-2 py-2 rounded-xl font-bold text-sm transition-all',
                      coins >= coffeeMachine.upgradeCost
                        ? 'bg-gradient-to-r from-sunset to-orange-400 text-white shadow-md hover:shadow-lg hover:scale-[1.02] active:scale-[0.98]'
                        : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    )}
                  >
                    <Coins className="w-4 h-4" />
                    {coffeeMachine.upgradeCost}
                  </button>
                ) : (
                  <div className="w-full py-2 rounded-xl bg-sunset/20 text-sunset text-center font-bold text-sm">
                    ✓ 已满级
                  </div>
                )}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};
