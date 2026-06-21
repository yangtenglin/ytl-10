import React, { useState, useEffect } from 'react';
import { useGameStore } from '@/store/useGameStore';
import type { DailyReport } from '../types/game';
import { Sparkles, TrendingUp, TrendingDown, Users, Smile, Flame, Award, ArrowRight, Bike } from 'lucide-react';

interface StatRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  highlight?: boolean;
  delay?: number;
}

const StatRow: React.FC<StatRowProps> = ({ icon, label, value, highlight = false, delay = 0 }) => {
  const [show, setShow] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setShow(true), delay);
    return () => clearTimeout(t);
  }, [delay]);

  return (
    <div
      className={`flex items-center justify-between py-3 px-4 rounded-xl transition-all duration-500 ${
        show ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'
      } ${highlight ? 'bg-gold/15 border border-gold/40' : 'bg-white/50'}`}
    >
      <div className="flex items-center gap-3">
        {icon}
        <span className="font-bold text-coffee-dark text-sm">{label}</span>
      </div>
      <div className="font-black text-coffee-dark">{value}</div>
    </div>
  );
};

export const DailyReportModal: React.FC = () => {
  const { showDailyReport, lastReport, closeDailyReport, todayDeliveryStats } = useGameStore();
  const [displayedProfit, setDisplayedProfit] = useState(0);

  useEffect(() => {
    if (!showDailyReport || !lastReport) {
      setDisplayedProfit(0);
      return;
    }
    const target = lastReport.profit;
    const duration = 1200;
    const start = Date.now();
    let raf = 0;

    const animate = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setDisplayedProfit(Math.round(target * eased));
      if (progress < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [showDailyReport, lastReport]);

  if (!showDailyReport || !lastReport) return null;

  const report: DailyReport = lastReport;
  const profitColor = report.profit >= 0 ? 'text-mint' : 'text-danger';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fade-in">
      <div className="absolute inset-0 bg-gradient-to-b from-coffee-dark/70 via-black/60 to-black/70 backdrop-blur-sm" />
      <div className="relative w-full max-w-md bg-gradient-to-b from-cream via-warm-50 to-warm-100 rounded-3xl shadow-2xl border-4 border-coffee-light overflow-hidden animate-scale-in">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/3 z-10">
          <div className="relative">
            <div className="absolute inset-0 bg-sunset/30 blur-2xl rounded-full animate-pulse" />
            <div className="relative px-6 py-2 bg-gradient-to-r from-sunset via-peach to-sunset rounded-full shadow-xl border-4 border-white">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-white drop-shadow animate-spin-slow" />
                <span className="text-white font-black text-lg drop-shadow">第 {report.day} 天结算</span>
                <Sparkles className="w-5 h-5 text-white drop-shadow animate-spin-slow" />
              </div>
            </div>
          </div>
        </div>

        <div className="px-6 pt-14 pb-4">
          <div className="mb-6 text-center">
            <div className={`text-6xl font-black ${profitColor} drop-shadow-sm transition-all duration-300`}>
              {displayedProfit >= 0 ? '+' : ''}
              {displayedProfit}
              <span className="text-3xl ml-1">💰</span>
            </div>
            <p className="text-coffee-light font-bold mt-1">今日净利润</p>
          </div>

          <div className="space-y-2">
            <StatRow
              delay={300}
              icon={<TrendingUp className="w-5 h-5 text-mint" />}
              label="营业收入"
              value={<span className="text-mint">+{report.revenue} 💰</span>}
            />
            <StatRow
              delay={450}
              icon={<TrendingDown className="w-5 h-5 text-danger" />}
              label="升级支出"
              value={<span className="text-danger">-{report.expense} 💰</span>}
            />
            <div className="my-2 border-t border-dashed border-warm-300" />
            <StatRow
              delay={600}
              highlight
              icon={<Award className="w-5 h-5 text-gold" />}
              label="净利润"
              value={<span className={profitColor}>{report.profit >= 0 ? '+' : ''}{report.profit} 💰</span>}
            />
            <StatRow
              delay={750}
              icon={<Users className="w-5 h-5 text-coffee" />}
              label="服务顾客"
              value={<span className="text-coffee-dark">{report.customersServed} 位</span>}
            />
            <StatRow
              delay={900}
              icon={<Smile className="w-5 h-5 text-pink" />}
              label="满意率"
              value={<span className="text-pink">{report.happyRate}%</span>}
            />
            {report.maxCombo > 1 && (
              <StatRow
                delay={1050}
                icon={<Flame className="w-5 h-5 text-sunset" />}
                label="最高连击"
                value={<span className="text-sunset">{report.maxCombo}x (+{report.comboBonus})</span>}
              />
            )}

            {todayDeliveryStats.totalOrders > 0 && (
              <>
                <div className="my-3 border-t border-dashed border-warm-300" />
                <div className="py-2 px-4 bg-sunset/10 rounded-xl border border-sunset/30">
                  <div className="flex items-center gap-2 mb-2">
                    <Bike className="w-4 h-4 text-sunset" />
                    <span className="font-bold text-coffee-dark text-sm">外卖统计</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-coffee-light">订单数:</span>
                      <span className="font-bold text-coffee-dark">{todayDeliveryStats.completedOrders}/{todayDeliveryStats.totalOrders}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-coffee-light">完成率:</span>
                      <span className="font-bold text-mint">
                        {todayDeliveryStats.totalOrders > 0
                          ? Math.round((todayDeliveryStats.completedOrders / todayDeliveryStats.totalOrders) * 100)
                          : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-coffee-light">外卖收入:</span>
                      <span className="font-bold text-mint">+{todayDeliveryStats.deliveryRevenue}💰</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-coffee-light">超时退款:</span>
                      <span className="font-bold text-danger">-{todayDeliveryStats.deliveryRefunds}💰</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>

        <div className="px-6 pb-6">
          <button
            onClick={closeDailyReport}
            className="w-full flex items-center justify-center gap-2 py-4 bg-gradient-to-r from-coffee via-coffee-light to-coffee text-cream font-black text-lg rounded-2xl shadow-xl hover:shadow-2xl hover:scale-[1.02] active:scale-[0.98] transition-all border-2 border-white/30 group"
          >
            <span>进入第 {report.day + 1} 天</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>
        </div>

        <div className="absolute -top-4 -right-4 text-5xl animate-float-heart opacity-80 pointer-events-none">💕</div>
        <div className="absolute -bottom-4 -left-4 text-4xl animate-bounce-slow pointer-events-none">🐾</div>
      </div>
    </div>
  );
};
