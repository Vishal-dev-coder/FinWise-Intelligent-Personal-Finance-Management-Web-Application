import React, { useState } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Upload, Scan, Check, FileText } from 'lucide-react';

const ReceiptScannerModal = ({ isOpen, onClose, onParsed }) => {
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState('');
  const [scanning, setScanning] = useState(false);
  const [scannedResult, setScannedResult] = useState(null);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
      setScannedResult(null);
    }
  };

  const runMockOCR = () => {
    setScanning(true);
    setTimeout(() => {
      setScanning(false);
      // Realistic simulated OCR extracted output
      const mockResult = {
        title: 'Trader Joe\'s Organic Market',
        amount: 54.82,
        type: 'expense',
        category: 'Groceries',
        paymentMethod: 'card',
        date: new Date().toISOString().split('T')[0],
        mood: 'necessary',
        note: 'Scanned receipt #TJ-94821 (Items: Organic Oats, Almond Milk, Berries, Salad Greens)',
        receiptUrl: preview,
      };
      setScannedResult(mockResult);
    }, 2000);
  };

  const handleConfirm = () => {
    if (scannedResult) {
      onParsed(scannedResult);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Receipt OCR Smart Scanner"
      subtitle="Upload receipt bill or invoice for automatic data extraction"
      maxWidth="max-w-md"
    >
      <div className="space-y-4">
        {/* Upload Zone */}
        {!preview ? (
          <label className="border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-2xl p-8 flex flex-col items-center justify-center text-center cursor-pointer hover:border-emerald-500 transition-colors">
            <Upload className="w-10 h-10 text-slate-400 dark:text-slate-500 mb-2" />
            <span className="text-xs font-semibold text-slate-700 dark:text-slate-200">
              Click to upload or drag & drop receipt
            </span>
            <span className="text-[10px] text-slate-400 mt-1">PNG, JPG, JPEG up to 10MB</span>
            <input
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleFileChange}
            />
          </label>
        ) : (
          <div className="relative rounded-2xl overflow-hidden border border-slate-200 dark:border-slate-800 max-h-56 flex items-center justify-center bg-slate-950">
            <img
              src={preview}
              alt="Receipt Preview"
              className={`max-h-56 object-contain ${scanning ? 'opacity-70 blur-[1px]' : ''}`}
            />

            {/* High-tech Scanning Laser Animation */}
            {scanning && (
              <div className="absolute inset-x-0 h-1 bg-emerald-400 shadow-[0_0_15px_#10b981] animate-bounce" />
            )}
          </div>
        )}

        {preview && !scannedResult && (
          <div className="flex gap-2">
            <Button
              variant="primary"
              size="sm"
              icon={Scan}
              className="w-full"
              onClick={runMockOCR}
              isLoading={scanning}
            >
              {scanning ? 'Scanning & Parsing OCR...' : 'Extract Data from Receipt'}
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={() => {
                setFile(null);
                setPreview('');
              }}
            >
              Reset
            </Button>
          </div>
        )}

        {/* Extracted Details Box */}
        {scannedResult && (
          <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-xs">
            <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-2">
              <Check className="w-4 h-4 text-emerald-500" /> OCR Data Extracted Successfully
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-slate-400 text-[10px] block">Merchant:</span>
                <span className="font-semibold">{scannedResult.title}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Total Total:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  ${scannedResult.amount}
                </span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Detected Category:</span>
                <span>{scannedResult.category}</span>
              </div>
              <div>
                <span className="text-slate-400 text-[10px] block">Receipt Date:</span>
                <span>{scannedResult.date}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              className="w-full mt-4"
              onClick={handleConfirm}
            >
              Apply to Transaction Form
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default ReceiptScannerModal;
