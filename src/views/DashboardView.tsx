import React, { useState } from 'react';
import { Alert, Pressable, ScrollView, Text, View, StyleSheet } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { IconSymbol } from '../../components/ui/icon-symbol';
import { useFinance } from '../viewmodels/FinanceViewModelProvider';
import { Button, Card, Input } from '../components/ui';
import { exitAppSafely } from '../utils/app-exit';

export default function DashboardView() {
  const month = new Date().toISOString().slice(0, 7);
  const { summary, setBudget } = useFinance();
  const [budget, setBudgetInput] = useState('');
  const insets = useSafeAreaInsets();

  const requestExit = () => {
    Alert.alert(
      'Thoát ứng dụng',
      'Dữ liệu sẽ được sao lưu trước khi ứng dụng đóng. Bạn có muốn tiếp tục không?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Thoát', style: 'destructive', onPress: () => { void exitAppSafely(); } },
      ],
    );
  };

  if (!summary) {
    return (
      <View style={styles.center}>
        <Text>Đang tải dữ liệu…</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.page}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 12) }]}>
        <View>
          <Text style={styles.hello}>Xin chào</Text>
          <Text style={styles.title}>Tổng quan tháng {month}</Text>
        </View>
        <Pressable
          testID="dashboard-exit-button"
          accessibilityRole="button"
          accessibilityLabel="Thoát ứng dụng"
          hitSlop={8}
          onPress={requestExit}
          style={({ pressed }) => [styles.exitButton, pressed && styles.exitPressed]}
        >
          <IconSymbol name="power.fill" size={30} color="#dc2626" />
        </Pressable>
      </View>

      <Card>
        <Text style={styles.label}>Số dư</Text>
        <Text style={styles.balance}>{summary.balance.toLocaleString('vi-VN')} đ</Text>
        <View style={styles.row}>
          <Text>Thu nhập  {summary.income.toLocaleString('vi-VN')} đ</Text>
          <Text>Chi tiêu  {summary.expense.toLocaleString('vi-VN')} đ</Text>
        </View>
      </Card>

      <Card>
        <Text style={styles.section}>Ngân sách tháng</Text>
        <Text>{summary.budgetUsed.toLocaleString('vi-VN')} / {summary.budget.toLocaleString('vi-VN')} đ</Text>
        <Input
          keyboardType="numeric"
          placeholder="Nhập ngân sách"
          value={budget}
          onChangeText={setBudgetInput}
        />
        <Button title="Cập nhật ngân sách" onPress={() => setBudget(Number(budget) || 0)} secondary />
      </Card>

      <Text style={styles.section}>Chi theo danh mục</Text>
      {Object.entries(summary.byCategory).map(([category, value]) => (
        <Card key={category}>
          <View style={styles.row}>
            <Text>{category}</Text>
            <Text style={styles.amount}>{Number(value).toLocaleString('vi-VN')} đ</Text>
          </View>
        </Card>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  page: { padding: 18, paddingBottom: 100, backgroundColor: '#f5f7fb', flexGrow: 1 },
  header: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 18 },
  exitButton: { width: 56, height: 56, borderRadius: 28, alignItems: 'center', justifyContent: 'center', backgroundColor: '#fee2e2', zIndex: 10, elevation: 6 },
  exitPressed: { opacity: 0.55, transform: [{ scale: 0.94 }] },
  hello: { color: '#63708a', fontSize: 15 },
  title: { fontSize: 24, fontWeight: '800', color: '#14213d' },
  label: { color: '#63708a' },
  balance: { fontSize: 30, fontWeight: '800', color: '#14213d', marginVertical: 8 },
  row: { flexDirection: 'row', justifyContent: 'space-between', gap: 10 },
  section: { fontSize: 18, fontWeight: '800', color: '#14213d', marginVertical: 8 },
  amount: { fontWeight: '700', color: '#e25555' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
});
