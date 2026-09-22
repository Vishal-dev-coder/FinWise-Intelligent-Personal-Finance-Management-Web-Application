import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Badge from '../components/common/Badge';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { MessageSquare, Send, CheckCircle2, Clock, Shield } from 'lucide-react';

const CATEGORIES = [
  { value: 'General Feedback', label: 'General Feedback' },
  { value: 'Feature Request', label: 'Feature Request' },
  { value: 'Bug Report', label: 'Bug Report' },
  { value: 'UI/UX Improvement', label: 'UI/UX Improvement' },
  { value: 'Complaint', label: 'Complaint' },
];

const FeedbackPage = () => {
  const { isAdmin } = useAuth();
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState('');

  const [formData, setFormData] = useState({
    subject: '',
    category: 'General Feedback',
    message: '',
    rating: 5,
  });

  const fetchFeedback = async () => {
    setLoading(true);
    try {
      const endpoint = isAdmin ? '/feedback/all' : '/feedback/my';
      const res = await API.get(endpoint);
      setTickets(res.data.data);
    } catch (err) {
      console.error('Failed to load feedback tickets', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchFeedback();
  }, [isAdmin]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    setMessage('');
    try {
      await API.post('/feedback', formData);
      setMessage('Thank you! Your feedback ticket has been dispatched to engineering & support.');
      setFormData({
        subject: '',
        category: 'General Feedback',
        message: '',
        rating: 5,
      });
      fetchFeedback();
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Submission failed');
    } finally {
      setSubmitting(false);
    }
  };

  const handleAdminStatusChange = async (id, status, adminResponse) => {
    try {
      await API.patch(`/feedback/${id}/status`, { status, adminResponse });
      fetchFeedback();
    } catch (err) {
      alert('Failed to update ticket status');
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <span>User Feedback & Support Desk</span>
          {isAdmin && (
            <span className="text-xs px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-bold border border-purple-500/20">
              Admin Moderation View
            </span>
          )}
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Submit feature ideas, issue tickets, or inspect platform development responses
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4" />
          {message}
        </div>
      )}

      {/* Ticket Submission Form */}
      <Card title="Open a Feedback or Support Ticket" subtitle="We review incoming user feedback daily">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Subject"
              placeholder="e.g. Request for live stock ticker integration"
              value={formData.subject}
              onChange={(e) => setFormData((p) => ({ ...p, subject: e.target.value }))}
              required
            />

            <Select
              label="Feedback Category"
              value={formData.category}
              onChange={(e) => setFormData((p) => ({ ...p, category: e.target.value }))}
              options={CATEGORIES}
            />
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1.5">
              Detailed Description
            </label>
            <textarea
              rows={4}
              placeholder="Explain your thought, the steps to reproduce a bug, or feature rationale..."
              value={formData.message}
              onChange={(e) => setFormData((p) => ({ ...p, message: e.target.value }))}
              className="w-full rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-dark-850 p-3 text-xs text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
              required
            />
          </div>

          <div className="flex items-center justify-between pt-2">
            <div className="flex items-center gap-2 text-xs">
              <span className="text-slate-500">Platform Experience Rating:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setFormData((p) => ({ ...p, rating: star }))}
                    className={`text-sm cursor-pointer ${formData.rating >= star ? 'text-amber-400' : 'text-slate-300 dark:text-slate-700'}`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>

            <Button type="submit" variant="primary" size="sm" icon={Send} isLoading={submitting}>
              Submit Ticket
            </Button>
          </div>
        </form>
      </Card>

      {/* Existing Tickets List */}
      <Card
        title={isAdmin ? "All Platform User Tickets" : "Your Ticket History"}
        subtitle={`${tickets.length} total tickets on record`}
      >
        {loading ? (
          <LoadingSpinner message="Retrieving tickets..." />
        ) : tickets.length === 0 ? (
          <p className="text-xs text-slate-400 text-center py-6">No feedback tickets logged yet.</p>
        ) : (
          <div className="space-y-3">
            {tickets.map((t) => (
              <div
                key={t._id}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-slate-800 space-y-2"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                        {t.subject}
                      </h4>
                      <Badge
                        variant={
                          t.status === 'resolved'
                            ? 'success'
                            : t.status === 'in_review'
                            ? 'warning'
                            : 'neutral'
                        }
                        size="sm"
                      >
                        {t.status}
                      </Badge>
                    </div>
                    <span className="text-[10px] text-slate-400">
                      {t.category} • {new Date(t.createdAt).toLocaleDateString()}
                      {t.user?.email && ` • by ${t.user.email}`}
                    </span>
                  </div>
                  <span className="text-amber-400 text-xs font-bold">
                    {'★'.repeat(t.rating)}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {t.message}
                </p>

                {/* Admin response if exists */}
                {t.adminResponse && (
                  <div className="p-3 rounded-xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-800 dark:text-emerald-300">
                    <span className="font-bold flex items-center gap-1 mb-0.5">
                      <Shield className="w-3 h-3" /> FinWise Engineering Response:
                    </span>
                    <p className="text-[11px]">{t.adminResponse}</p>
                  </div>
                )}

                {/* Admin moderation inline tools */}
                {isAdmin && (
                  <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex items-center gap-2">
                    <span className="text-[11px] font-semibold text-slate-400">Admin Actions:</span>
                    <button
                      onClick={() => handleAdminStatusChange(t._id, 'in_review', t.adminResponse || 'Ticket under active investigation')}
                      className="px-2 py-0.5 rounded text-[10px] bg-amber-500/10 text-amber-500 hover:bg-amber-500/20 font-semibold"
                    >
                      Set In Review
                    </button>
                    <button
                      onClick={() => handleAdminStatusChange(t._id, 'resolved', t.adminResponse || 'Resolution deployed and verified by team.')}
                      className="px-2 py-0.5 rounded text-[10px] bg-emerald-500/10 text-emerald-500 hover:bg-emerald-500/20 font-semibold"
                    >
                      Mark Resolved
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </Card>
    </div>
  );
};

export default FeedbackPage;
