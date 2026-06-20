import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { CatCard } from './CatCard';
import { Cat } from 'lucide-react';

export const CatPanel: React.FC = () => {
  const { cats, selectedSeatId } = useGameStore();

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-warm-50 to-cream rounded-3xl border-2 border-warm-200 shadow-xl overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-pink to-lavender border-b-2 border-warm-200">
        <div className="flex items-center gap-2">
          <Cat className="w-5 h-5 text-white drop-shadow" />
          <h2 className="font-black text-white text-base drop-shadow">猫咪伙伴</h2>
          {selectedSeatId && (
            <span className="ml-auto px-2 py-0.5 bg-white/90 rounded-full text-xs font-bold text-pink">
              选择猫咪指派
            </span>
          )}
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {cats.map((cat) => (
          <CatCard key={cat.id} cat={cat} selectedSeatId={selectedSeatId} />
        ))}
      </div>
      <div className="px-4 py-2 bg-warm-100/50 border-t border-warm-200">
        <p className="text-[11px] text-coffee-light text-center leading-relaxed">
          💡 选中座位后点击猫咪指派，可提升顾客满意度和小费
        </p>
      </div>
    </div>
  );
};
