import React, { useState } from 'react';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import {
  User,
  Mail,
  DollarSign,
  Globe,
  Bell,
  Sun,
  Moon,
  CheckCircle,
  Shield,
  Smartphone,
} from 'lucide-react';

const ProfilePage = () => {
  const { user, updateUserState } = useAuth();
  const { currency, setCurrency, allCurrencies, formatAmount } = useCurrency();
  const { theme, toggleTheme } = useTheme();

  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
    phone: user?.phone || '',
    avatar: user?.avatar || '',
    monthlyIncome: user?.monthlyIncome || 5000,
    currency: user?.currency || currency || 'USD',
    notificationsEnabled: user?.notificationsEnabled !== undefined ? user.notificationsEnabled : true,
  });

  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await API.put('/users/profile', formData);
      updateUserState(res.data.user);
      setCurrency(formData.currency);
      setMessage('Profile settings updated successfully!');
      setTimeout(() => setMessage(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Account Profile & System Settings
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          Configure multi-currency display, notification triggers, and baseline income
        </p>
      </div>

      {message && (
        <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
          <CheckCircle className="w-4 h-4" />
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Profile Details Card */}
        <Card title="Personal Information" subtitle="Your display profile">
          <div className="space-y-4">
            <div className="flex items-center gap-4 pb-4 border-b border-slate-100 dark:border-slate-800">
              <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-extrabold text-2xl overflow-hidden border border-emerald-500/20">
                {formData.avatar ? (
                  <img src={formData.avatar} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  formData.name?.charAt(0) || 'U'
                )}
              </div>
              <div className="flex-1">
                <Input
                  label="Avatar Image URL (Optional)"
                  placeholder="https://images.unsplash.com/..."
                  value={formData.avatar}
                  onChange={(e) => setFormData((p) => ({ ...p, avatar: e.target.value }))}
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
                icon={User}
                required
              />

              <Input
                label="Email Address"
                value={formData.email}
                disabled
                icon={Mail}
                helperText="Email cannot be changed directly"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Phone Number"
                placeholder="+1 (555) 000-0000"
                value={formData.phone}
                onChange={(e) => setFormData((p) => ({ ...p, phone: e.target.value }))}
                icon={Smartphone}
              />
              <Input
                label="Bio / Philosophy"
                placeholder="e.g. Striving for early financial independence"
                value={formData.bio}
                onChange={(e) => setFormData((p) => ({ ...p, bio: e.target.value }))}
              />
            </div>
          </div>
        </Card>

        {/* Financial Preferences Card */}
        <Card title="Financial Configuration" subtitle="Currency and baseline benchmarks">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Select
              label="Primary Display Currency"
              value={formData.currency}
              onChange={(e) => setFormData((p) => ({ ...p, currency: e.target.value }))}
              options={Object.values(allCurrencies).map((c) => ({
                value: c.code,
                label: `${c.label} (${c.symbol})`,
              }))}
            />

            <Input
              label="Baseline Monthly Expected Income"
              type="number"
              min="0"
              step="100"
              value={formData.monthlyIncome}
              onChange={(e) => setFormData((p) => ({ ...p, monthlyIncome: e.target.value }))}
              icon={DollarSign}
              helperText="Used to benchmark monthly savings rate if no salary logged"
              required
            />
          </div>
        </Card>

        {/* System Preferences Card */}
        <Card title="System & Alerts" subtitle="Control theme and notification triggers">
          <div className="space-y-4">
            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  Budget Threshold & Due Date Alerts
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Notify me when spending exceeds 80% or upcoming bills are due
                </span>
              </div>
              <input
                type="checkbox"
                checked={formData.notificationsEnabled}
                onChange={(e) => setFormData((p) => ({ ...p, notificationsEnabled: e.target.checked }))}
                className="w-4 h-4 text-emerald-500 rounded"
              />
            </div>

            <div className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-slate-800">
              <div>
                <span className="text-xs font-semibold text-slate-900 dark:text-white block">
                  Interface Theme
                </span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400">
                  Current: {theme === 'dark' ? 'Dark Modern Mode' : 'Light Clean Mode'}
                </span>
              </div>
              <Button variant="secondary" size="sm" onClick={toggleTheme}>
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 mr-1" /> : <Moon className="w-3.5 h-3.5 mr-1" />}
                Toggle Theme
              </Button>
            </div>
          </div>
        </Card>

        <div className="flex justify-end">
          <Button variant="primary" type="submit" isLoading={loading}>
            Save All Settings
          </Button>
        </div>
      </form>
    </div>
  );
};

export default ProfilePage;
