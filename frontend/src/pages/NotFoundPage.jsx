import React from 'react';
import { Link } from 'react-router-dom';
import Button from '../components/common/Button';
import { Home, ArrowLeft } from 'lucide-react';

const NotFoundPage = () => {
  return (
    <div className="min-h-[80vh] flex flex-col items-center justify-center p-6 text-center">
      <div className="w-20 h-20 rounded-3xl bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-extrabold text-3xl mb-4 border border-emerald-500/20">
        404
      </div>
      <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
        Page Not Found
      </h1>
      <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mt-2 mb-6">
        The financial page or resource you are looking for has been moved or does not exist.
      </p>
      <div className="flex gap-3">
        <Link to="/dashboard">
          <Button variant="primary" size="sm" icon={Home}>
            Go to Dashboard
          </Button>
        </Link>
        <Link to="/">
          <Button variant="secondary" size="sm" icon={ArrowLeft}>
            Home
          </Button>
        </Link>
      </div>
    </div>
  );
};

export default NotFoundPage;
