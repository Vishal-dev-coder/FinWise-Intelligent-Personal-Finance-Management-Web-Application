import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Modal from '../../components/common/Modal';
import ConfirmModal from '../../components/common/ConfirmModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Lightbulb, PlusCircle, Trash2, Clock, CheckCircle } from 'lucide-react';

const TIP_CATEGORIES = [
  { value: 'Budgeting', label: 'Budgeting & Allocation' },
  { value: 'Saving', label: 'Emergency Savings' },
  { value: 'Investing', label: 'Investing & Index Funds' },
  { value: 'Debt Management', label: 'Debt Elimination' },
  { value: 'Psychology of Money', label: 'Money Psychology' },
  { value: 'Smart Shopping', label: 'Smart Shopping & Subscriptions' },
];

const AdminTipsPage = () => {
  const [tips, setTips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deletingId, setDeletingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    title: '',
    category: 'Budgeting',
    content: '',
    actionableAdvice: '',
    readingTimeMinutes: 3,
    isFeatured: false,
  });

  const fetchTips = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/tips');
      setTips(res.data.data);
    } catch (err) {
      console.error('Failed to load tips', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTips();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      await API.post('/admin/tips', formData);
      setIsModalOpen(false);
      setFormData({
        title: '',
        category: 'Budgeting',
        content: '',
        actionableAdvice: '',
        readingTimeMinutes: 3,
        isFeatured: false,
      });
      fetchTips();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to publish financial tip');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setActionLoading(true);
    try {
      await API.delete(`/admin/tips/${deletingId}`);
      setDeletingId(null);
      fetchTips();
    } catch (err) {
      alert('Failed to delete tip');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Fetching financial advisory tips..." />;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Lightbulb className="w-6 h-6 text-amber-400" />
            <span>Financial Tips & Education CMS</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Curate financial literacy cards and actionable guidelines displayed across user portals
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={PlusCircle}
          onClick={() => setIsModalOpen(true)}
        >
          Publish New Tip
        </Button>
      </div>

      {/* Tips Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {tips.map((tip) => (
          <div
            key={tip._id}
            className="p-6 rounded-2xl bg-white dark:bg-dark-900 border border-slate-200 dark:border-slate-800 flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-purple-500/10 text-purple-400 border border-purple-500/20">
                  {tip.category}
                </span>
                <button
                  onClick={() => setDeletingId(tip._id)}
                  className="p-1 text-slate-400 hover:text-rose-500"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                {tip.title}
              </h3>
              <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
                {tip.content}
              </p>

              {tip.actionableAdvice && (
                <div className="mt-4 p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
                  <span className="font-bold block mb-0.5">Actionable Takeaway:</span>
                  <p className="text-[11px] leading-relaxed">{tip.actionableAdvice}</p>
                </div>
              )}
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span className="flex items-center gap-1">
                <Clock className="w-3.5 h-3.5" /> {tip.readingTimeMinutes} min read
              </span>
              <span>By {tip.author}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Modal: Publish Tip */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Publish Educational Financial Tip"
        subtitle="Shared with all platform users"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Tip Title"
            placeholder="e.g. The 24-Hour Rule for Impulsive Buys"
            value={formData.title}
            onChange={(e) => setFormData((p) => ({ ...p, title: e.target.value }))}
            required
          />

          <Select
            label="Category"
            value={formData.category}
            onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
            options={TIP_CATEGORIES}
          />

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Article Content / Explanation
            </label>
            <textarea
              rows={4}
              placeholder="Explain the concept in clear, concise language..."
              value={formData.content}
              onChange={(e) => setFormData((p) => ({ ...p, content: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-dark-850 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>

          <Input
            label="Actionable Step"
            placeholder="e.g. Pause for 24h on purchases over $50"
            value={formData.actionableAdvice}
            onChange={(e) => setFormData((p) => ({ ...p, actionableAdvice: e.target.value }))}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Publish Tip
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Financial Advisory Tip"
        message="Are you sure you want to remove this tip from the platform?"
        isLoading={actionLoading}
      />
    </div>
  );
};

export default AdminTipsPage;
