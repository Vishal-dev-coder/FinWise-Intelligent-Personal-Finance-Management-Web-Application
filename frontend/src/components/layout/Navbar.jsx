import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useCurrency } from '../../context/CurrencyContext';
import {
  Sun,
  Moon,
  LogOut,
  User,
  Shield,
  Menu,
  X,
  PlusCircle,
  TrendingUp,
  Globe,
  Bell,
  Sparkles,
} from 'lucide-react';
import Button from '../common/Button';

const Navbar = ({ onToggleSidebar, onQuickAdd }) => {
  const { user, logout, isAdmin } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { currency, setCurrency, allCurrencies } = useCurrency();
  const [profileOpen, setProfileOpen] = useState(false);
  const [currencyOpen, setCurrencyOpen] = useState(false);
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-30 bg-white/80 dark:bg-dark-900/80 backdrop-blur-md border-b border-slate-200 dark:border-slate-800/80 transition-colors">
      <div className="px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Left: Mobile Toggle & Brand */}
        <div className="flex items-center gap-3">
          <button
            onClick={onToggleSidebar}
            className="lg:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            aria-label="Toggle navigation menu"
          >
            <Menu className="w-5 h-5" />
          </button>

          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-400 flex items-center justify-center shadow-md shadow-emerald-500/20 group-hover:scale-105 transition-transform">
              <TrendingUp className="w-5 h-5 text-white stroke-[2.5]" />
            </div>
            <div>
              <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1">
                Fin<span className="text-emerald-500">Wise</span>
              </span>
              <span className="hidden sm:block text-[10px] uppercase font-bold tracking-widest text-emerald-600 dark:text-emerald-400 -mt-1">
                Intelligent Finance
              </span>
            </div>
          </Link>
        </div>

        {/* Right: Actions, Currency, Theme & Profile */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Quick Add Transaction Button */}
          {user && onQuickAdd && (
            <Button
              variant="primary"
              size="sm"
              icon={PlusCircle}
              onClick={onQuickAdd}
              className="hidden sm:inline-flex"
            >
              Add Entry
            </Button>
          )}

          {/* Currency Switcher */}
          <div className="relative">
            <button
              onClick={() => setCurrencyOpen(!currencyOpen)}
              className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition"
              title="Change Display Currency"
            >
              <Globe className="w-3.5 h-3.5 text-emerald-500" />
              <span>{currency}</span>
            </button>

            {currencyOpen && (
              <div
                className="absolute right-0 mt-2 w-48 bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 rounded-xl shadow-xl py-1 z-40 text-xs animate-in fade-in zoom-in-95 duration-150"
                onClick={() => setCurrencyOpen(false)}
              >
                <div className="px-3 py-1.5 font-semibold text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-100 dark:border-slate-800">
                  Select Currency
                </div>
                {Object.values(allCurrencies).map((curr) => (
                  <button
                    key={curr.code}
                    onClick={() => setCurrency(curr.code)}
                    className={`w-full text-left px-3 py-2 flex items-center justify-between hover:bg-emerald-500/10 hover:text-emerald-500 transition ${
                      currency === curr.code ? 'font-bold text-emerald-500 bg-emerald-500/5' : 'text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    <span>{curr.label}</span>
                    <span className="text-slate-400 font-mono">{curr.symbol}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Dark/Light Mode Switcher */}
          <button
            onClick={toggleTheme}
            className="p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition cursor-pointer"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Dark'} mode`}
          >
            {theme === 'dark' ? (
              <Sun className="w-4 h-4 text-amber-400" />
            ) : (
              <Moon className="w-4 h-4 text-slate-600" />
            )}
          </button>

          {/* User Account / Profile Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setProfileOpen(!profileOpen)}
                className="flex items-center gap-2 p-1 pl-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition"
              >
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-bold flex items-center justify-center text-xs overflow-hidden border border-emerald-500/20">
                  {user.avatar ? (
                    <img src={user.avatar} alt={user.name} className="w-full h-full object-cover" />
                  ) : (
                    user.name?.charAt(0).toUpperCase()
                  )}
                </div>
                <div className="hidden md:block text-left text-xs">
                  <div className="font-semibold text-slate-900 dark:text-white leading-tight">
                    {user.name?.split(' ')[0]}
                  </div>
                  <div className="text-[10px] text-slate-400 capitalize">
                    {user.role}
                  </div>
                </div>
              </button>

              {profileOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 bg-white dark:bg-dark-850 border border-slate-200 dark:border-slate-800 rounded-2xl shadow-xl py-1.5 z-40 text-xs animate-in fade-in zoom-in-95 duration-150"
                  onClick={() => setProfileOpen(false)}
                >
                  <div className="px-4 py-2 border-b border-slate-100 dark:border-slate-800">
                    <p className="font-semibold text-slate-900 dark:text-white truncate">
                      {user.name}
                    </p>
                    <p className="text-slate-400 truncate text-[11px]">{user.email}</p>
                    {isAdmin && (
                      <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full bg-purple-500/10 text-purple-400 font-semibold text-[10px]">
                        <Shield className="w-3 h-3" /> System Admin
                      </span>
                    )}
                  </div>

                  <div className="py-1">
                    <Link
                      to="/profile"
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                    >
                      <User className="w-4 h-4 text-slate-400" />
                      Account Settings
                    </Link>
                    <Link
                      to="/smart-insights"
                      className="flex items-center gap-2.5 px-4 py-2 text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800/80"
                    >
                      <Sparkles className="w-4 h-4 text-emerald-400" />
                      Smart Insights & Score
                    </Link>
                    {isAdmin && (
                      <Link
                        to="/admin"
                        className="flex items-center gap-2.5 px-4 py-2 text-purple-600 dark:text-purple-400 hover:bg-purple-50 dark:hover:bg-purple-950/40 font-medium"
                      >
                        <Shield className="w-4 h-4" />
                        Admin Control Panel
                      </Link>
                    )}
                  </div>

                  <div className="pt-1 border-t border-slate-100 dark:border-slate-800">
                    <button
                      onClick={logout}
                      className="w-full text-left flex items-center gap-2.5 px-4 py-2 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40"
                    >
                      <LogOut className="w-4 h-4" />
                      Log Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link to="/login">
                <Button variant="ghost" size="sm">
                  Log In
                </Button>
              </Link>
              <Link to="/register">
                <Button variant="primary" size="sm">
                  Get Started
                </Button>
              </Link>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
