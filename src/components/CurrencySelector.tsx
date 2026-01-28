import React from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView, Modal } from 'react-native';
import { Text } from '@toss/tds-react-native';
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
  const filteredCurrencies = excludeCurrency
    ? CURRENCIES.filter((c) => c.code !== excludeCurrency)
    : CURRENCIES;

  return (
    <Modal visible={visible} transparent animationType="slide">
      <View style={styles.overlay}>
        <View style={styles.sheet}>
          <View style={styles.handle} />
          <Text typography="h6" fontWeight="bold" style={styles.title}>
            통화 선택
          </Text>
          <ScrollView>
            {filteredCurrencies.map((currency) => (
              <TouchableOpacity
                key={currency.code}
                style={[
                  styles.currencyItem,
                  selectedCurrency === currency.code && styles.selectedItem,
                ]}
                onPress={() => {
                  onSelect(currency);
                  onClose();
                }}
              >
                <Text typography="body1" style={styles.flag}>
                  {currency.flag}
                </Text>
                <View style={styles.currencyInfo}>
                  <Text
                    typography="body1"
                    fontWeight={selectedCurrency === currency.code ? 'bold' : 'regular'}
                  >
                    {currency.code}
                  </Text>
                  <Text typography="body3" style={styles.greyText}>
                    {currency.name}
                  </Text>
                </View>
                {selectedCurrency === currency.code && (
                  <Text typography="body1" style={styles.checkmark}>
                    ✓
                  </Text>
                )}
              </TouchableOpacity>
            ))}
          </ScrollView>
          <TouchableOpacity style={styles.closeButton} onPress={onClose}>
            <Text typography="body1" fontWeight="bold" style={styles.closeText}>
              닫기
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  sheet: {
    backgroundColor: '#ffffff',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '70%',
    padding: 20,
  },
  handle: {
    width: 40,
    height: 4,
    backgroundColor: '#d1d5db',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  title: {
    marginBottom: 16,
  },
  currencyItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    borderRadius: 12,
    marginBottom: 4,
  },
  selectedItem: {
    backgroundColor: '#F0F7FF',
  },
  flag: {
    fontSize: 28,
    marginRight: 12,
  },
  currencyInfo: {
    flex: 1,
  },
  greyText: {
    color: '#6B7684',
    marginTop: 2,
  },
  checkmark: {
    color: '#3182F6',
    fontSize: 20,
  },
  closeButton: {
    backgroundColor: '#f5f5f5',
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 12,
  },
  closeText: {
    color: '#191F28',
  },
});
