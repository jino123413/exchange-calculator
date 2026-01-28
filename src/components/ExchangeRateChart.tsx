import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { Text } from '@toss/tds-react-native';

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
    <View style={styles.container}>
      <View style={styles.header}>
        <Text typography="h6" fontWeight="bold">
          환율 추이
        </Text>
        <View style={styles.periodButtons}>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 7 && styles.activePeriod]}
            onPress={() => onPeriodChange(7)}
          >
            <Text
              typography="body3"
              fontWeight={selectedPeriod === 7 ? 'bold' : 'regular'}
              style={selectedPeriod === 7 ? styles.activePeriodText : styles.inactivePeriodText}
            >
              7일
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.periodButton, selectedPeriod === 30 && styles.activePeriod]}
            onPress={() => onPeriodChange(30)}
          >
            <Text
              typography="body3"
              fontWeight={selectedPeriod === 30 ? 'bold' : 'regular'}
              style={selectedPeriod === 30 ? styles.activePeriodText : styles.inactivePeriodText}
            >
              30일
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.changeInfo}>
        <Text typography="body2" style={styles.greyText}>
          {fromCurrency} → {toCurrency} 변동
        </Text>
        <Text
          typography="body1"
          fontWeight="bold"
          style={isUp ? styles.redText : styles.blueText}
        >
          {isUp ? '▲' : '▼'} {Math.abs(changePercent).toFixed(2)}%
        </Text>
      </View>

      {/* 라인 차트 (CSS 기반) */}
      <View style={styles.chartArea}>
        {/* Y축 라벨 */}
        <View style={styles.yAxis}>
          <Text typography="body3" style={styles.axisText}>
            {maxRate.toFixed(1)}
          </Text>
          <Text typography="body3" style={styles.axisText}>
            {((maxRate + minRate) / 2).toFixed(1)}
          </Text>
          <Text typography="body3" style={styles.axisText}>
            {minRate.toFixed(1)}
          </Text>
        </View>

        {/* 바 차트 */}
        <View style={styles.barsContainer}>
          {data.map((point, index) => {
            const height = ((point.rate - minRate) / range) * 100;
            const isLast = index === data.length - 1;

            return (
              <View key={index} style={styles.barWrapper}>
                <View style={styles.barBackground}>
                  <View
                    style={[
                      styles.bar,
                      {
                        height: `${Math.max(height, 5)}%`,
                        backgroundColor: isLast ? '#3182F6' : isUp ? '#FFB0B0' : '#B0D4FF',
                      },
                    ]}
                  />
                </View>
                {(index === 0 || isLast || (selectedPeriod === 30 && index % 5 === 0)) && (
                  <Text typography="body3" style={styles.xLabel}>
                    {point.date}
                  </Text>
                )}
              </View>
            );
          })}
        </View>
      </View>

      <View style={styles.rangeInfo}>
        <View style={styles.rangeItem}>
          <Text typography="body3" style={styles.greyText}>최저</Text>
          <Text typography="body3" fontWeight="semiBold">{minRate.toFixed(2)}</Text>
        </View>
        <View style={styles.rangeItem}>
          <Text typography="body3" style={styles.greyText}>최고</Text>
          <Text typography="body3" fontWeight="semiBold">{maxRate.toFixed(2)}</Text>
        </View>
        <View style={styles.rangeItem}>
          <Text typography="body3" style={styles.greyText}>변동폭</Text>
          <Text typography="body3" fontWeight="semiBold">{(maxRate - minRate).toFixed(2)}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: '#ffffff',
    margin: 16,
    padding: 20,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  periodButtons: {
    flexDirection: 'row',
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    padding: 2,
  },
  periodButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 6,
  },
  activePeriod: {
    backgroundColor: '#ffffff',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  activePeriodText: {
    color: '#191F28',
  },
  inactivePeriodText: {
    color: '#6B7684',
  },
  changeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  chartArea: {
    flexDirection: 'row',
    height: 160,
    marginBottom: 16,
  },
  yAxis: {
    width: 44,
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  axisText: {
    color: '#6B7684',
    fontSize: 10,
  },
  barsContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingBottom: 20,
  },
  barWrapper: {
    flex: 1,
    alignItems: 'center',
    height: '100%',
    justifyContent: 'flex-end',
  },
  barBackground: {
    width: '60%',
    flex: 1,
    justifyContent: 'flex-end',
  },
  bar: {
    width: '100%',
    borderTopLeftRadius: 2,
    borderTopRightRadius: 2,
    minHeight: 4,
  },
  xLabel: {
    color: '#6B7684',
    fontSize: 9,
    marginTop: 4,
    position: 'absolute',
    bottom: 0,
  },
  rangeInfo: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#f0f0f0',
  },
  rangeItem: {
    alignItems: 'center',
  },
  greyText: {
    color: '#6B7684',
  },
  redText: {
    color: '#F04452',
  },
  blueText: {
    color: '#3182F6',
  },
});
