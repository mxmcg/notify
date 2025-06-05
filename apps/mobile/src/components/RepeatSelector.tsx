import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Pressable,
} from 'react-native';
import { GRAY, WHITE } from '@theme/colors';

interface RepeatSelectorProps {
  value: 'none' | 'daily' | 'weekly' | 'monthly';
  onValueChange: (value: 'none' | 'daily' | 'weekly' | 'monthly') => void;
  label?: string;
}

const REPEAT_OPTIONS = [
  { value: 'none' as const, label: 'Once', description: 'Send notification once' },
  { value: 'daily' as const, label: 'Daily', description: 'Repeat every day' },
  { value: 'weekly' as const, label: 'Weekly', description: 'Repeat every week' },
  { value: 'monthly' as const, label: 'Monthly', description: 'Repeat every month' },
];

export default function RepeatSelector({ 
  value, 
  onValueChange, 
  label = "Repeat" 
}: RepeatSelectorProps) {
  
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <ScrollView 
        horizontal 
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.optionsContainer}
      >
        {REPEAT_OPTIONS.map((option) => (
          <Pressable
            key={option.value}
            style={[
              styles.option,
              value === option.value && styles.selectedOption
            ]}
            onPress={() => onValueChange(option.value)}
          >
            <Text 
              style={[
                styles.optionLabel,
                value === option.value && styles.selectedOptionLabel
              ]}
            >
              {option.label}
            </Text>
            <Text 
              style={[
                styles.optionDescription,
                value === option.value && styles.selectedOptionDescription
              ]}
            >
              {option.description}
            </Text>
          </Pressable>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: GRAY,
    marginBottom: 12,
  },
  optionsContainer: {
    paddingHorizontal: 4,
  },
  option: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 16,
    marginRight: 12,
    minWidth: 100,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
    borderWidth: 2,
    borderColor: 'transparent',
  },
  selectedOption: {
    borderColor: '#007AFF',
    backgroundColor: '#F0F8FF',
  },
  optionLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: GRAY,
    textAlign: 'center',
    marginBottom: 4,
  },
  selectedOptionLabel: {
    color: '#007AFF',
  },
  optionDescription: {
    fontSize: 12,
    color: '#666',
    textAlign: 'center',
  },
  selectedOptionDescription: {
    color: '#007AFF',
  },
});