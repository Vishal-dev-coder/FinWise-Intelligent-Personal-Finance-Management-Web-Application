import React, { createContext, useContext, useState, useEffect } from 'react';

const CurrencyContext = createContext();

const CURRENCIES = {
  USD: { code: 'USD', symbol: '$', rate: 1.0, label: 'US Dollar ($)' },
  EUR: { code: 'EUR', symbol: '€', rate: 0.92, label: 'Euro (€)' },
  GBP: { code: 'GBP', symbol: '£', rate: 0.79, label: 'British Pound (£)' },
  INR: { code: 'INR', symbol: '₹', rate: 83.5, label: 'Indian Rupee (₹)' },
  JPY: { code: 'JPY', symbol: '¥', rate: 155.0, label: 'Japanese Yen (¥)' },
  CAD: { code: 'CAD', symbol: 'C$', rate: 1.37, label: 'Canadian Dollar (C$)' },
  AUD: { code: 'AUD', symbol: 'A$', rate: 1.51, label: 'Australian Dollar (A$)' },
};

export const CurrencyProvider = ({ children }) => {
  const [currency, setCurrency] = useState(() => {
    return localStorage.getItem('finwise_currency') || 'USD';
  });

  useEffect(() => {
    localStorage.setItem('finwise_currency', currency);
  }, [currency]);

  const activeCurrency = CURRENCIES[currency] || CURRENCIES.USD;

  const formatAmount = (amount, convert = false) => {
    if (amount === undefined || amount === null || isNaN(amount)) return `${activeCurrency.symbol}0.00`;
    const num = convert ? amount * activeCurrency.rate : amount;
    return `${activeCurrency.symbol}${Number(num).toLocaleString('en-US', {
      minimumFractionDigits: activeCurrency.code === 'JPY' ? 0 : 2,
      maximumFractionDigits: activeCurrency.code === 'JPY' ? 0 : 2,
    })}`;
  };

  return (
    <CurrencyContext.Provider
      value={{
        currency,
        setCurrency,
        currencyDetails: activeCurrency,
        allCurrencies: CURRENCIES,
        formatAmount,
      }}
    >
      {children}
    </CurrencyContext.Provider>
  );
};

export const useCurrency = () => useContext(CurrencyContext);
