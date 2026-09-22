import React, { useState, useEffect } from 'react';
import confetti from 'canvas-confetti';
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
  Target,
  PlusCircle,
  Trophy,
  Calendar,
  Sparkles,
  ArrowUpRight,
  Trash2,
  CheckCircle2,
  DollarSign,
} from 'lucide-react';

const GOAL_CATEGORIES = [
  { value: 'Emergency Fund', label: 'Emergency Fund' },
  { value: 'Travel', label: 'Travel & Vacation' },
  { value: 'Vehicle', label: 'Vehicle / Car' },
  { value: 'House', label: 'Home / Real Estate' },
  { value: 'Education', label: 'Education' },
  { value: 'Gadget', label: 'Gadget & Tech' },
  { value: 'Retirement', label: 'Retirement Fund' },
  { value: 'Wedding', label: 'Wedding' },
  { value: 'General', label: 'General Savings' },
];

const GoalsPage = () => {
  const { formatAmount } = useCurrency();
  const [goals, setGoals] = useState([]);
  const [totalTarget, setTotalTarget] = useState(0);
  const [totalSaved, setTotalSaved] = useState(0);
  const [overallProgress, setOverallProgress] = useState(0);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [depositGoal, setDepositGoal] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    targetAmount: '',
    currentAmount: '',
    targetDate: '',
    category: 'Emergency Fund',
    color: '#10B981',
  });

  const fetchGoals = async () => {
    setLoading(true);
    try {
      const res = await API.get('/goals');
      setGoals(res.data.data);
      setTotalTarget(res.data.totalTarget || 0);
      setTotalSaved(res.data.totalSaved || 0);
      setOverallProgress(res.data.overallProgress || 0);
    } catch (err) {
      console.error('Failed to load goals', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGoals();
  }, []);

  const handleCreateGoal = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await API.post('/goals', formData);
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        targetAmount: '',
        currentAmount: '',
        targetDate: '',
        category: 'Emergency Fund',
        color: '#10B981',
      });
      fetchGoals();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to create goal');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDepositSubmit = async (e) => {
    e.preventDefault();
    if (!depositAmount || Number(depositAmount) <= 0) return alert('Enter valid amount');

    setActionLoading(true);
    try {
      const res = await API.post(`/goals/${depositGoal._id}/deposit`, { amount: Number(depositAmount) });
      if (res.data.badgeAwarded) {
        // Trigger celebratory confetti animation!
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        });
      }
      setDepositGoal(null);
      setDepositAmount('');
      fetchGoals();
    } catch (err) {
      alert(err.response?.data?.message || 'Deposit failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setActionLoading(true);
    try {
      await API.delete(`/goals/${deletingId}`);
      setDeletingId(null);
      fetchGoals();
    } catch (err) {
      alert('Failed to delete goal');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Auditing savings targets..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Savings Goals & Gamification
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Turn life dreams into tangible milestones with automated contribution pacing
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={PlusCircle}
          onClick={() => setIsCreateModalOpen(true)}
        >
          New Savings Goal
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Target Reserves"
          value={formatAmount(totalTarget)}
          subtitle={`${goals.length} active milestones`}
          icon={Target}
          color="emerald"
        />
        <StatCard
          title="Total Accumulated Savings"
          value={formatAmount(totalSaved)}
          subtitle={`${overallProgress}% accomplished`}
          icon={Trophy}
          color="blue"
        />
        <StatCard
          title="Remaining to Milestone"
          value={formatAmount(Math.max(0, totalTarget - totalSaved))}
          subtitle="Across all target dates"
          icon={Sparkles}
          color="purple"
        />
      </div>

      {/* Goals Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {goals.map((g) => {
          const isDone = g.isCompleted || g.percentage >= 100;

          return (
            <div
              key={g._id}
              className={`p-6 rounded-2xl bg-white dark:bg-dark-900 border transition-all ${
                isDone
                  ? 'border-emerald-500/50 shadow-sm shadow-emerald-500/10'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div
                    className="w-10 h-10 rounded-xl flex items-center justify-center text-white shadow-sm"
                    style={{ backgroundColor: g.color || '#10B981' }}
                  >
                    <Target className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                      {g.category}
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white">
                      {g.title}
                    </h3>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {isDone && (
                    <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-1 rounded-full bg-emerald-500/10 text-emerald-500 border border-emerald-500/20">
                      <Trophy className="w-3.5 h-3.5" /> Reached!
                    </span>
                  )}
                  <button
                    onClick={() => setDeletingId(g._id)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Progress */}
              <div className="mt-5 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-emerald-600 dark:text-emerald-400">
                    Saved: {formatAmount(g.currentAmount)}
                  </span>
                  <span className="text-slate-500">
                    Target: {formatAmount(g.targetAmount)}
                  </span>
                </div>
                <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-700"
                    style={{
                      width: `${Math.min(100, g.percentage)}%`,
                      backgroundColor: g.color || '#10B981',
                    }}
                  />
                </div>
              </div>

              {/* Sub Metrics */}
              <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800/80 grid grid-cols-2 sm:grid-cols-3 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 block text-[10px]">Remaining</span>
                  <span className="font-bold text-slate-800 dark:text-slate-200">
                    {formatAmount(g.remaining)}
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[10px]">Deadline</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    {new Date(g.targetDate).toLocaleDateString()}
                  </span>
                </div>
                <div className="col-span-2 sm:col-span-1">
                  <span className="text-slate-400 block text-[10px]">Recommended Pacing</span>
                  <span className="font-bold text-emerald-500">
                    {g.recommendedMonthlySaving > 0 ? `${formatAmount(g.recommendedMonthlySaving)}/mo` : 'Done!'}
                  </span>
                </div>
              </div>

              {/* Deposit Action Button */}
              {!isDone && (
                <div className="mt-5">
                  <Button
                    variant="outline"
                    size="sm"
                    icon={ArrowUpRight}
                    className="w-full text-xs"
                    onClick={() => {
                      setDepositGoal(g);
                      setDepositAmount('');
                    }}
                  >
                    Contribute Funds to Goal
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Create Goal */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Create Savings Milestone"
        subtitle="Set a target and deadline to begin tracking"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreateGoal} className="space-y-4">
          <Input
            label="Goal Title"
            placeholder="e.g. Vacation to Japan, Emergency Cushion"
            value={formData.title}
            onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Target Amount"
              type="number"
              min="10"
              placeholder="5000"
              value={formData.targetAmount}
              onChange={(e) => setFormData((p) => ({ ...p, targetAmount: e.target.value }))}
              icon={DollarSign}
              required
            />
            <Input
              label="Initial Deposit"
              type="number"
              min="0"
              placeholder="0"
              value={formData.currentAmount}
              onChange={(e) => setFormData((p) => ({ ...p, currentAmount: e.target.value }))}
              icon={DollarSign}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Select
              label="Category"
              value={formData.category}
              onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
              options={GOAL_CATEGORIES}
            />
            <Input
              label="Target Deadline Date"
              type="date"
              value={formData.targetDate}
              onChange={(e) => setFormData((p) => ({ ...p, targetDate: e.target.value }))}
              icon={Calendar}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Establish Goal
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Deposit Funds */}
      <Modal
        isOpen={!!depositGoal}
        onClose={() => setDepositGoal(null)}
        title={`Contribute to ${depositGoal?.title}`}
        subtitle={`Target: ${depositGoal ? formatAmount(depositGoal.targetAmount) : ''}`}
        maxWidth="max-w-sm"
      >
        <form onSubmit={handleDepositSubmit} className="space-y-4">
          <Input
            label="Contribution Amount"
            type="number"
            min="1"
            step="1"
            placeholder="e.g. 250"
            value={depositAmount}
            onChange={(e) => setDepositAmount(e.target.value)}
            icon={DollarSign}
            required
            autoFocus
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setDepositGoal(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Deposit Funds
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Savings Milestone"
        message="Are you sure you want to remove this savings goal?"
        isLoading={actionLoading}
      />
    </div>
  );
};

export default GoalsPage;
