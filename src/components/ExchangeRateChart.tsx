import React from 'react';

interface ChartDataPoint {
  date: string;
  rate: number;
}

interface ExchangeRateChartProps {
  data: ChartDataPoint[];
  fromCurrency: string;
  toCurrency: string;
  onPeriodChange: (days: number) => void;
  selectedPeriod: number;
}

export default function ExchangeRateChart({
  data,
  fromCurrency,
  toCurrency,
  onPeriodChange,
  selectedPeriod,
}: ExchangeRateChartProps) {
  if (data.length === 0) return null;

  const rates = data.map((d) => d.rate);
  const maxRate = Math.max(...rates);
  const minRate = Math.min(...rates);
  const range = maxRate - minRate || 1;
  const currentRate = rates[rates.length - 1];
  const firstRate = rates[0];
  const changePercent = ((currentRate - firstRate) / firstRate) * 100;
  const isUp = changePercent >= 0;

  return (
    <div className="bg-white mx-4 p-5 rounded-xl shadow-sm mt-4">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <span className="text-base font-bold">환율 추이</span>
        <div className="flex bg-[#f5f5f5] rounded-lg p-0.5">
          <button
            className={`px-3 py-1.5 rounded-md text-xs ${
              selectedPeriod === 7 ? 'bg-white shadow-sm font-bold text-[#191F28]' : 'text-[#6B7684]'
            }`}
            onClick={() => onPeriodChange(7)}
          >
            7일
          </button>
          <button
            className={`px-3 py-1.5 rounded-md text-xs ${
              selectedPeriod === 30 ? 'bg-white shadow-sm font-bold text-[#191F28]' : 'text-[#6B7684]'
            }`}
            onClick={() => onPeriodChange(30)}
          >
            30일
          </button>
        </div>
      </div>

      {/* Change Info */}
      <div className="flex justify-between items-center mb-4 pb-3 border-b border-[#f0f0f0]">
        <span className="text-sm text-[#6B7684]">{fromCurrency} → {toCurrency} 변동</span>
        <span className={`text-base font-bold ${isUp ? 'text-[#F04452]' : 'text-[#3182F6]'}`}>
          {isUp ? '▲' : '▼'} {Math.abs(changePercent).toFixed(2)}%
        </span>
      </div>

      {/* Bar Chart */}
      <div className="flex h-40 mb-4">
        {/* Y-axis */}
        <div className="w-11 flex flex-col justify-between py-1 shrink-0">
          <span className="text-[10px] text-[#6B7684]">{maxRate.toFixed(1)}</span>
          <span className="text-[10px] text-[#6B7684]">{((maxRate + minRate) / 2).toFixed(1)}</span>
          <span className="text-[10px] text-[#6B7684]">{minRate.toFixed(1)}</span>
        </div>

        {/* Bars */}
        <div className="flex-1 flex items-end pb-5 relative">
          {data.map((point, index) => {
            const height = ((point.rate - minRate) / range) * 100;
            const isLast = index === data.length - 1;

            return (
              <div key={index} className="flex-1 flex flex-col items-center justify-end h-full relative">
                <div className="w-[60%] flex-1 flex items-end">
                  <div
                    className="w-full rounded-t-sm"
                    style={{
                      height: `${Math.max(height, 5)}%`,
                      backgroundColor: isLast ? '#3182F6' : isUp ? '#FFB0B0' : '#B0D4FF',
                      minHeight: 4,
                    }}
                  />
                </div>
                {(index === 0 || isLast || (selectedPeriod === 30 && index % 5 === 0)) && (
                  <span className="absolute bottom-0 text-[9px] text-[#6B7684]">
                    {point.date}
                  </span>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Range Info */}
      <div className="flex justify-around pt-3 border-t border-[#f0f0f0]">
        <div className="text-center">
          <p className="text-xs text-[#6B7684]">최저</p>
          <p className="text-xs font-semibold">{minRate.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-[#6B7684]">최고</p>
          <p className="text-xs font-semibold">{maxRate.toFixed(2)}</p>
        </div>
        <div className="text-center">
          <p className="text-xs text-[#6B7684]">변동폭</p>
          <p className="text-xs font-semibold">{(maxRate - minRate).toFixed(2)}</p>
        </div>
      </div>
    </div>
  );
}
