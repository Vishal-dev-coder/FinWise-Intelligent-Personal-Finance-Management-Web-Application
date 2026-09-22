import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import TransactionModal from '../components/common/TransactionModal';
import ConfirmModal from '../components/common/ConfirmModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  TrendingUp,
  PlusCircle,
  Briefcase,
  Layers,
  Trash2,
  Edit2,
} from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
} from 'recharts';

const IncomePage = () => {
  const { formatAmount } = useCurrency();
  const [incomes, setIncomes] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchIncomeData = async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        API.get('/transactions', { params: { type: 'income', limit: 50 } }),
        API.get('/transactions/stats', { params: { type: 'income' } }),
      ]);
      setIncomes(listRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error('Failed to fetch income data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchIncomeData();
  }, []);

  const handleSave = async (formData) => {
    setActionLoading(true);
    try {
      if (editingItem) {
        await API.put(`/transactions/${editingItem._id}`, { ...formData, type: 'income' });
      } else {
        await API.post('/transactions', { ...formData, type: 'income' });
      }
      setIsModalOpen(false);
      setEditingItem(null);
      fetchIncomeData();
    } catch (err) {
      alert('Failed to save income record');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setActionLoading(true);
    try {
      await API.delete(`/transactions/${deletingId}`);
      setDeletingId(null);
      fetchIncomeData();
    } catch (err) {
      alert('Failed to delete income record');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Fetching income streams..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Income Stream Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track salaries, freelance payouts, dividends, and recurring revenues
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={PlusCircle}
          onClick={() => {
            setEditingItem(null);
            setIsModalOpen(true);
          }}
        >
          Add Income
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Lifetime Inflow"
          value={formatAmount(stats?.totalAmount || 0)}
          icon={TrendingUp}
          color="emerald"
        />
        <StatCard
          title="Total Income Entries"
          value={stats?.count || 0}
          icon={Layers}
          color="blue"
        />
        <StatCard
          title="Primary Inflow Stream"
          value={stats?.categoryBreakdown?.[0]?.name || 'Salary'}
          subtitle={`Represents ${stats?.categoryBreakdown?.[0]?.value ? formatAmount(stats.categoryBreakdown[0].value) : '$0'}`}
          icon={Briefcase}
          color="purple"
        />
      </div>

      {/* Chart: Category Distribution */}
      {stats?.categoryBreakdown && stats.categoryBreakdown.length > 0 && (
        <Card title="Income Breakdown by Source" subtitle="Revenue composition">
          <div className="h-60 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats.categoryBreakdown} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#94A3B8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94A3B8" fontSize={11} tickLine={false} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  formatter={(val) => [formatAmount(val), 'Total']}
                  contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '12px' }}
                />
                <Bar dataKey="value" fill="#10B981" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </Card>
      )}

      {/* Incomes List */}
      <Card title="Recorded Inflows" subtitle="History of all income transactions">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="pb-3 font-semibold">Source / Title</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Recurring</th>
                <th className="pb-3 font-semibold text-right">Amount</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {incomes.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition">
                  <td className="py-3 font-semibold text-slate-900 dark:text-white">
                    {item.title}
                    {item.note && <span className="block text-[11px] text-slate-400 font-normal">{item.note}</span>}
                  </td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{item.category}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${item.isRecurring ? 'bg-emerald-500/10 text-emerald-500' : 'bg-slate-100 dark:bg-slate-800 text-slate-500'}`}>
                      {item.isRecurring ? 'Recurring' : 'One-off'}
                    </span>
                  </td>
                  <td className="py-3 text-right font-bold text-emerald-500">
                    +{formatAmount(item.amount)}
                  </td>
                  <td className="py-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button
                        onClick={() => {
                          setEditingItem(item);
                          setIsModalOpen(true);
                        }}
                        className="p-1 text-slate-400 hover:text-slate-200"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => setDeletingId(item._id)}
                        className="p-1 text-slate-400 hover:text-rose-500"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <TransactionModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setEditingItem(null);
        }}
        onSubmit={handleSave}
        initialData={editingItem ? { ...editingItem, type: 'income' } : { type: 'income', category: 'Salary' }}
        isLoading={actionLoading}
      />

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Income Record"
        message="Are you sure you want to remove this income entry?"
        isLoading={actionLoading}
      />
    </div>
  );
};

export default IncomePage;
