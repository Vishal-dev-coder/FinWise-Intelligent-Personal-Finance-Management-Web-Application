import React, { useState, useEffect } from 'react';
import { WifiOff, RefreshCw, CheckCircle } from 'lucide-react';
import { syncOfflineTransactions } from '../../services/api';

const OfflineSyncBanner = () => {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [offlineCount, setOfflineCount] = useState(0);
  const [syncing, setSyncing] = useState(false);
  const [syncedMessage, setSyncedMessage] = useState('');

  const updateCount = () => {
    const queue = JSON.parse(localStorage.getItem('finwise_offline_queue') || '[]');
    setOfflineCount(queue.length);
  };

  useEffect(() => {
    updateCount();
    const handleOnline = async () => {
      setIsOnline(true);
      setSyncing(true);
      const res = await syncOfflineTransactions();
      setSyncing(false);
      updateCount();
      if (res.synced > 0) {
        setSyncedMessage(`Synced ${res.synced} offline transaction(s) to server!`);
        setTimeout(() => setSyncedMessage(''), 4000);
      }
    };
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    const interval = setInterval(updateCount, 3000);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
      clearInterval(interval);
    };
  }, []);

  if (isOnline && offlineCount === 0 && !syncedMessage) return null;

  return (
    <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-2 text-xs text-amber-700 dark:text-amber-300 flex items-center justify-between">
      <div className="flex items-center gap-2">
        {!isOnline ? (
          <>
            <WifiOff className="w-4 h-4 text-amber-500 shrink-0" />
            <span>You are currently <strong>Offline</strong>. New expenses will be saved locally and auto-synced once reconnected.</span>
          </>
        ) : syncedMessage ? (
          <>
            <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
            <span className="text-emerald-600 dark:text-emerald-400">{syncedMessage}</span>
          </>
        ) : (
          <>
            <RefreshCw className={`w-4 h-4 text-blue-500 shrink-0 ${syncing ? 'animate-spin' : ''}`} />
            <span>{offlineCount} offline record(s) queued for sync.</span>
          </>
        )}
      </div>

      {offlineCount > 0 && isOnline && (
        <button
          onClick={async () => {
            setSyncing(true);
            const res = await syncOfflineTransactions();
            setSyncing(false);
            updateCount();
            if (res.synced > 0) {
              setSyncedMessage(`Synced ${res.synced} items!`);
              setTimeout(() => setSyncedMessage(''), 4000);
            }
          }}
          disabled={syncing}
          className="font-medium underline hover:text-amber-800 dark:hover:text-amber-200 cursor-pointer"
        >
          Sync Now
        </button>
      )}
    </div>
  );
};

export default OfflineSyncBanner;
