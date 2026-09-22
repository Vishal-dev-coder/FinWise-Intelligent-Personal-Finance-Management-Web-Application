import React from 'react';
import { ShieldCheck, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

const HealthScoreGauge = ({ healthScore }) => {
  if (!healthScore) return null;

  const { score, grade, badge, color, summary, breakdown } = healthScore;

  // Calculate stroke dash offset for SVG circle
  const radius = 56;
  const circumference = 2 * Math.PI * radius;
  const progress = (score / 100) * circumference;
  const strokeDashoffset = circumference - progress;

  return (
    <div className="bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800/80 rounded-2xl p-6 shadow-sm relative overflow-hidden">
      <div className="flex flex-col md:flex-row items-center justify-between gap-6">
        {/* Left: Gauge Circle */}
        <div className="flex items-center gap-6">
          <div className="relative w-32 h-32 flex items-center justify-center shrink-0">
            <svg className="w-full h-full -rotate-90 transform" viewBox="0 0 130 130">
              <circle
                cx="65"
                cy="65"
                r={radius}
                className="text-slate-100 dark:text-slate-800 stroke-current"
                strokeWidth="10"
                fill="transparent"
              />
              <circle
                cx="65"
                cy="65"
                r={radius}
                stroke={color}
                strokeWidth="10"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                fill="transparent"
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            <div className="absolute flex flex-col items-center justify-center text-center">
              <span className="text-3xl font-extrabold text-slate-900 dark:text-white leading-none">
                {score}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 mt-1">
                out of 100
              </span>
            </div>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span
                className="inline-flex items-center gap-1 text-xs font-bold px-2.5 py-1 rounded-full text-white"
                style={{ backgroundColor: color }}
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                {grade} • {badge}
              </span>
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mt-2">
              Financial Health Score
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-md leading-relaxed">
              {summary}
            </p>
          </div>
        </div>

        {/* Right: Sub-scores & link */}
        <div className="w-full md:w-auto flex flex-col sm:flex-row md:flex-col gap-3 justify-between border-t md:border-t-0 md:border-l border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pl-6">
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-2 gap-2 text-xs">
            {breakdown && (
              <>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Savings Rate</span>
                  <span className="font-bold text-emerald-500">{breakdown.savingsRate?.value}</span>
                </div>
                <div className="p-2 rounded-xl bg-slate-50 dark:bg-slate-850 border border-slate-100 dark:border-slate-800">
                  <span className="text-slate-400 block text-[10px]">Expense Ratio</span>
                  <span className="font-bold text-blue-500">{breakdown.expenseRatio?.value}</span>
                </div>
              </>
            )}
          </div>

          <Link
            to="/smart-insights"
            className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-emerald-600 dark:text-emerald-400 hover:underline pt-1"
          >
            <span>View Full Score Breakdown</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </div>
    </div>
  );
};

export default HealthScoreGauge;
