import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import API from '../../services/api';
import { useCurrency } from '../../context/CurrencyContext';
import StatCard from '../../components/common/StatCard';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Badge from '../../components/common/Badge';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import {
  Users,
  CreditCard,
  Target,
  DollarSign,
  Shield,
  MessageSquare,
  Activity,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';

const AdminDashboardPage = () => {
  const { formatAmount } = useCurrency();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminStats = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/stats');
      setStats(res.data.data);
    } catch (err) {
      console.error('Failed to load admin stats', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminStats();
  }, []);

  if (loading) return <LoadingSpinner fullPage message="Fetching administrative metrics and audit records..." />;
  if (!stats) return null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <ShieldAlert className="w-6 h-6 text-purple-500" />
            <span>Administrator Control Center</span>
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            System-wide health, user verification, volume throughput, and compliance logs
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/users">
            <Button variant="secondary" size="sm" icon={Users}>
              Manage Users
            </Button>
          </Link>
          <Link to="/admin/tips">
            <Button variant="primary" size="sm">
              Tips CMS
            </Button>
          </Link>
        </div>
      </div>

      {/* KPI Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Total Registered Accounts"
          value={stats.totalUsers}
          subtitle="Platform active members"
          icon={Users}
          color="purple"
        />
        <StatCard
          title="Total System Volume"
          value={formatAmount(stats.totalSystemVolume)}
          subtitle="Processed monetary activity"
          icon={DollarSign}
          color="emerald"
        />
        <StatCard
          title="Total Transactions Logged"
          value={stats.totalTransactions}
          subtitle="All ledger entries"
          icon={CreditCard}
          color="blue"
        />
        <StatCard
          title="Pending Support Tickets"
          value={stats.feedbackPending}
          subtitle="Require administrator review"
          icon={MessageSquare}
          color="amber"
        />
      </div>

      {/* Grid: Recent Users & System Audit Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Registered Users */}
        <Card
          title="Recent Platform Registrations"
          subtitle="Latest account creations"
          action={
            <Link to="/admin/users" className="text-xs font-semibold text-purple-400 hover:underline inline-flex items-center gap-1">
              <span>View All</span>
              <ArrowRight className="w-3 h-3" />
            </Link>
          }
        >
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {stats.recentUsers?.map((u) => (
              <div key={u._id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-400 font-bold flex items-center justify-center text-xs">
                    {u.name?.charAt(0)}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">
                      {u.name}
                    </h4>
                    <p className="text-[11px] text-slate-400 truncate max-w-[180px]">{u.email}</p>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant={u.role === 'admin' ? 'purple' : 'info'} size="sm">
                    {u.role}
                  </Badge>
                  <span className="block text-[10px] text-slate-400 mt-1">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>

        {/* Audit Logs */}
        <Card
          title="System Audit & Security Logs"
          subtitle="Administrative compliance tracking"
        >
          <div className="space-y-3">
            {stats.adminLogs && stats.adminLogs.length > 0 ? (
              stats.adminLogs.map((log) => (
                <div
                  key={log._id}
                  className="p-3 rounded-xl bg-slate-50 dark:bg-dark-850 border border-slate-100 dark:border-slate-800 flex items-start justify-between gap-3 text-xs"
                >
                  <div>
                    <span className="font-bold text-purple-400 block font-mono text-[11px]">
                      {log.action}
                    </span>
                    <p className="text-slate-600 dark:text-slate-300 text-[11px] mt-0.5">
                      {log.details}
                    </p>
                  </div>
                  <span className="text-[10px] text-slate-400 whitespace-nowrap">
                    {new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-slate-400 py-6 text-center">No recent audit events.</p>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboardPage;
