import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import Card from '../components/common/Card';
import StatCard from '../components/common/StatCard';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Modal from '../components/common/Modal';
import ConfirmModal from '../components/common/ConfirmModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  PieChart,
  PlusCircle,
  AlertTriangle,
  CheckCircle2,
  Sparkles,
  Trash2,
  Edit2,
  DollarSign,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'Housing & Rent', label: 'Housing & Rent' },
  { value: 'Groceries', label: 'Groceries' },
  { value: 'Dining Out', label: 'Dining Out' },
  { value: 'Transportation', label: 'Transportation' },
  { value: 'Utilities', label: 'Utilities' },
  { value: 'Entertainment', label: 'Entertainment' },
  { value: 'Shopping', label: 'Shopping' },
  { value: 'Healthcare', label: 'Healthcare' },
  { value: 'Subscriptions', label: 'Subscriptions' },
  { value: 'Other', label: 'Other' },
];

const BudgetPage = () => {
  const { formatAmount } = useCurrency();
  const [budgets, setBudgets] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [totalBudgeted, setTotalBudgeted] = useState(0);
  const [totalSpent, setTotalSpent] = useState(0);
  const [loading, setLoading] = useState(true);

  // Form modal
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBudget, setEditingBudget] = useState(null);
  const [formData, setFormData] = useState({
    category: 'Groceries',
    limit: '',
    alertAt50: true,
    alertAt80: true,
    alertAt100: true,
  });
  const [deletingId, setDeletingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchBudgets = async () => {
    setLoading(true);
    try {
      const res = await API.get('/budgets');
      setBudgets(res.data.data);
      setRecommendations(res.data.recommendations || []);
      setTotalBudgeted(res.data.totalBudgeted || 0);
      setTotalSpent(res.data.totalSpent || 0);
    } catch (err) {
      console.error('Failed to load budgets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBudgets();
  }, []);

  const openCreateModal = (suggested = null) => {
    if (suggested) {
      setFormData({
        category: suggested.category,
        limit: suggested.suggestedLimit,
        alertAt50: true,
        alertAt80: true,
        alertAt100: true,
      });
    } else {
      setFormData({
        category: 'Groceries',
        limit: '',
        alertAt50: true,
        alertAt80: true,
        alertAt100: true,
      });
    }
    setEditingBudget(null);
    setIsModalOpen(true);
  };

  const handleEdit = (budget) => {
    setEditingBudget(budget);
    setFormData({
      category: budget.category,
      limit: budget.limit,
      alertAt50: budget.alertAt50,
      alertAt80: budget.alertAt80,
      alertAt100: budget.alertAt100,
    });
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.limit || Number(formData.limit) <= 0) return alert('Enter valid limit');

    setActionLoading(true);
    try {
      if (editingBudget) {
        await API.put(`/budgets/${editingBudget._id}`, formData);
      } else {
        await API.post('/budgets', formData);
      }
      setIsModalOpen(false);
      fetchBudgets();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save budget');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setActionLoading(true);
    try {
      await API.delete(`/budgets/${deletingId}`);
      setDeletingId(null);
      fetchBudgets();
    } catch (err) {
      alert('Failed to delete budget');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Calibrating category budget limits..." />;

  const overallPercent = totalBudgeted > 0 ? Math.min(100, Math.round((totalSpent / totalBudgeted) * 100)) : 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Monthly Budget Enforcement
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Set guardrails on discretionary spending and receive threshold alerts
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={PlusCircle}
          onClick={() => openCreateModal()}
        >
          Create Budget Limit
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Monthly Budget Pool"
          value={formatAmount(totalBudgeted)}
          subtitle={`${budgets.length} categories monitored`}
          icon={PieChart}
          color="emerald"
        />
        <StatCard
          title="Month-to-Date Spend"
          value={formatAmount(totalSpent)}
          subtitle={`${overallPercent}% of combined limit`}
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="Remaining Unspent Pool"
          value={formatAmount(Math.max(0, totalBudgeted - totalSpent))}
          subtitle="Available for rest of month"
          icon={CheckCircle2}
          color="purple"
        />
      </div>

      {/* Recommendations Banner */}
      {recommendations.length > 0 && (
        <Card
          title="Smart Budget Recommendations"
          subtitle="AI-computed based on historical monthly outlays"
          className="border-emerald-500/30 bg-emerald-500/5"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {recommendations.map((rec) => (
              <div
                key={rec.category}
                className="p-3.5 rounded-xl bg-white dark:bg-dark-900 border border-emerald-500/20 flex items-center justify-between gap-3"
              >
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
                    Set {rec.category} limit to {formatAmount(rec.suggestedLimit)}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {rec.reason}
                  </p>
                </div>
                <Button
                  variant="primary"
                  size="sm"
                  onClick={() => openCreateModal(rec)}
                  className="shrink-0 text-xs"
                >
                  Adopt Limit
                </Button>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Budgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {budgets.map((b) => {
          const isExceeded = b.spent >= b.limit;
          const isNear = b.percentage >= 80 && !isExceeded;

          return (
            <div
              key={b._id}
              className={`p-5 rounded-2xl bg-white dark:bg-dark-900 border transition-all ${
                isExceeded
                  ? 'border-rose-500/50 shadow-sm shadow-rose-500/10'
                  : isNear
                  ? 'border-amber-500/40'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Category Limit
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {b.category}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() => handleEdit(b)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setDeletingId(b._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className={isExceeded ? 'text-rose-500 font-bold' : 'text-slate-700 dark:text-slate-300'}>
                    Spent: {formatAmount(b.spent)}
                  </span>
                  <span className="text-slate-500">
                    Limit: {formatAmount(b.limit)}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ${
                      isExceeded
                        ? 'bg-rose-500'
                        : isNear
                        ? 'bg-amber-500'
                        : 'bg-emerald-500'
                    }`}
                    style={{ width: `${Math.min(100, b.percentage)}%` }}
                  />
                </div>
              </div>

              {/* Status Message */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                {isExceeded ? (
                  <span className="inline-flex items-center gap-1 text-rose-500 font-bold text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5" /> Overspent by {formatAmount(b.spent - b.limit)}
                  </span>
                ) : isNear ? (
                  <span className="inline-flex items-center gap-1 text-amber-500 font-semibold text-[11px]">
                    <AlertTriangle className="w-3.5 h-3.5" /> {b.percentage}% Used ({formatAmount(b.remaining)} left)
                  </span>
                ) : (
                  <span className="text-slate-400 text-[11px]">
                    {formatAmount(b.remaining)} remaining buffer
                  </span>
                )}
                <span className="text-[11px] font-bold text-slate-500">
                  {b.percentage}%
                </span>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Create/Edit Budget */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingBudget ? 'Update Budget Limit' : 'Set Category Budget'}
        subtitle="Establish proactive spending boundaries"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
            options={CATEGORIES}
            disabled={!!editingBudget}
          />

          <Input
            label="Monthly Limit Amount"
            type="number"
            step="1"
            min="10"
            placeholder="e.g. 500"
            value={formData.limit}
            onChange={(e) => setFormData((p) => ({ ...p, limit: e.target.value }))}
            icon={DollarSign}
            required
          />

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 block mb-1">
              Active Warning Thresholds
            </span>
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.alertAt50}
                onChange={(e) => setFormData((p) => ({ ...p, alertAt50: e.target.checked }))}
                className="w-4 h-4 text-emerald-500 rounded"
              />
              Notify at 50% utilization
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.alertAt80}
                onChange={(e) => setFormData((p) => ({ ...p, alertAt80: e.target.checked }))}
                className="w-4 h-4 text-emerald-500 rounded"
              />
              Warn at 80% capacity limit
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400 cursor-pointer">
              <input
                type="checkbox"
                checked={formData.alertAt100}
                onChange={(e) => setFormData((p) => ({ ...p, alertAt100: e.target.checked }))}
                className="w-4 h-4 text-emerald-500 rounded"
              />
              Alert immediately upon budget breach (100%+)
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)} disabled={actionLoading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Save Budget Limit
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Remove Category Budget"
        message="Are you sure you want to remove this budget limit?"
        isLoading={actionLoading}
      />
    </div>
  );
};

export default BudgetPage;
