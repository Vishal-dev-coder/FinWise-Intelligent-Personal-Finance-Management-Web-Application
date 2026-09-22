import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import {
  ShieldAlert,
  Users,
  Lightbulb,
  FileText,
  ArrowLeft,
  Activity,
  MessageSquare,
} from 'lucide-react';

const adminNavItems = [
  { name: 'Admin Overview', path: '/admin', icon: Activity, exact: true },
  { name: 'Manage Users', path: '/admin/users', icon: Users },
  { name: 'Financial Tips CMS', path: '/admin/tips', icon: Lightbulb },
  { name: 'User Tickets & Feedback', path: '/feedback', icon: MessageSquare },
];

const AdminSidebar = () => {
  return (
    <aside className="w-64 bg-slate-900 text-white min-h-screen p-4 flex flex-col border-r border-slate-800">
      <div className="flex items-center gap-2.5 pb-6 border-b border-slate-800 mb-6">
        <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
          <ShieldAlert className="w-5 h-5" />
        </div>
        <div>
          <h2 className="font-bold text-sm tracking-tight">FinWise Admin</h2>
          <span className="text-[10px] text-purple-400 font-semibold tracking-wider uppercase">
            Control Center
          </span>
        </div>
      </div>

      <div className="flex-1 space-y-1">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.exact}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-purple-600 text-white shadow-lg shadow-purple-600/30'
                    : 'text-slate-400 hover:bg-slate-800 hover:text-white'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{item.name}</span>
            </NavLink>
          );
        })}
      </div>

      <div className="pt-4 border-t border-slate-800">
        <Link
          to="/dashboard"
          className="flex items-center gap-2 text-xs font-semibold text-slate-400 hover:text-emerald-400 transition"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Exit to User Dashboard</span>
        </Link>
      </div>
    </aside>
  );
};

export default AdminSidebar;
