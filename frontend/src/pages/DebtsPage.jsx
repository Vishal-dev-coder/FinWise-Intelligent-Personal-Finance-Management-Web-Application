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
  CreditCard,
  PlusCircle,
  Zap,
  TrendingDown,
  Calendar,
  DollarSign,
  Trash2,
  CheckCircle,
  Percent,
} from 'lucide-react';

const DEBT_TYPES = [
  { value: 'personal_loan', label: 'Personal Loan' },
  { value: 'car_loan', label: 'Car Loan / Auto Financing' },
  { value: 'student_loan', label: 'Student Loan' },
  { value: 'credit_card', label: 'Credit Card Balance' },
  { value: 'mortgage', label: 'Mortgage / Home Loan' },
  { value: 'other', label: 'Other Liability' },
];

const DebtsPage = () => {
  const { formatAmount } = useCurrency();
  const [debts, setDebts] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [payDebt, setPayDebt] = useState(null);
  const [payAmount, setPayAmount] = useState('');
  const [payNote, setPayNote] = useState('');
  const [deletingId, setDeletingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    lender: '',
    debtType: 'personal_loan',
    principalAmount: '',
    remainingBalance: '',
    interestRate: '',
    monthlyEmi: '',
    dueDateDay: 5,
  });

  const fetchDebts = async () => {
    setLoading(true);
    try {
      const res = await API.get('/debts');
      setDebts(res.data.data);
      setSummary(res.data.summary);
    } catch (err) {
      console.error('Failed to load debts', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDebts();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await API.post('/debts', formData);
      setIsCreateModalOpen(false);
      setFormData({
        title: '',
        lender: '',
        debtType: 'personal_loan',
        principalAmount: '',
        remainingBalance: '',
        interestRate: '',
        monthlyEmi: '',
        dueDateDay: 5,
      });
      fetchDebts();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to add debt liability');
    } finally {
      setActionLoading(false);
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    if (!payAmount || Number(payAmount) <= 0) return alert('Enter valid payment amount');

    setActionLoading(true);
    try {
      await API.post(`/debts/${payDebt._id}/pay`, {
        amount: Number(payAmount),
        note: payNote || 'Monthly EMI Payment',
      });
      setPayDebt(null);
      setPayAmount('');
      setPayNote('');
      fetchDebts();
    } catch (err) {
      alert(err.response?.data?.message || 'Payment recording failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setActionLoading(true);
    try {
      await API.delete(`/debts/${deletingId}`);
      setDeletingId(null);
      fetchDebts();
    } catch (err) {
      alert('Failed to delete debt record');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Analyzing debt obligations and amortization..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Debt & Loan Elimination
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Track principal balances, monthly EMIs, and payoff acceleration strategies
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={PlusCircle}
          onClick={() => setIsCreateModalOpen(true)}
        >
          Add Debt Liability
        </Button>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard
          title="Total Outstanding Debt"
          value={formatAmount(summary?.totalDebt || 0)}
          subtitle={`${summary?.activeDebtsCount || 0} active loans`}
          icon={CreditCard}
          color="rose"
        />
        <StatCard
          title="Total Monthly EMI Obligation"
          value={formatAmount(summary?.monthlyEmiTotal || 0)}
          subtitle="Fixed monthly outgoing burden"
          icon={Calendar}
          color="amber"
        />
        <StatCard
          title="Original Principal Pool"
          value={formatAmount(summary?.totalPrincipal || 0)}
          subtitle={`Paid off ${formatAmount((summary?.totalPrincipal || 0) - (summary?.totalDebt || 0))}`}
          icon={CheckCircle}
          color="emerald"
        />
      </div>

      {/* Debts Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {debts.map((d) => {
          const isPaidOff = d.status === 'paid_off' || d.remainingBalance <= 0;

          return (
            <div
              key={d._id}
              className={`p-6 rounded-2xl bg-white dark:bg-dark-900 border transition-all ${
                isPaidOff
                  ? 'border-emerald-500/40 bg-emerald-500/5'
                  : 'border-slate-200 dark:border-slate-800'
              }`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    {d.lender} • {d.debtType?.replace('_', ' ')}
                  </span>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white mt-0.5">
                    {d.title}
                  </h3>
                </div>
                <div className="flex items-center gap-1">
                  {isPaidOff ? (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500">
                      Settled!
                    </span>
                  ) : (
                    <button
                      onClick={() => setDeletingId(d._id)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>

              {/* Progress */}
              <div className="mt-4 space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-600 dark:text-slate-400">
                    Balance: {formatAmount(d.remainingBalance)}
                  </span>
                  <span className="text-slate-500">
                    Principal: {formatAmount(d.principalAmount)}
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-emerald-500 transition-all duration-500"
                    style={{ width: `${d.progressPercent}%` }}
                  />
                </div>
                <span className="text-[10px] text-right block text-slate-400 font-medium">
                  {d.progressPercent}% Paid off
                </span>
              </div>

              {/* Metrics Grid */}
              <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-slate-400 text-[10px] block">Interest Rate</span>
                  <span className="font-bold text-rose-500">{d.interestRate}% APR</span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Monthly EMI</span>
                  <span className="font-bold text-slate-900 dark:text-white">
                    {formatAmount(d.monthlyEmi)}/mo
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">EMI Due Date</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    Day {d.dueDateDay} of month
                  </span>
                </div>
                <div>
                  <span className="text-slate-400 text-[10px] block">Est. Payoff</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">
                    ~{d.estimatedPayoffMonths} Months
                  </span>
                </div>
              </div>

              {/* Faster Repayment Suggestion Card */}
              {!isPaidOff && (
                <div className="mt-4 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs">
                  <span className="text-amber-800 dark:text-amber-300 font-bold flex items-center gap-1">
                    <Zap className="w-3.5 h-3.5 text-amber-500" /> Acceleration Hack
                  </span>
                  <p className="text-[11px] text-slate-600 dark:text-slate-400 mt-1">
                    Pay <strong>{formatAmount(d.monthlyEmi * 1.15)}</strong> (+15%) to be debt-free <strong>{d.monthsSavedWithBonus} months earlier</strong>!
                  </p>
                </div>
              )}

              {/* Make Payment Action */}
              {!isPaidOff && (
                <div className="mt-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="w-full text-xs"
                    onClick={() => {
                      setPayDebt(d);
                      setPayAmount(d.monthlyEmi);
                    }}
                  >
                    Log Repayment / EMI
                  </Button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Modal: Add Debt */}
      <Modal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        title="Add Loan or Liability"
        subtitle="Track personal loans, car loans, or cards"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Loan / Debt Name"
            placeholder="e.g. Mazda CX-30 Car Loan"
            value={formData.title}
            onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Lender / Bank"
              placeholder="e.g. Chase, Wells Fargo"
              value={formData.lender}
              onChange={(e) => setFormData((p) => ({ ...p, lender: e.target.value }))}
              required
            />
            <Select
              label="Liability Type"
              value={formData.debtType}
              onChange={(e) => setFormData((p) => ({ ...p, debtType: e.target.value }))}
              options={DEBT_TYPES}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Principal Amount"
              type="number"
              min="1"
              placeholder="10000"
              value={formData.principalAmount}
              onChange={(e) => setFormData((p) => ({ ...p, principalAmount: e.target.value, remainingBalance: e.target.value }))}
              icon={DollarSign}
              required
            />
            <Input
              label="Annual Interest %"
              type="number"
              step="0.1"
              placeholder="5.5"
              value={formData.interestRate}
              onChange={(e) => setFormData((p) => ({ ...p, interestRate: e.target.value }))}
              icon={Percent}
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Monthly EMI"
              type="number"
              min="1"
              placeholder="350"
              value={formData.monthlyEmi}
              onChange={(e) => setFormData((p) => ({ ...p, monthlyEmi: e.target.value }))}
              icon={DollarSign}
              required
            />
            <Input
              label="Due Day of Month"
              type="number"
              min="1"
              max="31"
              value={formData.dueDateDay}
              onChange={(e) => setFormData((p) => ({ ...p, dueDateDay: e.target.value }))}
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setIsCreateModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Save Liability
            </Button>
          </div>
        </form>
      </Modal>

      {/* Modal: Pay Debt */}
      <Modal
        isOpen={!!payDebt}
        onClose={() => setPayDebt(null)}
        title={`Log Repayment for ${payDebt?.title}`}
        subtitle={`Current remaining balance: ${payDebt ? formatAmount(payDebt.remainingBalance) : ''}`}
        maxWidth="max-w-sm"
      >
        <form onSubmit={handlePayment} className="space-y-4">
          <Input
            label="Payment Amount"
            type="number"
            min="1"
            step="1"
            value={payAmount}
            onChange={(e) => setPayAmount(e.target.value)}
            icon={DollarSign}
            required
            autoFocus
          />

          <Input
            label="Note"
            placeholder="e.g. Regular monthly EMI"
            value={payNote}
            onChange={(e) => setPayNote(e.target.value)}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setPayDebt(null)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Record Payment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Debt Record"
        message="Are you sure you want to remove this loan record?"
        isLoading={actionLoading}
      />
    </div>
  );
};

export default DebtsPage;
