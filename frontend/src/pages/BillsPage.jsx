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
  Receipt,
  PlusCircle,
  AlertTriangle,
  Repeat,
  CheckCircle2,
  Calendar,
  Clock,
  Trash2,
  DollarSign,
  ShieldAlert,
} from 'lucide-react';

const CATEGORIES = [
  { value: 'Utilities', label: 'Utilities (Electricity, Gas, Water)' },
  { value: 'Streaming', label: 'Streaming (Netflix, Spotify, Prime)' },
  { value: 'Internet', label: 'Internet & Mobile' },
  { value: 'Insurance', label: 'Insurance' },
  { value: 'Rent', label: 'Rent & Lease' },
  { value: 'Fitness', label: 'Fitness & Gym' },
  { value: 'Software', label: 'Software & Cloud' },
  { value: 'Credit Card', label: 'Credit Card Minimum' },
  { value: 'Other', label: 'Other' },
];

const FREQUENCIES = [
  { value: 'monthly', label: 'Monthly' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'quarterly', label: 'Quarterly' },
  { value: 'yearly', label: 'Yearly' },
  { value: 'one_time', label: 'One Time Bill' },
];

const BillsPage = () => {
  const { formatAmount } = useCurrency();
  const [bills, setBills] = useState([]);
  const [summary, setSummary] = useState(null);
  const [leakageWarnings, setLeakageWarnings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    category: 'Utilities',
    frequency: 'monthly',
    dueDate: new Date().toISOString().split('T')[0],
    isSubscription: false,
    autoPay: false,
  });

  const fetchBills = async () => {
    setLoading(true);
    try {
      const res = await API.get('/bills');
      setBills(res.data.data);
      setSummary(res.data.summary);
      setLeakageWarnings(res.data.leakageWarnings || []);
    } catch (err) {
      console.error('Failed to load bills', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBills();
  }, []);

  const handleTogglePaid = async (id) => {
    try {
      await API.patch(`/bills/${id}/toggle-paid`);
      fetchBills();
    } catch (err) {
      alert('Failed to update payment status');
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await API.post('/bills', formData);
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        amount: '',
        category: 'Utilities',
        frequency: 'monthly',
        dueDate: new Date().toISOString().split('T')[0],
        isSubscription: false,
        autoPay: false,
      });
      fetchBills();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save bill');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setActionLoading(true);
    try {
      await API.delete(`/bills/${deletingId}`);
      setDeletingId(null);
      fetchBills();
    } catch (err) {
      alert('Failed to delete bill');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Auditing recurring subscriptions and leakage..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Bills & Subscription Leakage Control
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Prevent late penalties and detect recurring digital charge leaks
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={PlusCircle}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Add Bill / Subscription
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Monthly Recurring Subscriptions"
          value={formatAmount(summary?.monthlySubscriptionTotal || 0)}
          subtitle={`${summary?.subscriptionsCount || 0} active recurring services`}
          icon={Repeat}
          color="purple"
        />
        <StatCard
          title="Pending Due Balance"
          value={formatAmount(summary?.totalDueThisMonth || 0)}
          subtitle={`${summary?.unpaidCount || 0} unpaid invoices this cycle`}
          icon={Clock}
          color="amber"
        />
        <StatCard
          title="Total Monitored Outlays"
          value={summary?.totalBillsCount || 0}
          subtitle="Fixed recurring obligations"
          icon={Receipt}
          color="emerald"
        />
      </div>

      {/* Subscription Leakage Warning Box */}
      {leakageWarnings.length > 0 && (
        <Card
          title="Subscription Leakage Alerts"
          subtitle="Detected redundant recurring services that cost you money"
          className="border-amber-500/30 bg-amber-500/5"
        >
          <div className="space-y-3">
            {leakageWarnings.map((warn, i) => (
              <div
                key={i}
                className="p-3.5 rounded-xl bg-white dark:bg-dark-900 border border-amber-500/20 flex items-start gap-3"
              >
                <div className="p-2 rounded-lg bg-amber-500/10 text-amber-500 shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                    {warn.title}
                  </h4>
                  <p className="text-xs text-slate-600 dark:text-slate-400 mt-0.5 leading-relaxed">
                    {warn.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Bills Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {bills.map((bill) => {
          const isPaid = bill.isPaid;
          const due = new Date(bill.dueDate);
          const isOverdue = due < new Date() && !isPaid;

          return (
            <div
              key={bill._id}
              className={`p-5 rounded-2xl bg-white dark:bg-dark-900 border transition-all ${
                isOverdue
                  ? 'border-rose-500/40 bg-rose-500/5'
                  : isPaid
                  ? 'border-emerald-500/40 opacity-75'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    {bill.category} • {bill.frequency}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {bill.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  {bill.isSubscription && (
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400">
                      Sub
                    </span>
                  )}
                  <button
                    onClick={() => setDeletingId(bill._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex items-baseline justify-between">
                <div className="text-2xl font-extrabold text-slate-900 dark:text-white">
                  {formatAmount(bill.amount)}
                </div>
                <div className="text-xs flex items-center gap-1 font-medium text-slate-500">
                  <Calendar className="w-3.5 h-3.5 text-slate-400" />
                  <span>Due: {due.toLocaleDateString()}</span>
                </div>
              </div>

              {/* Status and Toggle */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between">
                {isPaid ? (
                  <span className="inline-flex items-center gap-1 text-emerald-500 font-bold text-xs">
                    <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                  </span>
                ) : isOverdue ? (
                  <span className="inline-flex items-center gap-1 text-rose-500 font-bold text-xs">
                    <AlertTriangle className="w-3.5 h-3.5" /> Overdue
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-amber-500 font-semibold text-xs">
                    <Clock className="w-3.5 h-3.5" /> Pending Payment
                  </span>
                )}

                <Button
                  variant={isPaid ? 'secondary' : 'primary'}
                  size="sm"
                  onClick={() => handleTogglePaid(bill._id)}
                  className="text-xs"
                >
                  {isPaid ? 'Mark Unpaid' : 'Mark as Paid'}
                </Button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal: Add Bill */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Recurring Bill or Subscription"
        subtitle="Schedule notifications before due dates"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Service Title"
            placeholder="e.g. Netflix, Electricity Grid"
            value={formData.title}
            onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="19.99"
              value={formData.amount}
              onChange={(e) => setFormData((p) => ({ ...p, amount: e.target.value }))}
              icon={DollarSign}
              required
            />
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
              options={CATEGORIES}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Billing Frequency"
              value={formData.frequency}
              onChange={(e) => setFormData((p) => ({ ...p, frequency: e.target.value }))}
              options={FREQUENCIES}
            />
            <Input
              label="Next Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData((p) => ({ ...p, dueDate: e.target.value }))}
              icon={Calendar}
              required
            />
          </div>

          <div className="space-y-2 p-3 rounded-xl bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-slate-800">
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={formData.isSubscription}
                onChange={(e) => setFormData((p) => ({ ...p, isSubscription: e.target.checked }))}
                className="w-4 h-4 text-emerald-500 rounded"
              />
              Track as digital subscription (monitored for leakage)
            </label>
            <label className="flex items-center gap-2 text-xs font-semibold cursor-pointer">
              <input
                type="checkbox"
                checked={formData.autoPay}
                onChange={(e) => setFormData((p) => ({ ...p, autoPay: e.target.checked }))}
                className="w-4 h-4 text-emerald-500 rounded"
              />
              Auto-pay enabled with card/bank
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Schedule Bill
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Remove Bill Entry"
        message="Are you sure you want to delete this bill record?"
        isLoading={actionLoading}
      />
    </div>
  );
};

export default BillsPage;
