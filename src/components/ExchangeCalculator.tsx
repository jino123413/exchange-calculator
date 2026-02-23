import React, { useState, useEffect, useRef } from 'react';
import { useInterstitialAd } from '../hooks/useInterstitialAd';
import BannerAd from './BannerAd';
import CurrencySelector from './CurrencySelector';
import ExchangeRateChart from './ExchangeRateChart';
import {
  CURRENCIES,
  CurrencyInfo,
  fetchLatestRates,
  fetchHistoricalRates,
  calculateRate,
  formatCurrency,
  formatDisplayDate,
} from '../utils/api';

const INTERSTITIAL_AD_ID = 'ait.v2.live.71fe38cce9844045';
const BANNER_AD_ID = 'ait.v2.live.0d570210165c436d';

export default function ExchangeCalculator() {
  const [fromCurrency, setFromCurrency] = useState<CurrencyInfo>(CURRENCIES[1]); // USD
  const [toCurrency, setToCurrency] = useState<CurrencyInfo>(CURRENCIES[0]); // KRW
  const [amount, setAmount] = useState('1');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [rateDate, setRateDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Chart
  const [chartData, setChartData] = useState<{ date: string; rate: number }[]>([]);
  const [chartPeriod, setChartPeriod] = useState(7);
  const [isChartLoading, setIsChartLoading] = useState(false);

  // Currency selectors
  const [showFromSelector, setShowFromSelector] = useState(false);
  const [showToSelector, setShowToSelector] = useState(false);

  // KRW rates cache
  const krwRatesRef = useRef<Record<string, number>>({});

  // Ad
  const { showAd } = useInterstitialAd(INTERSTITIAL_AD_ID);

  useEffect(() => {
    loadRates();
  }, []);

  useEffect(() => {
    recalculateRate();
    loadChartData();
  }, [fromCurrency.code, toCurrency.code]);

  useEffect(() => {
    if (exchangeRate !== null) {
      const numAmount = Number(amount) || 0;
      setConvertedAmount(numAmount * exchangeRate);
    }
  }, [exchangeRate, amount]);

  useEffect(() => {
    loadChartData();
  }, [chartPeriod]);

  const loadRates = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const { rates, date } = await fetchLatestRates();
      if (Object.keys(rates).length === 0) {
        setError('환율 데이터를 가져올 수 없습니다.');
        return;
      }
      krwRatesRef.current = rates;
      setRateDate(date);
      recalculateRate();
      loadChartData();
    } catch {
      setError('환율 데이터를 불러올 수 없습니다. 잠시 후 다시 시도해주세요.');
    } finally {
      setIsLoading(false);
    }
  };

  const recalculateRate = () => {
    const rate = calculateRate(fromCurrency.code, toCurrency.code, krwRatesRef.current);
    if (rate !== null) {
      setExchangeRate(rate);
    }
  };

  const loadChartData = async () => {
    const chartCurrency = fromCurrency.code === 'KRW' ? toCurrency : fromCurrency;
    if (chartCurrency.code === 'KRW') return;

    setIsChartLoading(true);
    try {
      const data = await fetchHistoricalRates(chartCurrency.code, chartPeriod);
      if (fromCurrency.code === 'KRW') {
        setChartData(data.map((d) => ({ ...d, rate: 1 / d.rate })));
      } else if (toCurrency.code === 'KRW') {
        setChartData(data);
      } else {
        const toRate = krwRatesRef.current[toCurrency.code];
        if (toRate) {
          setChartData(data.map((d) => ({ ...d, rate: d.rate / toRate })));
        } else {
          setChartData(data);
        }
      }
    } catch {
      setChartData([]);
    } finally {
      setIsChartLoading(false);
    }
  };

  const handleFromCurrencyChange = (currency: CurrencyInfo) => {
    if (currency.code === toCurrency.code) {
      setToCurrency(fromCurrency);
    }
    setFromCurrency(currency);
  };

  const handleToCurrencyChange = (currency: CurrencyInfo) => {
    if (currency.code === fromCurrency.code) {
      setFromCurrency(toCurrency);
    }
    setToCurrency(currency);
  };

  const swapCurrencies = () => {
    const temp = fromCurrency;
    setFromCurrency(toCurrency);
    setToCurrency(temp);
  };

  const handleRefresh = () => {
    showAd({
      onDismiss: () => {
        loadRates();
      },
    });
  };

  const getRateDisplay = () => {
    if (!exchangeRate) return '-';
    const decimals =
      toCurrency.code === 'KRW' || toCurrency.code === 'JPY' ? 2 : 4;
    return exchangeRate.toFixed(decimals);
  };

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col">
      {/* Header */}
      <div className="bg-primary p-5 pt-6 text-center">
        <h1 className="text-xl font-bold text-white">나만의 환율계산기</h1>
        <p className="text-white/70 text-sm mt-1">{formatDisplayDate(rateDate)}</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        {/* Exchange Card */}
        <div className="bg-white mx-4 mt-4 p-5 rounded-xl shadow-sm">
          {/* From Currency */}
          <button
            className="flex items-center w-full py-3"
            onClick={() => setShowFromSelector(true)}
          >
            <span className="text-[28px] mr-3">{fromCurrency.flag}</span>
            <div className="flex-1 text-left">
              <span className="text-base font-bold">{fromCurrency.code}</span>
              <p className="text-sm text-[#6B7684]">{fromCurrency.name}</p>
            </div>
            <span className="text-sm text-[#6B7684]">▼</span>
          </button>

          {/* Input */}
          <div className="my-2">
            <input
              type="text"
              inputMode="decimal"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="금액 입력"
              className="w-full px-4 py-3 border border-[#E5E8EB] rounded-xl text-base outline-none focus:border-primary"
            />
          </div>

          {/* Swap */}
          <div className="flex justify-center py-1">
            <button
              className="w-10 h-10 rounded-full bg-[#F0F7FF] border border-[#D4E8FF] flex items-center justify-center"
              onClick={swapCurrencies}
            >
              <span className="text-primary text-xl font-bold">⇅</span>
            </button>
          </div>

          {/* To Currency */}
          <button
            className="flex items-center w-full py-3"
            onClick={() => setShowToSelector(true)}
          >
            <span className="text-[28px] mr-3">{toCurrency.flag}</span>
            <div className="flex-1 text-left">
              <span className="text-base font-bold">{toCurrency.code}</span>
              <p className="text-sm text-[#6B7684]">{toCurrency.name}</p>
            </div>
            <span className="text-sm text-[#6B7684]">▼</span>
          </button>

          {/* Result */}
          {isLoading ? (
            <div className="flex items-center justify-center p-5 gap-2">
              <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
              <span className="text-sm text-[#6B7684]">한국은행 환율 조회 중...</span>
            </div>
          ) : error ? (
            <div className="flex flex-col items-center p-4 gap-3">
              <p className="text-sm text-[#F04452] text-center">{error}</p>
              <button
                className="px-4 py-2 bg-primary text-white text-sm rounded-lg"
                onClick={loadRates}
              >
                다시 시도
              </button>
            </div>
          ) : (
            <div className="text-center pt-4 pb-2 border-t border-[#f0f0f0] mt-2">
              <p className="text-xl font-bold text-[#191F28] mb-1">
                {toCurrency.symbol}{' '}
                {convertedAmount !== null ? formatCurrency(convertedAmount, toCurrency.code) : '-'}
              </p>
              <p className="text-sm text-[#6B7684]">
                1 {fromCurrency.code} = {getRateDisplay()} {toCurrency.code}
              </p>
            </div>
          )}
        </div>

        {/* Rate List */}
        {!isLoading && !error && (
          <div className="bg-white mx-4 mt-4 p-5 rounded-xl shadow-sm">
            <div className="flex justify-between items-center mb-3">
              <span className="text-base font-bold">주요 환율 (원화 기준)</span>
              <button onClick={handleRefresh} className="text-sm text-primary flex items-center gap-1">
                <span className="bg-[#6B7684] text-white text-[10px] font-bold px-1 rounded">AD</span>
                새로고침
              </button>
            </div>
            {CURRENCIES.filter((c) => c.code !== 'KRW').map((currency) => {
              const krwRate = krwRatesRef.current[currency.code];
              if (!krwRate) return null;
              return (
                <button
                  key={currency.code}
                  className="flex items-center w-full py-3 border-t border-[#f0f0f0]"
                  onClick={() => {
                    setFromCurrency(currency);
                    setToCurrency(CURRENCIES[0]);
                  }}
                >
                  <span className="text-2xl mr-3">{currency.flag}</span>
                  <div className="flex-1 text-left">
                    <span className="text-sm font-semibold">{currency.code}</span>
                    <p className="text-xs text-[#6B7684]">{currency.name}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-sm font-semibold">₩ {krwRate.toFixed(2)}</span>
                    <p className="text-xs text-[#6B7684]">1{currency.symbol} 당</p>
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {/* Banner Ad */}
        {!isLoading && !error && (
          <div className="mx-4 mt-4">
            <BannerAd adGroupId={BANNER_AD_ID} />
          </div>
        )}

        {/* Chart */}
        {!isLoading && !error && !isChartLoading && chartData.length > 0 && (
          <ExchangeRateChart
            data={chartData}
            fromCurrency={fromCurrency.code}
            toCurrency={toCurrency.code}
            onPeriodChange={setChartPeriod}
            selectedPeriod={chartPeriod}
          />
        )}
        {isChartLoading && (
          <div className="bg-white mx-4 mt-4 p-5 rounded-xl shadow-sm flex items-center justify-center gap-2">
            <div className="w-4 h-4 border-2 border-primary border-t-transparent rounded-full animate-spin" />
            <span className="text-sm text-[#6B7684]">추이 데이터 로드 중...</span>
          </div>
        )}

        {/* Disclaimer */}
        <div className="p-4 pb-8">
          <p className="text-xs text-[#6B7684]">
            * 한국은행 제공 매매기준율 기준이며 실제 거래 환율과 다를 수 있습니다.
          </p>
        </div>
      </div>

      {/* Currency Selectors */}
      <CurrencySelector
        selectedCurrency={fromCurrency.code}
        onSelect={handleFromCurrencyChange}
        visible={showFromSelector}
        onClose={() => setShowFromSelector(false)}
      />
      <CurrencySelector
        selectedCurrency={toCurrency.code}
        onSelect={handleToCurrencyChange}
        visible={showToSelector}
        onClose={() => setShowToSelector(false)}
      />
    </div>
  );
}
