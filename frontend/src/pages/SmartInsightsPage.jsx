import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HealthScoreGauge from '../components/smart/HealthScoreGauge';
import {
  Sparkles,
  Flame,
  Award,
  Calendar,
  HeartHandshake,
  ShieldCheck,
  CheckCircle,
  AlertCircle,
  Clock,
  Target,
  Zap,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const SmartInsightsPage = () => {
  const { formatAmount } = useCurrency();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);

  // Emergency Fund Calculator Interactive State
  const [calcMonthlySpend, setCalcMonthlySpend] = useState(2500);
  const [calcMonthsTarget, setCalcMonthsTarget] = useState(6);

  const fetchInsights = async () => {
    setLoading(true);
    try {
      const res = await API.get('/insights');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load smart insights', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  if (loading) return <LoadingSpinner fullPage message="Synthesizing AI behavioral financial insights..." />;
  if (!data) return null;

  const { healthScore, smartInsights, noSpendTracker, moodAnalysis, emergencyFund, gamification } = data;

  const targetFundRequired = calcMonthlySpend * calcMonthsTarget;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span>Intelligent Behavioral & Health Insights</span>
          <span className="px-2 py-0.5 rounded-full text-xs bg-emerald-500/10 text-emerald-500 font-bold border border-emerald-500/20">
            AI Engine
          </span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Audits spending psychology, evaluates savings streaks, and scores financial resilience
        </p>
      </div>

      {/* Main Health Score Gauge */}
      <HealthScoreGauge healthScore={healthScore} />

      {/* Detailed Sub-Factor Breakdown */}
      {healthScore?.breakdown && (
        <Card
          title="Health Score Multi-Factor Audit"
          subtitle="How your score of 0-100 is computed across five core wealth pillars"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-850 border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                1. Savings Rate
              </span>
              <div className="text-xl font-bold text-emerald-500 mt-1">
                {healthScore.breakdown.savingsRate.score} / {healthScore.breakdown.savingsRate.max}
              </div>
              <span className="text-[11px] text-slate-400">
                Rate: {healthScore.breakdown.savingsRate.value}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-850 border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                2. Expense Ratio
              </span>
              <div className="text-xl font-bold text-blue-500 mt-1">
                {healthScore.breakdown.expenseRatio.score} / {healthScore.breakdown.expenseRatio.max}
              </div>
              <span className="text-[11px] text-slate-400">
                Ratio: {healthScore.breakdown.expenseRatio.value}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-850 border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                3. Debt Burden
              </span>
              <div className="text-xl font-bold text-amber-500 mt-1">
                {healthScore.breakdown.debtBurden.score} / {healthScore.breakdown.debtBurden.max}
              </div>
              <span className="text-[11px] text-slate-400">
                {healthScore.breakdown.debtBurden.value}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-850 border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                4. Budget Discipline
              </span>
              <div className="text-xl font-bold text-purple-500 mt-1">
                {healthScore.breakdown.budgetDiscipline.score} / {healthScore.breakdown.budgetDiscipline.max}
              </div>
              <span className="text-[11px] text-slate-400">
                {healthScore.breakdown.budgetDiscipline.value}
              </span>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-850 border border-slate-100 dark:border-slate-800">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                5. Safety Cushion
              </span>
              <div className="text-xl font-bold text-teal-500 mt-1">
                {healthScore.breakdown.preparedness.score} / {healthScore.breakdown.preparedness.max}
              </div>
              <span className="text-[11px] text-slate-400">
                {healthScore.breakdown.preparedness.value}
              </span>
            </div>
          </div>
        </Card>
      )}

      {/* No-Spend Day Tracker & Gamification Streaks */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* No-Spend Day Tracker */}
        <Card
          title="No-Spend Day Streak Tracker"
          subtitle="Days with zero discretionary spending this month"
          className="lg:col-span-2"
        >
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-xl bg-emerald-500 text-white flex items-center justify-center font-extrabold text-xl shadow-md">
                  {noSpendTracker.noSpendCount}
                </div>
                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white">
                    {noSpendTracker.noSpendCount} No-Spend Days Logged
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Monthly goal: {noSpendTracker.targetNoSpendDays} days ({Math.round((noSpendTracker.noSpendCount / noSpendTracker.targetNoSpendDays) * 100)}% attained)
                  </p>
                </div>
              </div>
              <span className="inline-flex items-center gap-1 text-xs font-bold px-3 py-1 rounded-full bg-emerald-500 text-white">
                <Flame className="w-3.5 h-3.5 fill-current" /> Active Streak
              </span>
            </div>

            {/* Visual Dot Matrix of Month Days */}
            <div className="pt-2">
              <span className="text-xs font-semibold text-slate-500 block mb-2">
                Month Calendar Progress:
              </span>
              <div className="grid grid-cols-7 sm:grid-cols-10 gap-2">
                {Array.from({ length: noSpendTracker.daysInMonth }).map((_, i) => {
                  const day = i + 1;
                  const isPast = day <= noSpendTracker.currentDay;
                  const isNoSpend = noSpendTracker.noSpendDaysList.includes(day);

                  return (
                    <div
                      key={`ns-${day}`}
                      className={`h-9 rounded-xl flex items-center justify-center text-xs font-bold border transition ${
                        isNoSpend
                          ? 'bg-emerald-500 text-white border-emerald-600 shadow-xs'
                          : isPast
                          ? 'bg-slate-100 dark:bg-slate-850 text-slate-500 border-slate-200 dark:border-slate-800'
                          : 'bg-transparent text-slate-300 dark:text-slate-700 border-dashed border-slate-200 dark:border-slate-800'
                      }`}
                      title={isNoSpend ? `Day ${day}: No Spend Victory!` : `Day ${day}`}
                    >
                      {day}
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-3">
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-emerald-500" />
                  <span>Zero Discretionary Spend</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-sm bg-slate-200 dark:bg-slate-800" />
                  <span>Spending Logged</span>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {/* Gamification Badges & Streaks */}
        <Card title="Earned Achievement Badges" subtitle="Milestones reached on FinWise">
          <div className="space-y-3">
            {gamification?.badges && gamification.badges.map((b) => (
              <div
                key={b.id || b.name}
                className="p-3 rounded-xl bg-slate-50 dark:bg-dark-850 border border-slate-100 dark:border-slate-800 flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-amber-500/10 text-amber-500 flex items-center justify-center shrink-0 border border-amber-500/20">
                  <Award className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                    {b.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                    {b.description}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Expense Mood Correlation Chart */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card
          title="Psychology of Spending: Mood Correlation"
          subtitle="Analyzing how emotional states influence expenditure volume"
        >
          {moodAnalysis && moodAnalysis.length > 0 ? (
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={moodAnalysis} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <XAxis dataKey="mood" stroke="#94A3B8" fontSize={11} />
                  <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    formatter={(val) => [formatAmount(val), 'Total Spent']}
                    contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '12px' }}
                  />
                  <Bar dataKey="total" fill="#8B5CF6" radius={[6, 6, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <p className="text-xs text-slate-400 py-12 text-center">
              Log transactions with mood tags to visualize emotional correlations.
            </p>
          )}
        </Card>

        {/* Interactive Emergency Fund Calculator */}
        <Card
          title="Interactive Emergency Fund Calculator"
          subtitle="Determine your required liquid reserve buffer"
        >
          <div className="space-y-4">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-600 dark:text-slate-400">Monthly Essential Outlays</span>
                <span className="font-bold text-emerald-500">{formatAmount(calcMonthlySpend)}</span>
              </div>
              <input
                type="range"
                min="1000"
                max="8000"
                step="250"
                value={calcMonthlySpend}
                onChange={(e) => setCalcMonthlySpend(Number(e.target.value))}
                className="w-full accent-emerald-500 cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1.5">
                <span className="text-slate-600 dark:text-slate-400">Desired Cushion Duration</span>
                <span className="font-bold text-blue-500">{calcMonthsTarget} Months</span>
              </div>
              <input
                type="range"
                min="3"
                max="12"
                step="1"
                value={calcMonthsTarget}
                onChange={(e) => setCalcMonthsTarget(Number(e.target.value))}
                className="w-full accent-blue-500 cursor-pointer"
              />
            </div>

            <div className="p-4 rounded-xl bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Target Liquid Reserve</span>
                <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {formatAmount(targetFundRequired)}
                </span>
              </div>
              <div className="text-right">
                <span className="text-slate-400 block text-[10px]">Currently Saved</span>
                <span className="text-base font-bold text-emerald-500">
                  {formatAmount(emergencyFund?.saved || 0)}
                </span>
              </div>
            </div>
          </div>
        </Card>
      </div>

      {/* Personalized Monthly Savings Challenges */}
      <Card
        title="Personalized Monthly Savings Challenges"
        subtitle="Gamified mini-challenges designed to trim discretionary budget leaks"
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {gamification?.monthlyChallenges?.map((ch) => (
            <div
              key={ch.id}
              className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
            >
              <div>
                <div className="flex justify-between items-start mb-2">
                  <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 text-[10px] font-bold">
                    Save ~{formatAmount(ch.potentialSavings)}
                  </span>
                  <Award className="w-4 h-4 text-amber-400" />
                </div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                  {ch.title}
                </h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                  {ch.target}
                </p>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs">
                <span className="text-[10px] font-medium text-purple-400">
                  Reward: {ch.rewardBadge}
                </span>
                <span className="text-[10px] font-bold text-emerald-500 uppercase">
                  Active
                </span>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
};

export default SmartInsightsPage;
