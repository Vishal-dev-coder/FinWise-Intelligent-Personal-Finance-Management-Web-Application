import React, { useState } from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Navbar from './components/layout/Navbar';
import Sidebar from './components/layout/Sidebar';
import AdminSidebar from './components/layout/AdminSidebar';
import OfflineSyncBanner from './components/layout/OfflineSyncBanner';
import TransactionModal from './components/common/TransactionModal';
import LoadingSpinner from './components/common/LoadingSpinner';
import API, { queueOfflineTransaction } from './services/api';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import ForgotPasswordPage from './pages/ForgotPasswordPage';
import DashboardPage from './pages/DashboardPage';
import TransactionsPage from './pages/TransactionsPage';
import IncomePage from './pages/IncomePage';
import ExpensesPage from './pages/ExpensesPage';
import BudgetPage from './pages/BudgetPage';
import GoalsPage from './pages/GoalsPage';
import DebtsPage from './pages/DebtsPage';
import InvestmentsPage from './pages/InvestmentsPage';
import BillsPage from './pages/BillsPage';
import ReportsPage from './pages/ReportsPage';
import CalendarPage from './pages/CalendarPage';
import SmartInsightsPage from './pages/SmartInsightsPage';
import ProfilePage from './pages/ProfilePage';
import FeedbackPage from './pages/FeedbackPage';
import AdminDashboardPage from './pages/admin/AdminDashboardPage';
import AdminUsersPage from './pages/admin/AdminUsersPage';
import AdminTipsPage from './pages/admin/AdminTipsPage';
import NotFoundPage from './pages/NotFoundPage';

// Route Guard: Protected for Logged-In Users
const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  if (loading) return <LoadingSpinner fullPage message="Authenticating session..." />;
  return isAuthenticated ? children : <Navigate to="/login" replace />;
};

// Route Guard: Admin Privileges Required
const AdminRoute = ({ children }) => {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  if (loading) return <LoadingSpinner fullPage message="Verifying security credentials..." />;
  if (!isAuthenticated) return <Navigate to="/login" replace />;
  if (!isAdmin) return <Navigate to="/dashboard" replace />;
  return children;
};

function App() {
  const { user } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);
  const [actionLoading, setActionLoading] = useState(false);

  const isAuthPage = ['/login', '/register', '/forgot-password'].includes(location.pathname);
  const isLandingPage = location.pathname === '/';
  const isAdminSection = location.pathname.startsWith('/admin');

  const handleQuickAddSubmit = async (formData) => {
    setActionLoading(true);
    try {
      if (!navigator.onLine) {
        queueOfflineTransaction(formData);
        alert('Transaction queued offline! Will sync automatically when network restores.');
      } else {
        await API.post('/transactions', formData);
      }
      setQuickAddOpen(false);
      // Reload page data by firing standard custom event or letting active page refresh
      window.dispatchEvent(new Event('transaction-created'));
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to record transaction');
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-dark-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans">
      <OfflineSyncBanner />

      {/* Navbar rendered on all app pages except auth pages */}
      {!isAuthPage && !isLandingPage && (
        <Navbar
          onToggleSidebar={() => setSidebarOpen((prev) => !prev)}
          onQuickAdd={() => setQuickAddOpen(true)}
        />
      )}

      <div className="flex-1 flex w-full">
        {/* Regular Sidebar */}
        {!isAuthPage && !isLandingPage && !isAdminSection && user && (
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        )}

        {/* Admin Sidebar */}
        {isAdminSection && user && (
          <div className="hidden lg:block">
            <AdminSidebar />
          </div>
        )}

        {/* Main Content Area */}
        <main className={`flex-1 overflow-x-hidden ${!isAuthPage && !isLandingPage ? 'p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full' : ''}`}>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />

            {/* Protected User Routes */}
            <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
            <Route path="/transactions" element={<ProtectedRoute><TransactionsPage /></ProtectedRoute>} />
            <Route path="/income" element={<ProtectedRoute><IncomePage /></ProtectedRoute>} />
            <Route path="/expenses" element={<ProtectedRoute><ExpensesPage /></ProtectedRoute>} />
            <Route path="/budgets" element={<ProtectedRoute><BudgetPage /></ProtectedRoute>} />
            <Route path="/goals" element={<ProtectedRoute><GoalsPage /></ProtectedRoute>} />
            <Route path="/debts" element={<ProtectedRoute><DebtsPage /></ProtectedRoute>} />
            <Route path="/investments" element={<ProtectedRoute><InvestmentsPage /></ProtectedRoute>} />
            <Route path="/bills" element={<ProtectedRoute><BillsPage /></ProtectedRoute>} />
            <Route path="/reports" element={<ProtectedRoute><ReportsPage /></ProtectedRoute>} />
            <Route path="/calendar" element={<ProtectedRoute><CalendarPage /></ProtectedRoute>} />
            <Route path="/smart-insights" element={<ProtectedRoute><SmartInsightsPage /></ProtectedRoute>} />
            <Route path="/profile" element={<ProtectedRoute><ProfilePage /></ProtectedRoute>} />
            <Route path="/feedback" element={<ProtectedRoute><FeedbackPage /></ProtectedRoute>} />

            {/* Admin Routes */}
            <Route path="/admin" element={<AdminRoute><AdminDashboardPage /></AdminRoute>} />
            <Route path="/admin/users" element={<AdminRoute><AdminUsersPage /></AdminRoute>} />
            <Route path="/admin/tips" element={<AdminRoute><AdminTipsPage /></AdminRoute>} />

            {/* 404 Route */}
            <Route path="*" element={<NotFoundPage />} />
          </Routes>
        </main>
      </div>

      {/* Global Quick Add Transaction Modal */}
      <TransactionModal
        isOpen={quickAddOpen}
        onClose={() => setQuickAddOpen(false)}
        onSubmit={handleQuickAddSubmit}
        isLoading={actionLoading}
      />
    </div>
  );
}

export default App;
