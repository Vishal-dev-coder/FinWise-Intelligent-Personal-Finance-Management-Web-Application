import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API, { queueOfflineTransaction } from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import StatCard from '../components/common/StatCard';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import HealthScoreGauge from '../components/smart/HealthScoreGauge';
import TransactionModal from '../components/common/TransactionModal';
import {
  Wallet,
  TrendingUp,
  TrendingDown,
  PiggyBank,
  PlusCircle,
  ArrowRight,
  Sparkles,
  Receipt,
  Target,
  AlertTriangle,
  Clock,
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
} from 'recharts';

const PIE_COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#64748B'];

const DashboardPage = () => {
  const { formatAmount } = useCurrency();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const fetchDashboardData = async () => {
    try {
      const res = await API.get('/users/dashboard');
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to load dashboard', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCreateTransaction = async (formData) => {
    setActionLoading(true);
    try {
      if (!navigator.onLine) {
        queueOfflineTransaction(formData);
        setToastMessage('Saved offline! Transaction will sync when reconnected.');
        setIsModalOpen(false);
        setTimeout(() => setToastMessage(''), 4000);
      } else {
        await API.post('/transactions', formData);
        setToastMessage('Transaction recorded successfully!');
        setIsModalOpen(false);
        fetchDashboardData();
        setTimeout(() => setToastMessage(''), 4000);
      }
    } catch (err) {
      alert(err.response?.data?.message || 'Error saving transaction');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Aggregating your financial insights..." />;
  if (!data) return <div className="p-8 text-center text-slate-400">Failed to load dashboard.</div>;

  const { summary, healthScore, smartInsights, recentTransactions, categoryBreakdown, monthlyTrend, upcomingBills, activeGoals, budgetsSummary } = data;

  return (
    <div className="space-y-6">
      {/* Toast alert */}
      {toastMessage && (
        <div className="fixed bottom-5 right-5 z-50 p-4 rounded-2xl bg-emerald-600 text-white shadow-xl text-xs font-semibold flex items-center gap-2 animate-in fade-in slide-in-from-bottom-4">
          <Sparkles className="w-4 h-4" />
          {toastMessage}
        </div>
      )}

      {/* Welcome Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Financial Command Center
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Real-time cashflow, health score metrics, and budget enforcement
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={PlusCircle}
          onClick={() => setIsModalOpen(true)}
        >
          Add Transaction
        </Button>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Current Net Balance"
          value={formatAmount(summary.currentBalance)}
          subtitle="All accounts combined"
          icon={Wallet}
          color="emerald"
        />
        <StatCard
          title="Monthly Income"
          value={formatAmount(summary.totalIncome)}
          trend="up"
          trendValue="+5.2%"
          icon={TrendingUp}
          color="blue"
        />
        <StatCard
          title="Monthly Expenses"
          value={formatAmount(summary.totalExpenses)}
          subtitle={`${summary.budgetUsagePercent}% of budget used`}
          icon={TrendingDown}
          color="rose"
        />
        <StatCard
          title="Monthly Net Savings"
          value={formatAmount(summary.monthlySavings)}
          trend="up"
          trendValue="Healthy"
          icon={PiggyBank}
          color="purple"
        />
      </div>

      {/* Health Score Gauge Banner */}
      <HealthScoreGauge healthScore={healthScore} />

      {/* AI Smart Insights Carousel / List */}
      {smartInsights && smartInsights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {smartInsights.slice(0, 2).map((ins) => (
            <div
              key={ins.id}
              className="p-4 rounded-2xl bg-gradient-to-r from-emerald-500/5 via-teal-500/5 to-blue-500/5 border border-emerald-500/20 flex items-start gap-3.5 shadow-xs"
            >
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 shrink-0 mt-0.5">
                <Sparkles className="w-4 h-4" />
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {ins.title}
                </h4>
                <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                  {ins.message}
                </p>
                {ins.action && (
                  <p className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 mt-2">
                    Action: {ins.action}
                  </p>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Charts Section: Cashflow Trend & Category Distribution */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Cashflow Trend (2 Cols) */}
        <Card
          title="Income vs Expense Cashflow Trend"
          subtitle="Last 6 months progression"
          className="lg:col-span-2"
        >
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={monthlyTrend} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                <defs>
                  <linearGradient id="incomeColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10B981" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#10B981" stopOpacity={0.0} />
                  </linearGradient>
                  <linearGradient id="expenseColor" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#EF4444" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#EF4444" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(value) => [formatAmount(value), '']}
                  contentStyle={{
                    backgroundColor: '#0F172A',
                    borderColor: '#334155',
                    borderRadius: '12px',
                    color: '#fff',
                    fontSize: '12px',
                  }}
                />
                <Area
                  type="monotone"
                  dataKey="income"
                  stroke="#10B981"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#incomeColor)"
                  name="Income"
                />
                <Area
                  type="monotone"
                  dataKey="expense"
                  stroke="#EF4444"
                  strokeWidth={2.5}
                  fillOpacity={1}
                  fill="url(#expenseColor)"
                  name="Expense"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </Card>

        {/* Category Breakdown (1 Col) */}
        <Card
          title="Category Distribution"
          subtitle="Current month expense breakdown"
        >
          {categoryBreakdown && categoryBreakdown.length > 0 ? (
            <div className="h-64 w-full flex flex-col justify-between">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={categoryBreakdown}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {categoryBreakdown.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(value) => [formatAmount(value), 'Amount']}
                      contentStyle={{
                        backgroundColor: '#0F172A',
                        borderColor: '#334155',
                        borderRadius: '12px',
                        color: '#fff',
                        fontSize: '12px',
                      }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="grid grid-cols-2 gap-1.5 text-[11px] mt-2 max-h-20 overflow-y-auto">
                {categoryBreakdown.slice(0, 6).map((cat, idx) => (
                  <div key={cat.name} className="flex items-center gap-1.5 truncate">
                    <span
                      className="w-2 h-2 rounded-full shrink-0"
                      style={{ backgroundColor: PIE_COLORS[idx % PIE_COLORS.length] }}
                    />
                    <span className="text-slate-600 dark:text-slate-400 truncate">{cat.name}:</span>
                    <span className="font-semibold">{formatAmount(cat.value)}</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No expenses recorded this month
            </div>
          )}
        </Card>
      </div>

      {/* Row: Budget Health & Upcoming Bills */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Budgets Monitor */}
        <Card
          title="Active Category Budgets"
          subtitle="Real-time threshold tracking"
          action={
            <Link to="/budgets" className="text-xs font-semibold text-emerald-500 hover:underline">
              Manage All
            </Link>
          }
        >
          <div className="space-y-4">
            {budgetsSummary && budgetsSummary.slice(0, 4).map((b) => (
              <div key={b._id} className="space-y-1.5">
                <div className="flex justify-between text-xs">
                  <span className="font-semibold text-slate-800 dark:text-slate-200">
                    {b.category}
                  </span>
                  <span className="text-slate-500">
                    {formatAmount(b.spent)} / {formatAmount(b.limit)} ({b.percent}%)
                  </span>
                </div>
                <div className="w-full h-2 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      b.percent >= 100
                        ? 'bg-rose-500'
                        : b.percent >= 80
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, b.percent)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Upcoming Bills */}
        <Card
          title="Upcoming Bills & Subscriptions"
          subtitle="Next scheduled payment deadlines"
          action={
            <Link to="/bills" className="text-xs font-semibold text-emerald-500 hover:underline">
              View Bills
            </Link>
          }
        >
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {upcomingBills && upcomingBills.length > 0 ? (
              upcomingBills.map((bill) => (
                <div key={bill._id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-blue-500/10 text-blue-500 flex items-center justify-center">
                      <Receipt className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {bill.title}
                      </h4>
                      <p className="text-[11px] text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> Due {new Date(bill.dueDate).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-bold text-slate-900 dark:text-white">
                      {formatAmount(bill.amount)}
                    </span>
                    <span className="block text-[10px] text-slate-400 capitalize">
                      {bill.category}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No pending bills due soon.</p>
            )}
          </div>
        </Card>
      </div>

      {/* Recent Transactions List */}
      <Card
        title="Recent Transactions"
        subtitle="Latest income and expense entries"
        action={
          <Link to="/transactions" className="text-xs font-semibold text-emerald-500 hover:underline inline-flex items-center gap-1">
            <span>All Transactions</span>
            <ArrowRight className="w-3 h-3" />
          </Link>
        }
      >
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="pb-3 font-semibold">Title</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Method</th>
                <th className="pb-3 font-semibold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {recentTransactions && recentTransactions.map((tx) => (
                <tr key={tx._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition">
                  <td className="py-3 font-medium text-slate-900 dark:text-white">
                    {tx.title}
                  </td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">
                    {tx.category}
                  </td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">
                    {new Date(tx.date).toLocaleDateString()}
                  </td>
                  <td className="py-3 text-slate-500 dark:text-slate-400 capitalize">
                    {tx.paymentMethod}
                  </td>
                  <td
                    className={`py-3 text-right font-bold ${
                      tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                    }`}
                  >
                    {tx.type === 'income' ? '+' : '-'}
                    {formatAmount(tx.amount)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Transaction Modal */}
      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleCreateTransaction}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default DashboardPage;
