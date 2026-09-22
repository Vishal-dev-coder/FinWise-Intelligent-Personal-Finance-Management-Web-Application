import React, { useState, useEffect } from 'react';
import API from '../services/api';
import { useCurrency } from '../context/CurrencyContext';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import LoadingSpinner from '../components/common/LoadingSpinner';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  Receipt,
  CreditCard,
} from 'lucide-react';

const CalendarPage = () => {
  const { formatAmount } = useCurrency();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [transactions, setTransactions] = useState([]);
  const [bills, setBills] = useState([]);
  const [debts, setDebts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDay, setSelectedDay] = useState(new Date().getDate());

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();

  const fetchCalendarData = async () => {
    setLoading(true);
    try {
      const [txRes, billRes, debtRes] = await Promise.all([
        API.get('/transactions', { params: { limit: 200 } }),
        API.get('/bills'),
        API.get('/debts'),
      ]);
      setTransactions(txRes.data.data);
      setBills(billRes.data.data);
      setDebts(debtRes.data.data);
    } catch (err) {
      console.error('Failed to load calendar data', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCalendarData();
  }, []);

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };
  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  if (loading) return <LoadingSpinner fullPage message="Building financial calendar schedules..." />;

  // Calendar math
  const firstDayIndex = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  // Aggregate items by day
  const dayItems = {};
  for (let d = 1; d <= daysInMonth; d++) {
    dayItems[d] = { income: 0, expense: 0, bills: [], txs: [], isEmiDay: false };
  }

  transactions.forEach((tx) => {
    const d = new Date(tx.date);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (dayItems[day]) {
        if (tx.type === 'income') dayItems[day].income += tx.amount;
        else dayItems[day].expense += tx.amount;
        dayItems[day].txs.push(tx);
      }
    }
  });

  bills.forEach((bill) => {
    const d = new Date(bill.dueDate);
    if (d.getFullYear() === year && d.getMonth() === month) {
      const day = d.getDate();
      if (dayItems[day]) {
        dayItems[day].bills.push(bill);
      }
    }
  });

  debts.forEach((debt) => {
    if (debt.status === 'active' && debt.dueDateDay <= daysInMonth) {
      if (dayItems[debt.dueDateDay]) {
        dayItems[debt.dueDateDay].isEmiDay = true;
      }
    }
  });

  const selectedData = dayItems[selectedDay] || { income: 0, expense: 0, bills: [], txs: [] };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Financial Schedule & Calendar
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Visualize income deposits, bill payment dates, EMI schedules, and daily expenses
          </p>
        </div>

        {/* Month Navigator */}
        <div className="flex items-center gap-2">
          <Button variant="secondary" size="sm" icon={ChevronLeft} onClick={prevMonth} />
          <span className="font-bold text-sm px-3 text-slate-800 dark:text-slate-200">
            {currentDate.toLocaleString('default', { month: 'long', year: 'numeric' })}
          </span>
          <Button variant="secondary" size="sm" icon={ChevronRight} onClick={nextMonth} />
        </div>
      </div>

      {/* Calendar Grid & Selected Day Inspector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Calendar (2 cols) */}
        <Card bodyClassName="p-3" className="lg:col-span-2">
          {/* Day of week labels */}
          <div className="grid grid-cols-7 text-center font-bold text-xs text-slate-400 pb-2 border-b border-slate-100 dark:border-slate-800">
            <span>Sun</span>
            <span>Mon</span>
            <span>Tue</span>
            <span>Wed</span>
            <span>Thu</span>
            <span>Fri</span>
            <span>Sat</span>
          </div>

          {/* Day tiles */}
          <div className="grid grid-cols-7 gap-1 mt-2">
            {/* Blank tiles before start */}
            {Array.from({ length: firstDayIndex }).map((_, i) => (
              <div key={`blank-${i}`} className="min-h-[70px] sm:min-h-[85px] rounded-xl p-1 bg-transparent opacity-20" />
            ))}

            {/* Days of month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const data = dayItems[day];
              const isSelected = day === selectedDay;
              const hasActivity = data.income > 0 || data.expense > 0 || data.bills.length > 0 || data.isEmiDay;

              return (
                <div
                  key={`day-${day}`}
                  onClick={() => setSelectedDay(day)}
                  className={`min-h-[70px] sm:min-h-[85px] rounded-xl p-1.5 transition cursor-pointer flex flex-col justify-between border text-left ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 shadow-xs'
                      : 'border-slate-100 dark:border-slate-800/80 hover:bg-slate-50 dark:hover:bg-slate-850'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xs font-bold leading-none ${
                        isSelected ? 'text-emerald-500' : 'text-slate-700 dark:text-slate-300'
                      }`}
                    >
                      {day}
                    </span>
                    {data.isEmiDay && (
                      <span className="w-1.5 h-1.5 rounded-full bg-purple-500" title="EMI Due Date" />
                    )}
                  </div>

                  {/* Badges / Micro amounts */}
                  <div className="space-y-0.5 text-[10px] font-semibold truncate">
                    {data.income > 0 && (
                      <span className="block text-emerald-500 truncate leading-tight">
                        +{formatAmount(data.income)}
                      </span>
                    )}
                    {data.expense > 0 && (
                      <span className="block text-rose-500 truncate leading-tight">
                        -{formatAmount(data.expense)}
                      </span>
                    )}
                    {data.bills.length > 0 && (
                      <span className="block text-amber-500 truncate text-[9px] leading-tight">
                        {data.bills.length} Bill due
                      </span>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </Card>

        {/* Selected Day Details Panel */}
        <Card
          title={`Day Activity: ${currentDate.toLocaleString('default', { month: 'short' })} ${selectedDay}, ${year}`}
          subtitle="Events and ledger postings for this day"
        >
          <div className="space-y-4">
            {/* Net Day summary */}
            <div className="p-3 rounded-xl bg-slate-50 dark:bg-dark-850 border border-slate-200 dark:border-slate-800 flex justify-between items-center text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">Net Cashflow</span>
                <span
                  className={`font-bold text-sm ${
                    selectedData.income - selectedData.expense >= 0
                      ? 'text-emerald-500'
                      : 'text-rose-500'
                  }`}
                >
                  {formatAmount(selectedData.income - selectedData.expense)}
                </span>
              </div>
              <div className="text-right text-[11px] text-slate-500">
                <span className="text-emerald-500 font-semibold block">+{formatAmount(selectedData.income)} in</span>
                <span className="text-rose-500 font-semibold block">-{formatAmount(selectedData.expense)} out</span>
              </div>
            </div>

            {/* Scheduled Bills on this day */}
            {selectedData.bills.length > 0 && (
              <div>
                <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
                  <Receipt className="w-3.5 h-3.5 text-amber-500" />
                  Scheduled Bills Due
                </h4>
                <div className="space-y-1.5">
                  {selectedData.bills.map((b) => (
                    <div
                      key={b._id}
                      className="p-2.5 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs flex justify-between"
                    >
                      <span className="font-semibold text-slate-900 dark:text-white">{b.title}</span>
                      <span className="font-bold text-amber-500">{formatAmount(b.amount)}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Transactions on this day */}
            <div>
              <h4 className="text-xs font-bold text-slate-900 dark:text-white mb-2">
                Transactions ({selectedData.txs.length})
              </h4>
              {selectedData.txs.length > 0 ? (
                <div className="space-y-2 max-h-72 overflow-y-auto">
                  {selectedData.txs.map((tx) => (
                    <div
                      key={tx._id}
                      className="p-2.5 rounded-xl bg-slate-50 dark:bg-dark-850 border border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs"
                    >
                      <div>
                        <span className="font-semibold text-slate-900 dark:text-white block truncate max-w-[150px]">
                          {tx.title}
                        </span>
                        <span className="text-[10px] text-slate-400 capitalize">
                          {tx.category} • {tx.paymentMethod}
                        </span>
                      </div>
                      <span
                        className={`font-bold ${
                          tx.type === 'income' ? 'text-emerald-500' : 'text-rose-500'
                        }`}
                      >
                        {tx.type === 'income' ? '+' : '-'}{formatAmount(tx.amount)}
                      </span>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-slate-400 py-4 text-center">
                  No transactions recorded on this day.
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default CalendarPage;
