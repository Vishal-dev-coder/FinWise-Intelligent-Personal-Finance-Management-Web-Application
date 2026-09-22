import React, { useState, useEffect } from 'react';
import API from '../../services/api';
import Card from '../../components/common/Card';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import Select from '../../components/common/Select';
import Badge from '../../components/common/Badge';
import ConfirmModal from '../../components/common/ConfirmModal';
import LoadingSpinner from '../../components/common/LoadingSpinner';
import { Users, Search, Shield, ShieldOff, UserCheck, AlertTriangle } from 'lucide-react';

const AdminUsersPage = () => {
  const [users, setUsers] = useState([]);
  const [total, setTotal] = useState(0);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  const [togglingUser, setTogglingUser] = useState(null);
  const [actionLoading, setActionLoading] = useState(false);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const res = await API.get('/admin/users', {
        params: { search, role: roleFilter, page, limit: 10 },
      });
      setUsers(res.data.data);
      setTotal(res.data.total);
    } catch (err) {
      console.error('Failed to load users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [roleFilter, page]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchUsers();
  };

  const handleToggleBan = async () => {
    if (!togglingUser) return;
    setActionLoading(true);
    try {
      await API.patch(`/admin/users/${togglingUser._id}/ban`);
      setTogglingUser(null);
      fetchUsers();
    } catch (err) {
      alert(err.response?.data?.message || 'Action failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleChangeRole = async (userId, newRole) => {
    try {
      await API.patch(`/admin/users/${userId}/role`, { role: newRole });
      fetchUsers();
    } catch (err) {
      alert('Failed to update role');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Users className="w-6 h-6 text-purple-500" />
          <span>User Management Portal</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          View member directories, assign security roles, and enforce account suspensions ({total} total users)
        </p>
      </div>

      {/* Filter Bar */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2">
            <Input
              placeholder="Search by name or email address..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              icon={Search}
            />
          </div>
          <Select
            value={roleFilter}
            onChange={(e) => {
              setRoleFilter(e.target.value);
              setPage(1);
            }}
            options={[
              { value: 'all', label: 'All Roles' },
              { value: 'user', label: 'Standard Users' },
              { value: 'admin', label: 'Administrators' },
            ]}
          />
        </form>
      </Card>

      {/* Users Table */}
      <Card bodyClassName="p-0 overflow-hidden">
        {loading ? (
          <LoadingSpinner message="Querying platform users..." />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 dark:bg-dark-850 border-b border-slate-200 dark:border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider">
                <tr>
                  <th className="p-4 font-semibold">User</th>
                  <th className="p-4 font-semibold">Email</th>
                  <th className="p-4 font-semibold">Currency</th>
                  <th className="p-4 font-semibold">Base Income</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {users.map((u) => (
                  <tr key={u._id} className="hover:bg-slate-50/50 dark:hover:bg-slate-850/50 transition">
                    <td className="p-4">
                      <div className="font-bold text-slate-900 dark:text-white">
                        {u.name}
                      </div>
                      <span className="text-[10px] text-slate-400">
                        Joined {new Date(u.createdAt).toLocaleDateString()}
                      </span>
                    </td>
                    <td className="p-4 text-slate-500 font-mono text-xs">{u.email}</td>
                    <td className="p-4 font-semibold text-slate-700 dark:text-slate-300">{u.currency}</td>
                    <td className="p-4 font-medium text-slate-700 dark:text-slate-300">
                      ${u.monthlyIncome?.toLocaleString()}
                    </td>
                    <td className="p-4">
                      <select
                        value={u.role}
                        onChange={(e) => handleChangeRole(u._id, e.target.value)}
                        className="rounded-lg bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 px-2 py-1 text-xs font-semibold cursor-pointer"
                      >
                        <option value="user">User</option>
                        <option value="admin">Admin</option>
                      </select>
                    </td>
                    <td className="p-4">
                      <Badge variant={u.isBanned ? 'danger' : 'success'} size="sm">
                        {u.isBanned ? 'Suspended' : 'Active'}
                      </Badge>
                    </td>
                    <td className="p-4 text-right">
                      {u.role !== 'admin' && (
                        <Button
                          variant={u.isBanned ? 'secondary' : 'danger'}
                          size="sm"
                          onClick={() => setTogglingUser(u)}
                          className="text-[11px] py-1 px-2.5"
                        >
                          {u.isBanned ? 'Reinstate' : 'Suspend User'}
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Confirmation Modal */}
      <ConfirmModal
        isOpen={!!togglingUser}
        onClose={() => setTogglingUser(null)}
        onConfirm={handleToggleBan}
        title={togglingUser?.isBanned ? 'Reinstate User Account' : 'Suspend User Account'}
        message={`Are you sure you want to ${
          togglingUser?.isBanned ? 'reinstate access for' : 'suspend access for'
        } ${togglingUser?.name} (${togglingUser?.email})?`}
        confirmText={togglingUser?.isBanned ? 'Reinstate' : 'Confirm Suspension'}
        confirmVariant={togglingUser?.isBanned ? 'primary' : 'danger'}
        isLoading={actionLoading}
      />
    </div>
  );
};

export default AdminUsersPage;
