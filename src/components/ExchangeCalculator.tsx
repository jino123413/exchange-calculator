import { useState, useEffect, useRef } from 'react';
import { View, ScrollView, StyleSheet, ActivityIndicator, TouchableOpacity } from 'react-native';
import { Text, TextField, Button } from '@toss/tds-react-native';
import { GoogleAdMob } from '@apps-in-toss/framework';
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

export default function ExchangeCalculator() {
  const [fromCurrency, setFromCurrency] = useState<CurrencyInfo>(CURRENCIES[1]); // USD
  const [toCurrency, setToCurrency] = useState<CurrencyInfo>(CURRENCIES[0]); // KRW
  const [amount, setAmount] = useState('1');
  const [convertedAmount, setConvertedAmount] = useState<number | null>(null);
  const [exchangeRate, setExchangeRate] = useState<number | null>(null);
  const [rateDate, setRateDate] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 환율 추이
  const [chartData, setChartData] = useState<{ date: string; rate: number }[]>([]);
  const [chartPeriod, setChartPeriod] = useState(7);
  const [isChartLoading, setIsChartLoading] = useState(false);

  // 통화 선택 모달
  const [showFromSelector, setShowFromSelector] = useState(false);
  const [showToSelector, setShowToSelector] = useState(false);

  // KRW 기준 환율 캐시
  const krwRatesRef = useRef<Record<string, number>>({});

  // 광고
  const adLoadedRef = useRef(false);
  const adAvailableRef = useRef(false);

  useEffect(() => {
    loadAd();
    loadRates();
  }, []);

  // 통화 변경 시 환율 재계산 + 차트 갱신
  useEffect(() => {
    recalculateRate();
    loadChartData();
  }, [fromCurrency.code, toCurrency.code]);

  // 환율 또는 금액 변경 시 변환
  useEffect(() => {
    if (exchangeRate !== null) {
      const numAmount = Number(amount) || 0;
      setConvertedAmount(numAmount * exchangeRate);
    }
  }, [exchangeRate, amount]);

  // 차트 기간 변경 시
  useEffect(() => {
    loadChartData();
  }, [chartPeriod]);

  // 광고 로드
  const loadAd = () => {
    try {
      if (!GoogleAdMob || typeof GoogleAdMob.loadAppsInTossAdMob !== 'function') {
        adAvailableRef.current = false;
        return;
      }
      adAvailableRef.current = true;
      GoogleAdMob.loadAppsInTossAdMob({
        options: { adGroupId: INTERSTITIAL_AD_ID },
        onEvent: (event: any) => {
          if (event.type === 'loaded') {
            adLoadedRef.current = true;
          }
        },
        onError: () => {
          adLoadedRef.current = false;
        },
      });
    } catch {
      adAvailableRef.current = false;
    }
  };

  // 광고 표시 (새로고침 시)
  const showAd = () => {
    if (!adAvailableRef.current || !adLoadedRef.current) return;
    try {
      GoogleAdMob.showAppsInTossAdMob({
        options: { adGroupId: INTERSTITIAL_AD_ID },
        onEvent: (event: any) => {
          if (event.type === 'dismissed') {
            adLoadedRef.current = false;
            loadAd();
          }
        },
        onError: () => {
          adLoadedRef.current = false;
          loadAd();
        },
      });
    } catch {
      // 무시
    }
  };

  // 한국은행 API로 최신 환율 가져오기
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

  // 캐시된 KRW 환율로 현재 통화 쌍의 환율 계산
  const recalculateRate = () => {
    const rate = calculateRate(fromCurrency.code, toCurrency.code, krwRatesRef.current);
    if (rate !== null) {
      setExchangeRate(rate);
    }
  };

  // 차트 데이터 로드
  const loadChartData = async () => {
    // KRW가 아닌 쪽의 통화로 차트 데이터 요청
    const chartCurrency = fromCurrency.code === 'KRW' ? toCurrency : fromCurrency;
    if (chartCurrency.code === 'KRW') return;

    setIsChartLoading(true);
    try {
      const data = await fetchHistoricalRates(chartCurrency.code, chartPeriod);
      // from→to 방향에 맞게 변환
      if (fromCurrency.code === 'KRW') {
        // KRW → 외화: 역수
        setChartData(data.map((d) => ({ ...d, rate: 1 / d.rate })));
      } else if (toCurrency.code === 'KRW') {
        // 외화 → KRW: 그대로
        setChartData(data);
      } else {
        // 외화 → 외화: to 통화의 KRW 환율로 나눔
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

  // 새로고침: 광고 표시 후 환율 재조회
  const handleRefresh = () => {
    showAd();
    loadRates();
  };

  const getRateDisplay = () => {
    if (!exchangeRate) return '-';
    const decimals =
      toCurrency.code === 'KRW' || toCurrency.code === 'JPY' ? 2 : 4;
    return exchangeRate.toFixed(decimals);
  };

  return (
    <View style={styles.container}>
      {/* 헤더 */}
      <View style={styles.header}>
        <Text typography="h4" fontWeight="bold" style={styles.headerText}>
          나만의 환율계산기
        </Text>
        <Text typography="body3" style={styles.headerSubText}>
          {formatDisplayDate(rateDate)}
        </Text>
      </View>

      <ScrollView style={styles.content}>
        {/* 환율 변환 카드 */}
        <View style={styles.card}>
          {/* 보내는 통화 */}
          <TouchableOpacity
            style={styles.currencyRow}
            onPress={() => setShowFromSelector(true)}
          >
            <Text typography="body1" style={styles.flag}>{fromCurrency.flag}</Text>
            <View style={styles.currencyLabel}>
              <Text typography="body1" fontWeight="bold">{fromCurrency.code}</Text>
              <Text typography="body3" style={styles.greyText}>{fromCurrency.name}</Text>
            </View>
            <Text typography="body2" style={styles.greyText}>▼</Text>
          </TouchableOpacity>

          <View style={styles.inputGroup}>
            <TextField
              variant="box"
              label=""
              value={amount}
              onChangeText={setAmount}
              keyboardType="decimal-pad"
              placeholder="금액 입력"
            />
          </View>

          {/* 스왑 버튼 */}
          <View style={styles.swapContainer}>
            <TouchableOpacity style={styles.swapButton} onPress={swapCurrencies}>
              <Text typography="body1" fontWeight="bold" style={styles.swapText}>⇅</Text>
            </TouchableOpacity>
          </View>

          {/* 받는 통화 */}
          <TouchableOpacity
            style={styles.currencyRow}
            onPress={() => setShowToSelector(true)}
          >
            <Text typography="body1" style={styles.flag}>{toCurrency.flag}</Text>
            <View style={styles.currencyLabel}>
              <Text typography="body1" fontWeight="bold">{toCurrency.code}</Text>
              <Text typography="body3" style={styles.greyText}>{toCurrency.name}</Text>
            </View>
            <Text typography="body2" style={styles.greyText}>▼</Text>
          </TouchableOpacity>

          {/* 결과 표시 */}
          {isLoading ? (
            <View style={styles.loadingContainer}>
              <ActivityIndicator size="small" color="#3182F6" />
              <Text typography="body3" style={[styles.greyText, { marginLeft: 8 }]}>
                한국은행 환율 조회 중...
              </Text>
            </View>
          ) : error ? (
            <View style={styles.errorContainer}>
              <Text typography="body2" style={styles.errorText}>{error}</Text>
              <Button size="small" onPress={loadRates}>
                다시 시도
              </Button>
            </View>
          ) : (
            <View style={styles.resultContainer}>
              <Text typography="h5" fontWeight="bold" style={styles.resultAmount}>
                {toCurrency.symbol}{' '}
                {convertedAmount !== null ? formatCurrency(convertedAmount, toCurrency.code) : '-'}
              </Text>
              <Text typography="body3" style={styles.greyText}>
                1 {fromCurrency.code} = {getRateDisplay()} {toCurrency.code}
              </Text>
            </View>
          )}
        </View>

        {/* 주요 환율 한눈에 보기 */}
        {!isLoading && !error && (
          <View style={styles.card}>
            <View style={styles.rateListHeader}>
              <Text typography="h6" fontWeight="bold">
                주요 환율 (원화 기준)
              </Text>
              <TouchableOpacity onPress={handleRefresh}>
                <Text typography="body3" style={styles.blueText}>새로고침</Text>
              </TouchableOpacity>
            </View>
            {CURRENCIES.filter((c) => c.code !== 'KRW').map((currency) => {
              const krwRate = krwRatesRef.current[currency.code];
              if (!krwRate) return null;
              return (
                <TouchableOpacity
                  key={currency.code}
                  style={styles.rateRow}
                  onPress={() => {
                    setFromCurrency(currency);
                    setToCurrency(CURRENCIES[0]); // KRW
                  }}
                >
                  <Text typography="body1" style={styles.rateFlag}>{currency.flag}</Text>
                  <View style={styles.rateInfo}>
                    <Text typography="body2" fontWeight="semiBold">{currency.code}</Text>
                    <Text typography="body3" style={styles.greyText}>{currency.name}</Text>
                  </View>
                  <View style={styles.rateValue}>
                    <Text typography="body2" fontWeight="semiBold">
                      ₩ {krwRate.toFixed(2)}
                    </Text>
                    <Text typography="body3" style={styles.greyText}>
                      {currency.unit > 1 ? `1${currency.symbol} 당` : `1${currency.symbol} 당`}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        )}

        {/* 환율 추이 그래프 */}
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
          <View style={[styles.card, styles.loadingContainer]}>
            <ActivityIndicator size="small" color="#3182F6" />
            <Text typography="body3" style={[styles.greyText, { marginLeft: 8 }]}>
              추이 데이터 로드 중...
            </Text>
          </View>
        )}

        <View style={styles.disclaimer}>
          <Text typography="body3" style={styles.greyText}>
            * 한국은행 제공 매매기준율 기준이며 실제 거래 환율과 다를 수 있습니다.
          </Text>
        </View>
      </ScrollView>

      {/* 통화 선택 모달 */}
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    backgroundColor: '#3182F6',
    padding: 20,
    paddingTop: 24,
    alignItems: 'center',
  },
  headerText: {
    color: '#FFFFFF',
  },
  headerSubText: {
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 4,
  },
  content: {
    flex: 1,
  },
  card: {
    backgroundColor: '#ffffff',
    margin: 16,
    marginBottom: 0,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  currencyRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
  },
  flag: {
    fontSize: 28,
    marginRight: 12,
  },
  currencyLabel: {
    flex: 1,
  },
  inputGroup: {
    marginVertical: 8,
  },
  swapContainer: {
    alignItems: 'center',
    paddingVertical: 4,
  },
  swapButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F7FF',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#D4E8FF',
  },
  swapText: {
    color: '#3182F6',
    fontSize: 20,
  },
  resultContainer: {
    alignItems: 'center',
    paddingTop: 16,
    paddingBottom: 8,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
    marginTop: 8,
  },
  resultAmount: {
    color: '#191F28',
    marginBottom: 4,
  },
  loadingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  errorContainer: {
    alignItems: 'center',
    padding: 16,
    gap: 12,
  },
  errorText: {
    color: '#F04452',
    textAlign: 'center',
  },
  rateListHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  rateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  rateFlag: {
    fontSize: 24,
    marginRight: 12,
  },
  rateInfo: {
    flex: 1,
  },
  rateValue: {
    alignItems: 'flex-end',
  },
  disclaimer: {
    padding: 16,
    paddingBottom: 32,
  },
  greyText: {
    color: '#6B7684',
  },
  blueText: {
    color: '#3182F6',
  },
});
