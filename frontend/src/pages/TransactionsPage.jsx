import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Input from '../components/common/Input';
import Select from '../components/common/Select';
import Badge from '../components/common/Badge';
import ConfirmModal from '../components/common/ConfirmModal';
import TransactionModal from '../components/common/TransactionModal';
import LoadingSpinner from '../components/common/LoadingSpinner';
import EmptyState from '../components/common/EmptyState';
import {
  PlusCircle,
  Search,
  Download,
  Filter,
  Trash2,
  Edit2,
  Receipt,
  Smile,
  Calendar,
} from 'lucide-react';

const TransactionsPage = () => {
  const { formatAmount } = useCurrency();
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalCount, setTotalCount] = useState(0);

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchTransactions = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: 12,
        search,
        type: typeFilter,
        category: categoryFilter,
        paymentMethod: paymentFilter,
      };
      const res = await API.get('/transactions', { params });
      setTransactions(res.data.data);
      setTotalPages(res.data.pages);
      setTotalCount(res.data.total);
    } catch (err) {
      console.error('Failed to fetch transactions', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
  }, [page, typeFilter, categoryFilter, paymentFilter]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchTransactions();
  };

  const handleSaveTransaction = async (formData) => {
    setActionLoading(true);
    try {
      if (editingTransaction) {
        await API.put(`/transactions/${editingTransaction._id}`, formData);
      } else {
        await API.post('/transactions', formData);
      }
      setIsCreateModalOpen(false);
      setEditingTransaction(null);
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to save transaction');
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteConfirm = async () => {
    if (!deletingId) return;
    setActionLoading(true);
    try {
      await API.delete(`/transactions/${deletingId}`);
      setDeletingId(null);
      fetchTransactions();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to delete transaction');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExportCsv = async () => {
    try {
      const response = await API.get('/reports/export-csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'FinWise_Transactions.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert('Failed to export CSV file');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Transaction Ledger
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Search, filter, and audit all recorded financial activities ({totalCount} total)
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            icon={Download}
            onClick={handleExportCsv}
          >
            Export CSV
          </Button>
          <Button
            variant="primary"
            size="sm"
            icon={PlusCircle}
            onClick={() => {
              setEditingTransaction(null);
              setIsCreateModalOpen(true);
            }}
          >
            New Transaction
          </Button>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
          <div className="lg:col-span-2">
            <Input
              placeholder="Search title, category, or note..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>

          <Select
            value={typeFilter}
            onChange={(e) => {
              setTypeFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: '', label: 'All Types (Income & Expense)' },
              { value: 'income', label: 'Income Only (+)' },
              { value: 'expense', label: 'Expense Only (-)' },
            ]}
          />

          <Select
            value={categoryFilter}
            onChange={(e) => {
              setCategoryFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Categories' },
              { value: 'Salary', label: 'Salary' },
              { value: 'Freelance', label: 'Freelance' },
              { value: 'Housing & Rent', label: 'Housing & Rent' },
              { value: 'Groceries', label: 'Groceries' },
              { value: 'Dining Out', label: 'Dining Out' },
              { value: 'Transportation', label: 'Transportation' },
              { value: 'Utilities', label: 'Utilities' },
              { value: 'Entertainment', label: 'Entertainment' },
              { value: 'Shopping', label: 'Shopping' },
              { value: 'Subscriptions', label: 'Subscriptions' },
            ]}
          />

          <Button type="submit" variant="secondary" size="sm" icon={Filter} className="w-full">
            Apply Filter
          </Button>
        </form>
      </Card>

      {/* Table */}
      <Card bodyClassName="p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Fetching transactions..." />
        ) : transactions.length === 0 ? (
          <EmptyState
            title="No transactions matched your criteria"
            description="Try changing the search keywords or filter dropdowns above."
            actionLabel="Add Transaction"
            onAction={() => setIsCreateModalOpen(true)}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-dark-850 border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-semibold">Title & Note</th>
                  <th className="p-4 font-semibold">Type</th>
                  <th className="p-4 font-semibold">Category</th>
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Payment Method</th>
                  <th className="p-4 font-semibold">Mood</th>
                  <th className="p-4 font-semibold text-right">Amount</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                {transactions.map((tx) => (
                  <tr
                    key={tx._id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-850/60 transition"
                  >
                    <td className="p-4 max-w-xs">
                      <div className="font-semibold text-slate-900 dark:text-white truncate">
                        {tx.title}
                      </div>
                      {tx.note && (
                        <div className="text-[11px] text-slate-400 truncate mt-0.5">
                          {tx.note}
                        </div>
                      )}
                    </td>
                    <td className="p-4">
                      <Badge variant={tx.type === 'income' ? 'success' : 'danger'}>
                        {tx.type === 'income' ? 'Income' : 'Expense'}
                      </Badge>
                    </td>
                    <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                      {tx.category}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {new Date(tx.date).toLocaleDateString()}
                    </td>
                    <td className="p-4 text-slate-500 dark:text-slate-400 capitalize">
                      {tx.paymentMethod?.replace('_', ' ')}
                    </td>
                    <td className="p-4">
                      <span className="text-xs capitalize">{tx.mood || 'neutral'}</span>
                    </td>
                    <td
                      className={`p-4 text-right font-bold whitespace-nowrap ${
                        tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                      }`}
                    >
                      {tx.type === 'income' ? '+' : '-'}
                      {formatAmount(tx.amount)}
                    </td>
                    <td className="p-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setEditingTransaction(tx);
                            setIsCreateModalOpen(true);
                          }}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                          title="Edit"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setDeletingId(tx._id)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition"
                          title="Delete"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Pagination controls */}
        {totalPages > 1 && (
          <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>
              Page {page} of {totalPages}
            </span>
            <div className="flex gap-2">
              <Button
                variant="secondary"
                size="sm"
                disabled={page <= 1}
                onClick={() => setPage((p) => Math.max(1, p - 1))}
              >
                Previous
              </Button>
              <Button
                variant="secondary"
                size="sm"
                disabled={page >= totalPages}
                onClick={() => setPage((p) => p + 1)}
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </Card>

      {/* Transaction Modal (Add/Edit) */}
      <TransactionModal
        isOpen={isCreateModalOpen}
        onClose={() => {
          setIsCreateModalOpen(false);
          setEditingTransaction(null);
        }}
        onSubmit={handleSaveTransaction}
        initialData={editingTransaction}
        isLoading={actionLoading}
      />

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deletingId}
        onClose={() => setDeletingId(null)}
        onConfirm={handleDeleteConfirm}
        title="Delete Transaction Record"
        message="Are you sure you want to delete this transaction from your financial ledger? This will update your balances and monthly analytics."
        isLoading={actionLoading}
      />
    </div>
  );
};

export default TransactionsPage;
