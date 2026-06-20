import React from 'react';
import { useGameStore } from '@/store/useGameStore';
import { DrinkCard } from './DrinkCard';
import { Coffee } from 'lucide-react';

export const MenuPanel: React.FC = () => {
  const { drinks, selectedSeatId, customers } = useGameStore();

  const selectedCustomer = customers.find((c) => c.seatId === selectedSeatId);
  const selectedSeatHasCustomer = !!selectedCustomer;
  const selectedSeatIsOrdering = !!selectedCustomer?.orderedDrinkId;

  return (
    <div className="flex flex-col h-full bg-gradient-to-b from-warm-50 to-cream rounded-3xl border-2 border-warm-200 shadow-xl overflow-hidden">
      <div className="px-4 py-3 bg-gradient-to-r from-coffee to-coffee-dark border-b-2 border-warm-200">
        <div className="flex items-center gap-2">
          <Coffee className="w-5 h-5 text-cream drop-shadow" />
          <h2 className="font-black text-cream text-base drop-shadow">菜单点单</h2>
          {selectedSeatId && (
            <span className={cn(
              'ml-auto px-2 py-0.5 rounded-full text-xs font-bold',
              selectedSeatIsOrdering
                ? 'bg-mint/90 text-white'
                : 'bg-white/90 text-coffee'
            )}>
              {selectedSeatIsOrdering ? '制作中' : selectedSeatHasCustomer ? '准备点单' : '空座位'}
            </span>
          )}
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
        {drinks.map((drink) => (
          <DrinkCard
            key={drink.id}
            drink={drink}
            selectedSeatHasCustomer={selectedSeatHasCustomer}
            selectedSeatIsOrdering={selectedSeatIsOrdering}
          />
        ))}
      </div>

      <div className="px-4 py-2 bg-warm-100/50 border-t border-warm-200">
        <p className="text-[11px] text-coffee-light text-center leading-relaxed">
          ☕ 选中有顾客的座位后，点击饮品开始制作
        </p>
      </div>
    </div>
  );
};

const cn = (...args: (string | false | undefined)[]) => args.filter(Boolean).join(' ');
