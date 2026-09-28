import React from 'react';
import { Pressable, Text, TextInput, View, StyleSheet } from 'react-native';

export const Card = ({ children }: { children: React.ReactNode }) => (
  <View style={styles.card}>{children}</View>
);

export const Button = ({
  title,
  onPress,
  secondary = false,
  danger = false,
}: {
  title: string;
  onPress: () => void;
  secondary?: boolean;
  danger?: boolean;
}) => (
  <Pressable
    onPress={onPress}
    style={[styles.button, secondary && styles.secondary, danger && styles.danger]}
  >
    <Text style={[styles.buttonText, (secondary || danger) && styles.darkButtonText]}>{title}</Text>
  </Pressable>
);

export const Input = (props: any) => (
  <TextInput {...props} placeholderTextColor="#91a0b7" style={[styles.input, props.style]} />
);

export const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#0b1930',
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  button: {
    backgroundColor: '#246bfe',
    padding: 14,
    borderRadius: 14,
    alignItems: 'center',
    marginVertical: 6,
  },
  secondary: { backgroundColor: '#e8eefc' },
  danger: { backgroundColor: '#fee2e2' },
  buttonText: { color: '#fff', fontWeight: '700' },
  darkButtonText: { color: '#1e3a8a' },
  input: {
    backgroundColor: '#f0f4fa',
    borderRadius: 12,
    padding: 12,
    marginVertical: 5,
    color: '#14213d',
  },
});
