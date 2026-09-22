import React, { useState, useEffect } from 'react';
import Modal from '../common/Modal';
import Button from '../common/Button';
import { Mic, MicOff, Check, Sparkles } from 'lucide-react';

const VoiceExpenseModal = ({ isOpen, onClose, onParsed }) => {
  const [isListening, setIsListening] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [recognitionSupported, setRecognitionSupported] = useState(true);
  const [parsedData, setParsedData] = useState(null);

  useEffect(() => {
    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      setRecognitionSupported(false);
    }
  }, []);

  const startListening = () => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert('Speech recognition is not supported in this browser. Please try Chrome or Edge.');
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    recognition.onstart = () => {
      setIsListening(true);
      setTranscript('');
      setParsedData(null);
    };

    recognition.onresult = (event) => {
      const current = event.resultIndex;
      const text = event.results[current][0].transcript;
      setTranscript(text);
    };

    recognition.onerror = (event) => {
      console.error('Speech recognition error', event.error);
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  // Parse natural language expense query
  const parseSpeech = (text) => {
    const lower = text.toLowerCase();

    // Amount extraction: look for numbers or "$45" or "45 dollars"
    let amount = 0;
    const amountMatch = lower.match(/(?:\$|dollars?|rs\.?|inr)?\s*(\d+(?:\.\d{1,2})?)/);
    if (amountMatch) {
      amount = parseFloat(amountMatch[1]);
    }

    // Category detection
    let category = 'Shopping';
    if (lower.includes('grocery') || lower.includes('supermarket') || lower.includes('food') || lower.includes('market')) {
      category = 'Groceries';
    } else if (lower.includes('lunch') || lower.includes('dinner') || lower.includes('coffee') || lower.includes('restaurant') || lower.includes('cafe')) {
      category = 'Dining Out';
    } else if (lower.includes('uber') || lower.includes('gas') || lower.includes('fuel') || lower.includes('metro') || lower.includes('taxi')) {
      category = 'Transportation';
    } else if (lower.includes('movie') || lower.includes('cinema') || lower.includes('game') || lower.includes('party')) {
      category = 'Entertainment';
    } else if (lower.includes('electric') || lower.includes('water') || lower.includes('bill') || lower.includes('wifi') || lower.includes('internet')) {
      category = 'Utilities';
    } else if (lower.includes('doctor') || lower.includes('medicine') || lower.includes('pharmacy') || lower.includes('gym')) {
      category = 'Healthcare';
    }

    // Payment method detection
    let paymentMethod = 'card';
    if (lower.includes('cash')) paymentMethod = 'cash';
    else if (lower.includes('upi') || lower.includes('gpay') || lower.includes('phonepe')) paymentMethod = 'upi';
    else if (lower.includes('bank') || lower.includes('transfer')) paymentMethod = 'bank_transfer';
    else if (lower.includes('wallet') || lower.includes('paypal')) paymentMethod = 'wallet';

    const parsed = {
      title: text.length > 5 ? text.charAt(0).toUpperCase() + text.slice(1) : `${category} Purchase`,
      amount: amount || 25,
      type: 'expense',
      category,
      paymentMethod,
      mood: 'necessary',
      note: `Recorded via Voice entry: "${text}"`,
    };

    setParsedData(parsed);
  };

  const handleApply = () => {
    if (parsedData) {
      onParsed(parsedData);
      onClose();
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Voice-Based Expense Entry"
      subtitle="Speak naturally, e.g. 'Spent 35 dollars on grocery with card'"
      maxWidth="max-w-md"
    >
      <div className="flex flex-col items-center justify-center p-4 text-center">
        {/* Animated Mic Button */}
        <button
          onClick={startListening}
          disabled={isListening}
          className={`w-20 h-20 rounded-full flex items-center justify-center transition-all duration-300 relative cursor-pointer ${
            isListening
              ? 'bg-rose-500 text-white shadow-lg shadow-rose-500/40 animate-pulse'
              : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/30 hover:scale-105'
          }`}
        >
          {isListening ? (
            <Mic className="w-8 h-8 animate-bounce" />
          ) : (
            <MicOff className="w-8 h-8" />
          )}
        </button>

        <p className="mt-4 text-xs font-semibold text-slate-500 dark:text-slate-400">
          {isListening
            ? 'Listening... Speak now...'
            : 'Click microphone button to start recording'}
        </p>

        {/* Live transcript */}
        <div className="w-full mt-4 p-3 rounded-xl bg-slate-100 dark:bg-dark-850 border border-slate-200 dark:border-slate-800 text-xs text-left min-h-[50px] flex items-center">
          <p className="text-slate-700 dark:text-slate-300 italic">
            {transcript || 'Your transcribed speech will appear here...'}
          </p>
        </div>

        {/* Action to parse once transcript is ready */}
        {transcript && !parsedData && (
          <Button
            variant="secondary"
            size="sm"
            icon={Sparkles}
            className="mt-3"
            onClick={() => parseSpeech(transcript)}
          >
            Parse Voice Note
          </Button>
        )}

        {/* Parsed Preview Card */}
        {parsedData && (
          <div className="w-full mt-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-500/20 text-xs text-left animate-in fade-in duration-200">
            <div className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-1.5">
              <Sparkles className="w-3.5 h-3.5" /> AI Parsed Details
            </div>
            <div className="grid grid-cols-2 gap-2 text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-slate-400 block text-[10px]">Title:</span>
                <span className="font-medium truncate block">{parsedData.title}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Amount:</span>
                <span className="font-bold text-emerald-600">${parsedData.amount}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Category:</span>
                <span className="font-medium">{parsedData.category}</span>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">Method:</span>
                <span className="font-medium capitalize">{parsedData.paymentMethod}</span>
              </div>
            </div>

            <Button
              variant="primary"
              size="sm"
              icon={Check}
              className="w-full mt-3"
              onClick={handleApply}
            >
              Confirm & Populate Form
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default VoiceExpenseModal;
