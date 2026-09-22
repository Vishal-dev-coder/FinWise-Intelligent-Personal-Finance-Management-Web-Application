import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import TransactionModal from '../components/common/TransactionModal';
import ConfirmModal from '../components/common/ConfirmModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  TrendingDown,
  PlusCircle,
  CreditCard,
  HeartHandshake,
  Search,
  Trash2,
  Edit2,
  Filter,
} from 'lucide-react';

const ExpensesPage = () => {
  const { formatAmount } = useCurrency();
  const [expenses, setExpenses] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchExpenses = async () => {
    setLoading(true);
    try {
      const [listRes, statsRes] = await Promise.all([
        API.get('/transactions', {
          params: {
            type: 'expense',
            search,
            category: categoryFilter,
            paymentMethod: paymentFilter,
            limit: 50,
          },
        }),
        API.get('/transactions/stats', { params: { type: 'expense' } }),
      ]);
      setExpenses(listRes.data.data);
      setStats(statsRes.data.data);
    } catch (err) {
      console.error('Failed to load expenses', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchExpenses();
  }, [categoryFilter, paymentFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchExpenses();
  };

  const handleSave = async (formData) => {
    setActionLoading(true);
    try {
      if (editingItem) {
        await API.put(`/transactions/${editingItem._id}`, { ...formData, type: 'expense' });
      } else {
        await API.post('/transactions', { ...formData, type: 'expense' });
      }
      setIsModalOpen(false);
      setEditingItem(null);
      fetchExpenses();
    } catch (err) {
      alert('Failed to save expense');
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
      fetchExpenses();
    } catch (err) {
      alert('Failed to delete expense');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading && expenses.length === 0) return <LoadingSpinner fullPage message="Analyzing your spending ledger..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Expense Auditing & Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Audit category limits, track payment methods, and monitor mood-driven spending
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
          Record Expense
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Recorded Expenses"
          value={formatAmount(stats?.totalAmount || 0)}
          icon={TrendingDown}
          color="rose"
        />
        <StatCard
          title="Top Payment Method"
          value={stats?.paymentMethodBreakdown?.[0]?.name || 'Card'}
          subtitle={`${stats?.paymentMethodBreakdown?.[0]?.value ? formatAmount(stats.paymentMethodBreakdown[0].value) : '$0'} processed`}
          icon={CreditCard}
          color="blue"
        />
        <StatCard
          title="Primary Spending Category"
          value={stats?.categoryBreakdown?.[0]?.name || 'Groceries'}
          subtitle={`${stats?.categoryBreakdown?.[0]?.value ? formatAmount(stats.categoryBreakdown[0].value) : '$0'} allocated`}
          icon={HeartHandshake}
          color="purple"
        />
      </div>

      {/* Search & Filter Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search expenses..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>
          <Select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'Housing & Rent', label: 'Housing & Rent' },
              { value: 'Groceries', label: 'Groceries' },
              { value: 'Dining Out', label: 'Dining Out' },
              { value: 'Transportation', label: 'Transportation' },
              { value: 'Utilities', label: 'Utilities' },
              { value: 'Entertainment', label: 'Entertainment' },
              { value: 'Shopping', label: 'Shopping' },
              { value: 'Subscriptions', label: 'Subscriptions' },
            ]}
          />
          <Select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            options={[
              { value: 'all', label: 'All Payment Methods' },
              { value: 'card', label: 'Card' },
              { value: 'cash', label: 'Cash' },
              { value: 'upi', label: 'UPI' },
              { value: 'bank_transfer', label: 'Bank Transfer' },
              { value: 'wallet', label: 'Wallet' },
            ]}
          />
        </form>
      </Card>

      {/* Expenses Table */}
      <Card title="Expense History" subtitle={`${expenses.length} records found`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <th className="pb-3 font-semibold">Title</th>
                <th className="pb-3 font-semibold">Category</th>
                <th className="pb-3 font-semibold">Date</th>
                <th className="pb-3 font-semibold">Payment Method</th>
                <th className="pb-3 font-semibold">Mood State</th>
                <th className="pb-3 font-semibold text-right">Amount</th>
                <th className="pb-3 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {expenses.map((item) => (
                <tr key={item._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition">
                  <td className="py-3 font-semibold text-slate-900 dark:text-white">
                    {item.title}
                    {item.note && <span className="block text-[11px] text-slate-400 font-normal">{item.note}</span>}
                  </td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{item.category}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400">{new Date(item.date).toLocaleDateString()}</td>
                  <td className="py-3 text-slate-500 dark:text-slate-400 capitalize">{item.paymentMethod?.replace('_', ' ')}</td>
                  <td className="py-3 capitalize">
                    <span className="text-[11px] px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 font-medium">
                      {item.mood || 'neutral'}
                    </span>
                  </td>
                  <td className="py-3 text-right font-bold text-rose-500">
                    -{formatAmount(item.amount)}
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
        initialData={editingItem ? { ...editingItem, type: 'expense' } : { type: 'expense', category: 'Groceries' }}
        isLoading={actionLoading}
      />

      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Expense Record"
        message="Are you sure you want to remove this expense record?"
        isLoading={actionLoading}
      />
    </div>
  );
};

export default ExpensesPage;
