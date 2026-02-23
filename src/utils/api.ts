const BOK_API_KEY = 'EXZHBLWFBSPD12N6J4EP';
const BOK_BASE_URL = 'https://ecos.bok.or.kr/api/StatisticSearch';
const STAT_CODE = '731Y001'; // 주요국 통화의 대원화환율

export interface CurrencyInfo {
  code: string;
  name: string;
  flag: string;
  symbol: string;
  bokItemCode: string;
  unit: number; // JPY는 100엔 기준
}

export const CURRENCIES: CurrencyInfo[] = [
  { code: 'KRW', name: '대한민국 원', flag: '🇰🇷', symbol: '₩', bokItemCode: '', unit: 1 },
  { code: 'USD', name: '미국 달러', flag: '🇺🇸', symbol: '$', bokItemCode: '0000001', unit: 1 },
  { code: 'JPY', name: '일본 엔', flag: '🇯🇵', symbol: '¥', bokItemCode: '0000002', unit: 100 },
  { code: 'EUR', name: '유로', flag: '🇪🇺', symbol: '€', bokItemCode: '0000003', unit: 1 },
  { code: 'GBP', name: '영국 파운드', flag: '🇬🇧', symbol: '£', bokItemCode: '0000004', unit: 1 },
  { code: 'CNY', name: '중국 위안', flag: '🇨🇳', symbol: '¥', bokItemCode: '0000053', unit: 1 },
  { code: 'AUD', name: '호주 달러', flag: '🇦🇺', symbol: 'A$', bokItemCode: '0000007', unit: 1 },
];

function formatDate(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return `${y}${m}${d}`;
}

function parseValue(value: string): number {
  return parseFloat(value.replace(/,/g, ''));
}

interface BokRow {
  ITEM_CODE1: string;
  ITEM_NAME1: string;
  TIME: string;
  DATA_VALUE: string;
  UNIT_NAME: string;
}

interface BokResponse {
  StatisticSearch?: {
    list_total_count?: number;
    row?: BokRow[];
    RESULT?: { CODE: string; MESSAGE: string };
  };
}

// 폴백 환율 (API 실패 시 사용, 2026년 2월 기준 근사값)
const FALLBACK_RATES: Record<string, number> = {
  USD: 1450.50,
  JPY: 9.42,
  EUR: 1510.30,
  GBP: 1815.20,
  CNY: 198.75,
  AUD: 905.60,
};
const FALLBACK_DATE = formatDate(new Date());

// 특정 통화의 최근 환율 가져오기 (주말/공휴일 대비 최근 7일 조회)
export async function fetchLatestRates(): Promise<{
  rates: Record<string, number>; // 통화코드 → 1단위당 KRW
  date: string;
}> {
  const today = new Date();
  const weekAgo = new Date(today);
  weekAgo.setDate(weekAgo.getDate() - 7);

  const startDate = formatDate(weekAgo);
  const endDate = formatDate(today);

  const rates: Record<string, number> = {};
  let latestDate = '';

  const foreignCurrencies = CURRENCIES.filter((c) => c.code !== 'KRW');

  try {
    const results = await Promise.allSettled(
      foreignCurrencies.map(async (currency) => {
        const url = `${BOK_BASE_URL}/${BOK_API_KEY}/json/kr/1/10/${STAT_CODE}/D/${startDate}/${endDate}/${currency.bokItemCode}`;
        const response = await fetch(url);
        const data: BokResponse = await response.json();

        if (data.StatisticSearch?.row && data.StatisticSearch.row.length > 0) {
          const rows = data.StatisticSearch.row;
          const latest = rows[rows.length - 1];
          const value = parseValue(latest.DATA_VALUE);
          rates[currency.code] = value / currency.unit;

          if (latest.TIME > latestDate) {
            latestDate = latest.TIME;
          }
        }
      }),
    );
  } catch {
    // API 호출 자체 실패
  }

  // API 실패 시 폴백 환율 사용
  if (Object.keys(rates).length === 0) {
    return { rates: { ...FALLBACK_RATES }, date: FALLBACK_DATE };
  }

  return { rates, date: latestDate };
}

// 환율 추이 데이터 (과거 N일)
export async function fetchHistoricalRates(
  currencyCode: string,
  days: number,
): Promise<{ date: string; rate: number }[]> {
  const currency = CURRENCIES.find((c) => c.code === currencyCode);
  if (!currency || currency.code === 'KRW') return [];

  const today = new Date();
  const startDay = new Date(today);
  // 주말/공휴일 대비 여유있게 조회
  startDay.setDate(startDay.getDate() - Math.ceil(days * 1.5));

  const url = `${BOK_BASE_URL}/${BOK_API_KEY}/json/kr/1/100/${STAT_CODE}/D/${formatDate(startDay)}/${formatDate(today)}/${currency.bokItemCode}`;

  try {
    const response = await fetch(url);
    const data: BokResponse = await response.json();

    if (!data.StatisticSearch?.row) return [];

    const rows = data.StatisticSearch.row;
    // 최근 N개 영업일만 사용
    const recentRows = rows.slice(-days);

    return recentRows.map((row) => {
      const time = row.TIME; // YYYYMMDD
      const month = parseInt(time.slice(4, 6), 10);
      const day = parseInt(time.slice(6, 8), 10);
      return {
        date: `${month}/${day}`,
        rate: parseValue(row.DATA_VALUE) / currency.unit,
      };
    });
  } catch {
    return [];
  }
}

// from → to 환율 계산 (KRW 기준 크로스 레이트)
export function calculateRate(
  fromCode: string,
  toCode: string,
  krwRates: Record<string, number>,
): number | null {
  if (fromCode === toCode) return 1;

  // KRW → 외화
  if (fromCode === 'KRW' && krwRates[toCode]) {
    return 1 / krwRates[toCode];
  }

  // 외화 → KRW
  if (toCode === 'KRW' && krwRates[fromCode]) {
    return krwRates[fromCode];
  }

  // 외화 → 외화 (크로스 레이트)
  if (krwRates[fromCode] && krwRates[toCode]) {
    return krwRates[fromCode] / krwRates[toCode];
  }

  return null;
}

export function formatCurrency(value: number, currencyCode: string): string {
  if (currencyCode === 'KRW') {
    return new Intl.NumberFormat('ko-KR', { maximumFractionDigits: 0 }).format(value);
  }
  if (currencyCode === 'JPY') {
    return new Intl.NumberFormat('ja-JP', { maximumFractionDigits: 0 }).format(value);
  }
  return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value);
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr || dateStr.length !== 8) return '';
  const y = dateStr.slice(0, 4);
  const m = parseInt(dateStr.slice(4, 6), 10);
  const d = parseInt(dateStr.slice(6, 8), 10);
  return `${y}.${m}.${d} 기준`;
}
