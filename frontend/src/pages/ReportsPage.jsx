import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  FileBarChart,
  Download,
  Printer,
  Calendar,
  Filter,
  TrendingUp,
  TrendingDown,
  PieChart,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from 'recharts';

const ReportsPage = () => {
  const { formatAmount } = useCurrency();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');

  const fetchReport = async () => {
    setLoading(true);
    try {
      const res = await API.get('/reports/analytics', {
        params: { startDate, endDate },
      });
      setData(res.data.data);
    } catch (err) {
      console.error('Failed to fetch analytics report', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReport();
  }, []);

  const handleExportCsv = async () => {
    try {
      const response = await API.get('/reports/export-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'FinWise_Financial_Report.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export CSV');
    }
  };

  const handlePrintPdf = () => {
    window.print();
  };

  if (loading) return <LoadingSpinner fullPage message="Compiling fiscal analytics and cashflow reports..." />;
  if (!data) return null;

  const { summary, categoryBreakdown, paymentMethodBreakdown, monthlyTrends, budgetPerformance } = data;

  return (
    <div className="space-y-6 print:m-0 print:p-0">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 print:hidden">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Financial Intelligence & Audit Reports
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Multi-period cashflow statements, budget variance, and CSV/PDF data exports
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" icon={Printer} onClick={handlePrintPdf}>
            Print / PDF Report
          </Button>
          <Button variant="primary" size="sm" icon={Download} onClick={handleExportCsv}>
            Export to CSV
          </Button>
        </div>
      </div>

      {/* Date Filter Bar */}
      <Card className="p-4 print:hidden">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            fetchReport();
          }}
          className="flex flex-wrap items-end gap-3 text-xs"
        >
          <div className="w-full sm:w-auto flex-1">
            <Input
              label="Start Date"
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              icon={Calendar}
            />
          </div>
          <div className="w-full sm:w-auto flex-1">
            <Input
              label="End Date"
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              icon={Calendar}
            />
          </div>
          <Button type="submit" variant="secondary" size="md" icon={Filter} className="h-10">
            Filter Period
          </Button>
        </form>
      </Card>

      {/* Printable Report Header */}
      <div className="hidden print:block mb-6 text-center border-b pb-4">
        <h2 className="text-2xl font-bold">FinWise Comprehensive Fiscal Report</h2>
        <p className="text-xs text-slate-500">Generated on {new Date().toLocaleDateString()}</p>
      </div>

      {/* Summary KPI Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Period Total Income"
          value={formatAmount(summary.totalIncome)}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Period Total Outlay"
          value={formatAmount(summary.totalExpense)}
          icon={TrendingDown}
          color="rose"
        />
        <StatCard
          title="Net Capital Retained"
          value={formatAmount(summary.netSavings)}
          subtitle={`${summary.savingsRate}% savings rate`}
          icon={FileBarChart}
          color="purple"
        />
        <StatCard
          title="Total Transactions"
          value={summary.transactionCount}
          subtitle="Audited in period"
          icon={PieChart}
          color="blue"
        />
      </div>

      {/* Charts: Cashflow Line Trend & Category Horizontal Bars */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card title="Monthly Cashflow Trajectory" subtitle="Income vs Expense dynamics">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={monthlyTrends}>
                <XAxis dataKey="month" stroke="#94A3B8" fontSize={11} />
                <YAxis stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(v) => [formatAmount(v), '']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '12px' }}
                />
                <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '8px' }} />
                <Line type="monotone" dataKey="income" stroke="#10B981" strokeWidth={2.5} name="Income" />
                <Line type="monotone" dataKey="expense" stroke="#EF4444" strokeWidth={2.5} name="Expense" />
                <Line type="monotone" dataKey="savings" stroke="#3B82F6" strokeWidth={2} strokeDasharray="3 3" name="Net Saved" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </Card>

        <Card title="Category Spending Concentration" subtitle="Ranked expenses by category">
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={categoryBreakdown.slice(0, 6)} layout="vertical" margin={{ left: 20 }}>
                <XAxis type="number" stroke="#94A3B8" fontSize={11} tickFormatter={(v) => `$${v}`} />
                <YAxis dataKey="name" type="category" stroke="#94A3B8" fontSize={10} width={90} />
                <Tooltip
                  formatter={(v) => [formatAmount(v), 'Outlay']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#3B82F6" radius={[0, 6, 6, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      </div>

      {/* Budget Performance Table */}
      <Card title="Budget Variance & Compliance Report" subtitle="Evaluating adherence against pre-set caps">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold text-right">Budget Limit</th>
                <th className="pb-3 font-semibold text-right">Actual Outlay</th>
                <th className="pb-3 font-semibold text-right">Variance</th>
                <th className="pb-3 font-semibold text-right">Utilization %</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {budgetPerformance.map((b) => {
                const over = b.variance < 0;
                return (
                  <tr key={b.category} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50">
                    <td className="py-3 font-semibold text-slate-900 dark:text-white">
                      {b.category}
                    </td>
                    <td className="py-3 text-right text-slate-500">
                      {formatAmount(b.limit)}
                    </td>
                    <td className="py-3 text-right font-medium text-slate-800 dark:text-slate-200">
                      {formatAmount(b.spent)}
                    </td>
                    <td className={`py-3 text-right font-bold ${over ? 'text-rose-500' : 'text-emerald-500'}`}>
                      {over ? '-' : '+'}{formatAmount(Math.abs(b.variance))}
                    </td>
                    <td className="py-3 text-right">
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${b.utilization > 100 ? 'bg-rose-500/10 text-rose-500' : b.utilization > 80 ? 'bg-amber-500/10 text-amber-500' : 'bg-emerald-500/10 text-emerald-500'}`}>
                        {b.utilization}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default ReportsPage;
