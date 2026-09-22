import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  ArrowLeftRight,
  TrendingUp,
  TrendingDown,
  PieChart,
  Target,
  CreditCard,
  LineChart,
  Receipt,
  FileBarChart,
  Calendar,
  Sparkles,
  MessageSquare,
  User,
  Shield,
  X,
} from 'lucide-react';

const navItems = [
  { name: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { name: 'Transactions', path: '/transactions', icon: ArrowLeftRight },
  { name: 'Income', path: '/income', icon: TrendingUp },
  { name: 'Expenses', path: '/expenses', icon: TrendingDown },
  { name: 'Budgets', path: '/budgets', icon: PieChart },
  { name: 'Savings Goals', path: '/goals', icon: Target },
  { name: 'Debts & Loans', path: '/debts', icon: CreditCard },
  { name: 'Investments', path: '/investments', icon: LineChart },
  { name: 'Bills & Subs', path: '/bills', icon: Receipt },
  { name: 'Reports', path: '/reports', icon: FileBarChart },
  { name: 'Calendar', path: '/calendar', icon: Calendar },
  { name: 'Smart Insights', path: '/smart-insights', icon: Sparkles, badge: 'AI' },
  { name: 'Feedback', path: '/feedback', icon: MessageSquare },
  { name: 'Profile Settings', path: '/profile', icon: User },
];

const Sidebar = ({ isOpen, onClose }) => {
  const { isAdmin } = useAuth();

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-sm lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-64 bg-white dark:bg-dark-900 border-r border-slate-200 dark:border-slate-800/80 flex flex-col transition-transform duration-200 lg:static lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Mobile header inside sidebar */}
        <div className="h-16 flex items-center justify-between px-5 border-b border-slate-100 dark:border-slate-800 lg:hidden">
          <span className="font-bold text-slate-900 dark:text-white">Navigation</span>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Links scroll container */}
        <div className="flex-1 overflow-y-auto px-3 py-4 space-y-1">
          <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Personal Finance
          </div>

          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all group ${
                    isActive
                      ? 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold border-l-4 border-emerald-500 pl-2'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 hover:text-slate-900 dark:hover:text-slate-200'
                  }`
                }
              >
                <div className="flex items-center gap-3">
                  <Icon className="w-4 h-4 transition-transform group-hover:scale-110" />
                  <span>{item.name}</span>
                </div>
                {item.badge && (
                  <span className="text-[10px] uppercase font-extrabold px-1.5 py-0.5 rounded-md bg-emerald-500 text-white leading-none shadow-xs">
                    {item.badge}
                  </span>
                )}
              </NavLink>
            );
          })}

          {isAdmin && (
            <div className="pt-4 mt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-purple-400">
                Administration
              </div>
              <NavLink
                to="/admin"
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-purple-500/10 text-purple-500 font-bold'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-purple-500/5 hover:text-purple-400'
                  }`
                }
              >
                <Shield className="w-4 h-4 text-purple-500" />
                <span>Admin Panel</span>
              </NavLink>
            </div>
          )}
        </div>

        {/* Bottom Banner */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800">
          <div className="p-3 rounded-xl bg-gradient-to-br from-emerald-500/10 to-teal-500/5 border border-emerald-500/20 text-xs">
            <p className="font-semibold text-emerald-800 dark:text-emerald-300">
              Smart Health Active
            </p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
              FinWise algorithm is monitoring monthly cash flow.
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
