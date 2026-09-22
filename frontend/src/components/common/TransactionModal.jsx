import React, { useState, useEffect } from 'react';
import Modal from './Modal';
import Input from './Input';
import Select from './Select';
import Button from './Button';
import { Mic, Scan, DollarSign, Calendar, Tag, Smile } from 'lucide-react';
import VoiceExpenseModal from '../smart/VoiceExpenseModal';
import ReceiptScannerModal from '../smart/ReceiptScannerModal';

const CATEGORIES = {
  income: [
    { value: 'Salary', label: 'Salary' },
    { value: 'Freelance', label: 'Freelance & Consulting' },
    { value: 'Business', label: 'Business' },
    { value: 'Investment', label: 'Investment & Dividends' },
    { value: 'Gift', label: 'Gift' },
    { value: 'Other', label: 'Other' },
  ],
  expense: [
    { value: 'Housing & Rent', label: 'Housing & Rent' },
    { value: 'Groceries', label: 'Groceries' },
    { value: 'Dining Out', label: 'Dining Out & Cafes' },
    { value: 'Transportation', label: 'Transportation & Fuel' },
    { value: 'Utilities', label: 'Utilities & Bills' },
    { value: 'Entertainment', label: 'Entertainment' },
    { value: 'Shopping', label: 'Shopping & Gadgets' },
    { value: 'Healthcare', label: 'Healthcare & Fitness' },
    { value: 'Subscriptions', label: 'Subscriptions' },
    { value: 'Other', label: 'Other' },
  ],
};

const PAYMENT_METHODS = [
  { value: 'card', label: 'Credit / Debit Card' },
  { value: 'cash', label: 'Cash' },
  { value: 'upi', label: 'UPI / Digital Payment' },
  { value: 'wallet', label: 'Digital Wallet' },
  { value: 'bank_transfer', label: 'Bank Transfer' },
  { value: 'other', label: 'Other' },
];

const MOODS = [
  { value: 'happy', label: '😊 Happy' },
  { value: 'neutral', label: '😐 Neutral' },
  { value: 'necessary', label: '✅ Necessary' },
  { value: 'stressed', label: '😓 Stressed' },
  { value: 'impulsive', label: '⚡ Impulsive' },
  { value: 'regretful', label: '😔 Regretful' },
];

const TransactionModal = ({
  isOpen,
  onClose,
  onSubmit,
  initialData = null,
  isLoading = false,
}) => {
  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    type: 'expense',
    category: 'Groceries',
    paymentMethod: 'card',
    mood: 'necessary',
    date: new Date().toISOString().split('T')[0],
    isRecurring: false,
    recurringFrequency: 'none',
    note: '',
    receiptUrl: '',
  });

  const [voiceModalOpen, setVoiceModalOpen] = useState(false);
  const [scannerModalOpen, setScannerModalOpen] = useState(false);
  const [errors, setErrors] = useState({});

  useEffect(() => {
    if (initialData) {
      setFormData({
        title: initialData.title || '',
        amount: initialData.amount || '',
        type: initialData.type || 'expense',
        category: initialData.category || 'Groceries',
        paymentMethod: initialData.paymentMethod || 'card',
        mood: initialData.mood || 'necessary',
        date: initialData.date ? new Date(initialData.date).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
        isRecurring: Boolean(initialData.isRecurring),
        recurringFrequency: initialData.recurringFrequency || 'none',
        note: initialData.note || '',
        receiptUrl: initialData.receiptUrl || '',
      });
    } else {
      setFormData({
        title: '',
        amount: '',
        type: 'expense',
        category: 'Groceries',
        paymentMethod: 'card',
        mood: 'necessary',
        date: new Date().toISOString().split('T')[0],
        isRecurring: false,
        recurringFrequency: 'none',
        note: '',
        receiptUrl: '',
      });
    }
    setErrors({});
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      ...(name === 'type' ? { category: value === 'income' ? 'Salary' : 'Groceries' } : {}),
    }));
  };

  const handleSmartParsed = (parsed) => {
    setFormData((prev) => ({
      ...prev,
      title: parsed.title || prev.title,
      amount: parsed.amount || prev.amount,
      type: parsed.type || prev.type,
      category: parsed.category || prev.category,
      paymentMethod: parsed.paymentMethod || prev.paymentMethod,
      date: parsed.date || prev.date,
      mood: parsed.mood || prev.mood,
      note: parsed.note || prev.note,
      receiptUrl: parsed.receiptUrl || prev.receiptUrl,
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const newErrors = {};
    if (!formData.title.trim()) newErrors.title = 'Title is required';
    if (!formData.amount || Number(formData.amount) <= 0) newErrors.amount = 'Valid amount is required';
    if (!formData.category) newErrors.category = 'Category is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      ...formData,
      amount: Number(formData.amount),
    });
  };

  return (
    <>
      <Modal
        isOpen={isOpen}
        onClose={onClose}
        title={initialData ? 'Edit Transaction' : 'Record New Transaction'}
        subtitle={initialData ? 'Modify transaction details' : 'Log your income or expense with smart helpers'}
        maxWidth="max-w-xl"
      >
        {/* Quick Smart Actions Bar */}
        {!initialData && (
          <div className="flex items-center gap-2 mb-4 p-2.5 rounded-xl bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400 font-medium">Smart Input:</span>
            <button
              type="button"
              onClick={() => setVoiceModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-500/20 font-semibold cursor-pointer transition"
            >
              <Mic className="w-3.5 h-3.5" /> Speak
            </button>
            <button
              type="button"
              onClick={() => setScannerModalOpen(true)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 hover:bg-blue-500/20 font-semibold cursor-pointer transition"
            >
              <Scan className="w-3.5 h-3.5" /> Scan Receipt
            </button>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Type Toggle Tabs */}
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-100 dark:bg-dark-850 rounded-xl">
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, type: 'expense', category: 'Groceries' }))}
              className={`py-2 text-xs font-bold rounded-lg transition ${
                formData.type === 'expense'
                  ? 'bg-rose-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Expense (-)
            </button>
            <button
              type="button"
              onClick={() => setFormData((p) => ({ ...p, type: 'income', category: 'Salary' }))}
              className={`py-2 text-xs font-bold rounded-lg transition ${
                formData.type === 'income'
                  ? 'bg-emerald-500 text-white shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
              }`}
            >
              Income (+)
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Transaction Title"
              placeholder="e.g. Grocery Shopping, Tech Salary"
              name="title"
              value={formData.title}
              onChange={handleChange}
              error={errors.title}
              required
            />

            <Input
              label="Amount"
              type="number"
              step="0.01"
              min="0.01"
              placeholder="0.00"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              icon={DollarSign}
              error={errors.amount}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Category"
              name="category"
              value={formData.category}
              onChange={handleChange}
              options={CATEGORIES[formData.type] || []}
              error={errors.category}
            />

            <Select
              label="Payment Method"
              name="paymentMethod"
              value={formData.paymentMethod}
              onChange={handleChange}
              options={PAYMENT_METHODS}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Date"
              type="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              icon={Calendar}
            />

            <Select
              label="Spending Mood Context"
              name="mood"
              value={formData.mood}
              onChange={handleChange}
              options={MOODS}
            />
          </div>

          <Input
            label="Notes / Description (Optional)"
            placeholder="Add tags, items purchased, or context..."
            name="note"
            value={formData.note}
            onChange={handleChange}
          />

          {/* Recurring Toggle */}
          <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                Recurring Transaction
              </span>
              <span className="text-[11px] text-slate-500 dark:text-slate-400">
                Automatically repeats periodically
              </span>
            </div>
            <input
              type="checkbox"
              name="isRecurring"
              checked={formData.isRecurring}
              onChange={handleChange}
              className="w-4 h-4 text-emerald-500 rounded border-slate-300 focus:ring-emerald-500"
            />
          </div>

          {formData.isRecurring && (
            <Select
              label="Repeat Frequency"
              name="recurringFrequency"
              value={formData.recurringFrequency}
              onChange={handleChange}
              options={[
                { value: 'daily', label: 'Daily' },
                { value: 'weekly', label: 'Weekly' },
                { value: 'monthly', label: 'Monthly' },
                { value: 'yearly', label: 'Yearly' },
              ]}
            />
          )}

          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={onClose} disabled={isLoading}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={isLoading}>
              {initialData ? 'Save Changes' : 'Save Transaction'}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Voice entry modal */}
      <VoiceExpenseModal
        isOpen={voiceModalOpen}
        onClose={() => setVoiceModalOpen(false)}
        onParsed={handleSmartParsed}
      />

      {/* OCR receipt scanner modal */}
      <ReceiptScannerModal
        isOpen={scannerModalOpen}
        onClose={() => setScannerModalOpen(false)}
        onParsed={handleSmartParsed}
      />
    </>
  );
};

export default TransactionModal;
