import React from 'react';
import { CURRENCIES, CurrencyInfo } from '../utils/api';

interface CurrencySelectorProps {
  selectedCurrency: string;
  onSelect: (currency: CurrencyInfo) => void;
  visible: boolean;
  onClose: () => void;
  excludeCurrency?: string;
}

export default function CurrencySelector({
  selectedCurrency,
  onSelect,
  visible,
  onClose,
  excludeCurrency,
}: CurrencySelectorProps) {
  if (!visible) return null;

  const filteredCurrencies = excludeCurrency
    ? CURRENCIES.filter((c) => c.code !== excludeCurrency)
    : CURRENCIES;

  return (
    <div className="fixed inset-0 z-50 flex items-end">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl w-full max-h-[70%] p-5 animate-slideUp">
        <div className="w-10 h-1 bg-[#d1d5db] rounded-full mx-auto mb-4" />
        <p className="text-lg font-bold mb-4">통화 선택</p>
        <div className="overflow-y-auto max-h-[50vh]">
          {filteredCurrencies.map((currency) => (
            <button
              key={currency.code}
              className={`flex items-center w-full p-4 rounded-xl mb-1 text-left ${
                selectedCurrency === currency.code ? 'bg-[#F0F7FF]' : ''
              }`}
              onClick={() => {
                onSelect(currency);
                onClose();
              }}
            >
              <span className="text-[28px] mr-3">{currency.flag}</span>
              <div className="flex-1">
                <span className={`text-base ${selectedCurrency === currency.code ? 'font-bold' : ''}`}>
                  {currency.code}
                </span>
                <p className="text-sm text-[#6B7684] mt-0.5">{currency.name}</p>
              </div>
              {selectedCurrency === currency.code && (
                <span className="text-primary text-xl">✓</span>
              )}
            </button>
          ))}
        </div>
        <button
          className="w-full bg-[#f5f5f5] p-4 rounded-xl text-center font-bold mt-3"
          onClick={onClose}
        >
          닫기
        </button>
      </div>
    </div>
  );
}
