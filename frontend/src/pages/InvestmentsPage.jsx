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
  LineChart as LineChartIcon,
  PlusCircle,
  TrendingUp,
  DollarSign,
  PieChart as PieChartIcon,
  Trash2,
  Edit2,
  Layers,
} from 'lucide-react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
} from 'recharts';

const ASSET_TYPES = [
  { value: 'stocks', label: 'Stocks & Equities' },
  { value: 'mutual_funds', label: 'Mutual Funds / Index ETFs' },
  { value: 'crypto', label: 'Cryptocurrency' },
  { value: 'gold', label: 'Gold / Precious Metals' },
  { value: 'real_estate', label: 'Real Estate / REITs' },
  { value: 'fixed_deposits', label: 'Fixed Deposits / Bonds' },
  { value: 'others', label: 'Other Alternative Assets' },
];

const COLORS = ['#10B981', '#3B82F6', '#8B5CF6', '#F59E0B', '#EC4899', '#06B6D4', '#64748B'];

const InvestmentsPage = () => {
  const { formatAmount } = useCurrency();
  const [investments, setInvestments] = useState([]);
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const [formData, setFormData] = useState({
    name: '',
    symbol: '',
    type: 'stocks',
    investedAmount: '',
    currentValue: '',
    units: 1,
    notes: '',
  });

  const fetchInvestments = async () => {
    setLoading(true);
    try {
      const res = await API.get('/investments');
      setInvestments(res.data.data);
      setSummary(res.data.summary);
    } catch (err) {
      console.error('Failed to load investments', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInvestments();
  }, []);

  const handleCreate = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      if (editingItem) {
        await API.put(`/investments/${editingItem._id}`, formData);
      } else {
        await API.post('/investments', formData);
      }
      setIsModalOpen(false);
      setEditingItem(null);
      fetchInvestments();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save asset');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!deletingId) return;
    setActionLoading(true);
    try {
      await API.delete(`/investments/${deletingId}`);
      setDeletingId(null);
      fetchInvestments();
    } catch (err) {
      alert('Failed to delete asset');
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) return <LoadingSpinner fullPage message="Valuating asset holdings and yields..." />;

  const isProfitable = (summary?.totalPnL || 0) >= 0;

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Investment Portfolio & Assets
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Monitor real-time profit/loss, asset class allocation, and long-term capital growth
          </p>
        </div>
        <Button
          variant="primary"
          size="sm"
          icon={PlusCircle}
          onClick={() => {
            setEditingItem(null);
            setFormData({
              name: '',
              symbol: '',
              type: 'stocks',
              investedAmount: '',
              currentValue: '',
              units: 1,
              notes: '',
            });
            setIsModalOpen(true);
          }}
        >
          Add Asset Holding
        </Button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
        <StatCard
          title="Total Portfolio Value"
          value={formatAmount(summary?.totalCurrentValue || 0)}
          subtitle={`${investments.length} holdings tracked`}
          icon={LineChartIcon}
          color="emerald"
        />
        <StatCard
          title="Total Capital Invested"
          value={formatAmount(summary?.totalInvested || 0)}
          subtitle="Original cost basis"
          icon={DollarSign}
          color="blue"
        />
        <StatCard
          title="Total Net Profit / Loss"
          value={`${isProfitable ? '+' : ''}${formatAmount(summary?.totalPnL || 0)}`}
          trend={isProfitable ? 'up' : 'down'}
          trendValue={`${summary?.totalROI || 0}% ROI`}
          icon={TrendingUp}
          color={isProfitable ? 'emerald' : 'rose'}
        />
        <StatCard
          title="Top Performing Asset"
          value={investments[0]?.symbol || investments[0]?.name || 'N/A'}
          subtitle={investments[0] ? `+${investments[0].roi}% ROI` : 'No holdings yet'}
          icon={Layers}
          color="purple"
        />
      </div>

      {/* Allocation Chart & Holdings Table */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card
          title="Asset Class Distribution"
          subtitle="Portfolio diversification mix"
        >
          {summary?.allocation && summary.allocation.length > 0 ? (
            <div className="h-64 w-full flex flex-col justify-between">
              <div className="h-44">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={summary.allocation}
                      cx="50%"
                      cy="50%"
                      innerRadius={45}
                      outerRadius={70}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {summary.allocation.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip
                      formatter={(val) => [formatAmount(val), 'Value']}
                      contentStyle={{ backgroundColor: '#0F172A', borderRadius: '12px', border: '1px solid #334155', color: '#fff', fontSize: '12px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-1 mt-2 text-xs">
                {summary.allocation.map((item, idx) => (
                  <div key={item.name} className="flex justify-between items-center text-[11px]">
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2 h-2 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                      <span className="text-slate-600 dark:text-slate-400 capitalize truncate">{item.name}</span>
                    </div>
                    <span className="font-semibold">{item.percent}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="h-64 flex items-center justify-center text-xs text-slate-400">
              No asset allocation recorded yet
            </div>
          )}
        </Card>

        {/* Holdings Table (2 Cols) */}
        <Card
          title="Current Asset Holdings"
          subtitle="Detailed performance by individual position"
          className="lg:col-span-2"
        >
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                  <th className="pb-3 font-semibold">Asset</th>
                  <th className="pb-3 font-semibold">Class</th>
                  <th className="pb-3 font-semibold text-right">Invested</th>
                  <th className="pb-3 font-semibold text-right">Current Value</th>
                  <th className="pb-3 font-semibold text-right">Profit / Loss</th>
                  <th className="pb-3 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {investments.map((inv) => {
                  const itemProfit = inv.pnl >= 0;
                  return (
                    <tr key={inv._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition">
                      <td className="py-3">
                        <div className="font-bold text-slate-900 dark:text-white">
                          {inv.name}
                        </div>
                        {inv.symbol && (
                          <span className="text-[10px] text-slate-400 font-mono">
                            {inv.symbol} • {inv.units} units
                          </span>
                        )}
                      </td>
                      <td className="py-3 text-slate-500 capitalize">
                        {inv.type?.replace('_', ' ')}
                      </td>
                      <td className="py-3 text-right text-slate-500 font-medium">
                        {formatAmount(inv.investedAmount)}
                      </td>
                      <td className="py-3 text-right font-bold text-slate-900 dark:text-white">
                        {formatAmount(inv.currentValue)}
                      </td>
                      <td className={`py-3 text-right font-bold ${itemProfit ? 'text-emerald-500' : 'text-rose-500'}`}>
                        {itemProfit ? '+' : ''}{formatAmount(inv.pnl)}
                        <span className="block text-[10px] font-normal">
                          ({itemProfit ? '+' : ''}{inv.roi}%)
                        </span>
                      </td>
                      <td className="py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => {
                              setEditingItem(inv);
                              setFormData({
                                name: inv.name,
                                symbol: inv.symbol,
                                type: inv.type,
                                investedAmount: inv.investedAmount,
                                currentValue: inv.currentValue,
                                units: inv.units || 1,
                                notes: inv.notes || '',
                              });
                              setIsModalOpen(true);
                            }}
                            className="p-1 text-slate-400 hover:text-slate-200"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => setDeletingId(inv._id)}
                            className="p-1 text-slate-400 hover:text-rose-500"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </Card>
      </div>

      {/* Modal: Add/Edit Holding */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingItem ? 'Edit Asset Holding' : 'Add Investment Holding'}
        subtitle="Track equities, ETFs, gold, or crypto positions"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-4">
          <Input
            label="Asset / Company Name"
            placeholder="e.g. Apple Inc., Vanguard S&P 500"
            value={formData.name}
            onChange={(e) => setFormData((p) => ({ ...p, name: e.target.value }))}
            required
          />

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Ticker / Symbol"
              placeholder="e.g. AAPL, BTC"
              value={formData.symbol}
              onChange={(e) => setFormData((p) => ({ ...p, symbol: e.target.value }))}
            />
            <Select
              label="Asset Class"
              value={formData.type}
              onChange={(e) => setFormData((p) => ({ ...p, type: e.target.value }))}
              options={ASSET_TYPES}
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <Input
              label="Total Invested Amount"
              type="number"
              min="0"
              step="0.01"
              placeholder="5000"
              value={formData.investedAmount}
              onChange={(e) => setFormData((p) => ({ ...p, investedAmount: e.target.value }))}
              icon={DollarSign}
              required
            />
            <Input
              label="Current Market Value"
              type="number"
              min="0"
              step="0.01"
              placeholder="6200"
              value={formData.currentValue}
              onChange={(e) => setFormData((p) => ({ ...p, currentValue: e.target.value }))}
              icon={DollarSign}
              required
            />
          </div>

          <Input
            label="Quantity / Units Owned"
            type="number"
            step="any"
            value={formData.units}
            onChange={(e) => setFormData((p) => ({ ...p, units: e.target.value }))}
          />

          <Input
            label="Investment Strategy Notes (Optional)"
            placeholder="e.g. Long term hold for retirement"
            value={formData.notes}
            onChange={(e) => setFormData((p) => ({ ...p, notes: e.target.value }))}
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100 dark:border-slate-800">
            <Button variant="secondary" onClick={() => setIsModalOpen(false)}>
              Cancel
            </Button>
            <Button variant="primary" type="submit" isLoading={actionLoading}>
              Save Holding
            </Button>
          </div>
        </form>
      </Modal>

      {/* Confirm Delete */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDelete}
        title="Delete Holding"
        message="Are you sure you want to remove this investment holding from your portfolio?"
        isLoading={actionLoading}
      />
    </div>
  );
};

export default InvestmentsPage;
