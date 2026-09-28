import React, { useState } from 'react';
import { Alert, FlatList, Text, View, StyleSheet } from 'react-native';

import { useFinance } from '../viewmodels/FinanceViewModelProvider';
import { Button, Card, Input } from '../components/ui';
import { CATEGORIES, Transaction } from '../models/finance';

export default function TransactionsView() {
  const { items, save, remove } = useFinance();
  const [query, setQuery] = useState('');
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [type, setType] = useState<'income' | 'expense'>('expense');
  const [category, setCategory] = useState<string>(CATEGORIES[0]);
  const [editingId, setEditingId] = useState<string | null>(null);

  const resetForm = () => {
    setAmount('');
    setNote('');
    setType('expense');
    setCategory(CATEGORIES[0]);
    setEditingId(null);
  };

  const startEdit = (item: Transaction) => {
    setEditingId(item.id);
    setAmount(String(item.amount));
    setNote(item.note);
    setType(item.type);
    setCategory(item.category);
  };

  const submit = async () => {
    const value = Number(amount.replace(',', '.'));
    if (!Number.isFinite(value) || value <= 0) {
      Alert.alert('Dữ liệu chưa hợp lệ', 'Số tiền phải lớn hơn 0.');
      return;
    }
    if (!category.trim()) {
      Alert.alert('Dữ liệu chưa hợp lệ', 'Vui lòng nhập danh mục.');
      return;
    }

    const now = new Date().toISOString();
    const previous = editingId ? items.find((item) => item.id === editingId) : undefined;
    const item: Transaction = {
      id: editingId ?? `tx-${Date.now()}`,
      amount: value,
      type,
      category: category.trim(),
      note: note.trim(),
      date: previous?.date ?? now.slice(0, 10),
      createdAt: previous?.createdAt ?? now,
    };

    await save(item);
    resetForm();
  };

  const confirmRemove = (item: Transaction) => {
    Alert.alert(
      'Xóa giao dịch?',
      `${item.category} · ${item.amount.toLocaleString('vi-VN')} đ sẽ bị xóa.`,
      [
        { text: 'Hủy', style: 'cancel' },
        {
          text: 'Xóa',
          style: 'destructive',
          onPress: async () => {
            await remove(item.id);
            if (editingId === item.id) resetForm();
          },
        },
      ],
    );
  };

  const filtered = items.filter((item) =>
    `${item.note} ${item.category}`.toLowerCase().includes(query.toLowerCase()),
  );

  return (
    <View style={styles.page}>
      <Card>
        <Text style={styles.formTitle}>{editingId ? 'Sửa giao dịch' : 'Thêm giao dịch'}</Text>
        <View style={styles.row}>
          <Button title="Khoản chi" onPress={() => setType('expense')} secondary={type !== 'expense'} />
          <Button title="Khoản thu" onPress={() => setType('income')} secondary={type !== 'income'} />
        </View>
        <Input keyboardType="numeric" placeholder="Số tiền" value={amount} onChangeText={setAmount} />
        <Input placeholder="Ghi chú" value={note} onChangeText={setNote} />
        <Input placeholder={`Danh mục: ${category}`} value={category} onChangeText={setCategory} />
        <Button title={editingId ? 'Cập nhật giao dịch' : 'Lưu giao dịch'} onPress={submit} />
        {editingId ? <Button title="Hủy sửa" onPress={resetForm} secondary /> : null}
      </Card>

      <Input placeholder="Tìm giao dịch…" value={query} onChangeText={setQuery} />
      <FlatList
        data={filtered}
        keyExtractor={(item) => item.id}
        ListEmptyComponent={<Text style={styles.empty}>Chưa có giao dịch trong tháng này.</Text>}
        renderItem={({ item }) => (
          <Card>
            <View style={styles.row}>
              <View style={styles.details}>
                <Text style={styles.category}>{item.category}</Text>
                <Text style={styles.note}>{item.note || 'Không có ghi chú'} · {item.date}</Text>
              </View>
              <Text style={item.type === 'income' ? styles.income : styles.expense}>
                {item.type === 'income' ? '+' : '-'}{item.amount.toLocaleString('vi-VN')} đ
              </Text>
            </View>
            <View style={styles.actions}>
              <Button title="Sửa" onPress={() => startEdit(item)} secondary />
              <Button title="Xóa" onPress={() => confirmRemove(item)} danger />
            </View>
          </Card>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  page: { flex: 1, backgroundColor: '#f5f7fb', padding: 16 },
  row: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', gap: 8 },
  details: { flex: 1 },
  actions: { flexDirection: 'row', gap: 8, marginTop: 6 },
  formTitle: { fontWeight: '800', fontSize: 18, color: '#14213d' },
  category: { fontWeight: '800', color: '#14213d' },
  note: { color: '#77839a', marginTop: 4 },
  income: { color: '#159a63', fontWeight: '800' },
  expense: { color: '#e25555', fontWeight: '800' },
  empty: { textAlign: 'center', color: '#77839a', marginTop: 40 },
});
