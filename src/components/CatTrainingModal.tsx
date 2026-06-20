import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { X, Heart, Star, Zap, TrendingUp, Coins, Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ProgressBar } from './ProgressBar';
import { CAT_SKILLS, CAT_INTIMACY_EXP_TABLE, CAT_MAX_INTIMACY_LEVEL, CAT_TRAINING_COST, CAT_TRAINING_EXP_GAIN } from '@/utils/constants';
import { getCatEffectiveCharmBonus, getCatEffectiveFatigueRate, getCatEffectiveTipBonus, getCatEffectiveSatisfactionBoost } from '@/utils/gameLogic';
import { GAME_CONFIG } from '@/utils/constants';

export const CatTrainingModal: React.FC = () => {
  const {
    showCatTraining,
    closeCatTraining,
    cats,
    coins,
    trainCat,
  } = useGameStore();

  if (!showCatTraining) return null;

  const unlockedCats = cats.filter((c) => c.unlocked);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={closeCatTraining} />
      <div className="relative w-full max-w-4xl max-h-[85vh] bg-gradient-to-b from-cream to-warm-50 rounded-3xl shadow-2xl border-4 border-pink/50 overflow-hidden animate-scale-in">
        <div className="sticky top-0 z-10 px-6 py-4 bg-gradient-to-r from-pink via-pink to-lavender border-b-4 border-pink-dark">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Heart className="w-7 h-7 text-white drop-shadow fill-white" />
              <h2 className="text-2xl font-black text-white drop-shadow">🐾 亲密训练</h2>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 px-4 py-1.5 bg-gradient-to-r from-gold to-yellow-400 rounded-full shadow-md border-2 border-white/50">
                <Coins className="w-5 h-5 text-white drop-shadow" />
                <span className="font-black text-white text-lg drop-shadow">{coins}</span>
              </div>
              <button
                onClick={closeCatTraining}
                className="p-2 rounded-full bg-cream/20 hover:bg-cream/30 text-cream transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(85vh-80px)] space-y-6">
          {unlockedCats.length === 0 && (
            <div className="text-center py-12 text-coffee-light">
              <p className="text-6xl mb-4">🐱</p>
              <p className="font-bold text-lg">还没有解锁的猫咪</p>
              <p className="text-sm mt-1">先去升级商店解锁猫咪吧</p>
            </div>
          )}

          {unlockedCats.map((cat) => {
            const expForCurrentLevel = CAT_INTIMACY_EXP_TABLE[cat.intimacyLevel] || 0;
            const expPercent = cat.intimacyLevel >= CAT_MAX_INTIMACY_LEVEL ? 100 : (cat.intimacyExp / expForCurrentLevel) * 100;
            const isMaxLevel = cat.intimacyLevel >= CAT_MAX_INTIMACY_LEVEL;
            const canTrain = !isMaxLevel && coins >= CAT_TRAINING_COST;

            const effectiveCharm = getCatEffectiveCharmBonus(cat);
            const effectiveFatigueRate = getCatEffectiveFatigueRate(cat);
            const effectiveTipBonus = getCatEffectiveTipBonus(cat);
            const effectiveSatBoost = getCatEffectiveSatisfactionBoost(cat);

            const baseCharm = cat.charmBonus;
            const baseFatigueRate = GAME_CONFIG.CAT_FATIGUE_RATE;

            return (
              <div
                key={cat.id}
                className="p-5 bg-white/70 rounded-2xl border-2 border-warm-200 shadow-sm"
              >
                <div className="flex items-start gap-4 mb-4">
                  <div className="text-5xl">{cat.emoji}</div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-black text-coffee-dark text-lg">{cat.name}</span>
                      <div className="flex items-center gap-1 px-2 py-0.5 bg-gradient-to-r from-pink to-lavender rounded-full">
                        <Heart className="w-3 h-3 text-white fill-white" />
                        <span className="text-xs font-bold text-white">Lv.{cat.intimacyLevel}</span>
                      </div>
                      {isMaxLevel && (
                        <span className="px-2 py-0.5 bg-gold/20 rounded-full text-xs font-bold text-gold">
                          MAX
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-2 mb-2">
                      <span className="text-xs text-coffee-light">
                        {isMaxLevel ? '已满级' : `经验 ${cat.intimacyExp}/${expForCurrentLevel}`}
                      </span>
                    </div>

                    {!isMaxLevel && (
                      <ProgressBar
                        value={cat.intimacyExp}
                        max={expForCurrentLevel}
                        colorClass="bg-gradient-to-r from-pink to-lavender"
                        bgClass="bg-warm-200"
                        height="h-2.5"
                      />
                    )}
                    {isMaxLevel && (
                      <div className="h-2.5 w-full rounded-full bg-gradient-to-r from-gold to-yellow-400" />
                    )}
                  </div>

                  <button
                    onClick={() => trainCat(cat.id)}
                    disabled={!canTrain}
                    className={cn(
                      'flex flex-col items-center gap-1 px-4 py-2.5 rounded-xl font-bold text-sm transition-all flex-shrink-0',
                      canTrain
                        ? 'bg-gradient-to-r from-pink to-lavender text-white shadow-md hover:shadow-lg hover:scale-105 active:scale-95'
                        : isMaxLevel
                          ? 'bg-gold/20 text-gold cursor-default'
                          : 'bg-gray-300 text-gray-500 cursor-not-allowed'
                    )}
                  >
                    <Zap className="w-4 h-4" />
                    <span>{isMaxLevel ? '已满级' : `训练 ${CAT_TRAINING_COST}💰`}</span>
                    {!isMaxLevel && (
                      <span className="text-[10px] opacity-80">+{CAT_TRAINING_EXP_GAIN} exp</span>
                    )}
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
                  <div className="p-3 bg-gradient-to-br from-peach/20 to-cream rounded-xl border border-peach/30">
                    <div className="flex items-center gap-1.5 mb-1">
                      <TrendingUp className="w-3.5 h-3.5 text-peach" />
                      <span className="text-xs font-bold text-coffee-dark">收益加成</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-peach">+{Math.round(effectiveCharm * 100)}%</span>
                      {effectiveCharm > baseCharm && (
                        <span className="text-[10px] text-mint font-bold">
                          (↑{Math.round((effectiveCharm - baseCharm) * 100)}%)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-gradient-to-br from-indigo-100/60 to-cream rounded-xl border border-indigo-200/50">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Zap className="w-3.5 h-3.5 text-indigo-500" />
                      <span className="text-xs font-bold text-coffee-dark">疲劳速率</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-indigo-500">{effectiveFatigueRate.toFixed(2)}/s</span>
                      {effectiveFatigueRate < baseFatigueRate && (
                        <span className="text-[10px] text-mint font-bold">
                          (↓{Math.round((1 - effectiveFatigueRate / baseFatigueRate) * 100)}%)
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="p-3 bg-gradient-to-br from-gold/20 to-cream rounded-xl border border-gold/30">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Coins className="w-3.5 h-3.5 text-gold" />
                      <span className="text-xs font-bold text-coffee-dark">小费加成</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-gold">+{Math.round(effectiveTipBonus * 100)}%</span>
                    </div>
                  </div>

                  <div className="p-3 bg-gradient-to-br from-mint/20 to-cream rounded-xl border border-mint/30">
                    <div className="flex items-center gap-1.5 mb-1">
                      <Heart className="w-3.5 h-3.5 text-mint" />
                      <span className="text-xs font-bold text-coffee-dark">满意度提升</span>
                    </div>
                    <div className="flex items-baseline gap-1">
                      <span className="text-lg font-black text-mint">{effectiveSatBoost.toFixed(1)}/s</span>
                      {effectiveSatBoost > 0.8 && (
                        <span className="text-[10px] text-mint font-bold">
                          (↑{((effectiveSatBoost - 0.8) / 0.8 * 100).toFixed(0)}%)
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                <div>
                  <div className="flex items-center gap-1.5 mb-2">
                    <Star className="w-4 h-4 text-gold fill-gold" />
                    <span className="text-sm font-black text-coffee-dark">技能</span>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                    {CAT_SKILLS.map((skill) => {
                      const unlocked = cat.intimacyLevel >= skill.levelRequired;
                      return (
                        <div
                          key={skill.id}
                          className={cn(
                            'p-2.5 rounded-xl border-2 transition-all',
                            unlocked
                              ? 'bg-gradient-to-br from-mint/15 to-cream border-mint/50 shadow-sm'
                              : 'bg-gray-100/60 border-gray-200 opacity-70'
                          )}
                        >
                          <div className="flex items-center gap-1.5 mb-1">
                            <span className="text-lg">{skill.emoji}</span>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1">
                                <span className={cn('text-xs font-black truncate', unlocked ? 'text-coffee-dark' : 'text-gray-400')}>
                                  {skill.name}
                                </span>
                                {unlocked ? (
                                  <Unlock className="w-3 h-3 text-mint flex-shrink-0" />
                                ) : (
                                  <Lock className="w-3 h-3 text-gray-400 flex-shrink-0" />
                                )}
                              </div>
                              <span className="text-[10px] text-coffee-light">Lv.{skill.levelRequired} 解锁</span>
                            </div>
                          </div>
                          <p className={cn('text-[10px] leading-tight', unlocked ? 'text-coffee-light' : 'text-gray-400')}>
                            {skill.description}
                          </p>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}

          <div className="text-center py-2">
            <p className="text-xs text-coffee-light">
              💡 猫咪陪客时自动获得经验，花费金币可主动训练加速升级，满级解锁强力技能
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
