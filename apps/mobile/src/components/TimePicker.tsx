import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Modal,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import { GRAY, WHITE } from '@theme/colors';

interface TimePickerProps {
  value: Date;
  onValueChange: (date: Date) => void;
  label?: string;
}

export default function TimePicker({ value, onValueChange, label = "Time" }: TimePickerProps) {
  const [showPicker, setShowPicker] = useState(false);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit',
      hour12: true 
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString([], {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleDateChange = (event: any, selectedDate?: Date) => {
    if (Platform.OS === 'android') {
      setShowPicker(false);
    }
    
    if (selectedDate) {
      onValueChange(selectedDate);
    }
  };

  const openPicker = () => {
    setShowPicker(true);
  };

  const closePicker = () => {
    setShowPicker(false);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      
      <Pressable style={styles.pickerButton} onPress={openPicker}>
        <View style={styles.timeContainer}>
          <Text style={styles.timeText}>{formatTime(value)}</Text>
          <Text style={styles.dateText}>{formatDate(value)}</Text>
        </View>
      </Pressable>

      {Platform.OS === 'ios' ? (
        <Modal
          visible={showPicker}
          transparent={true}
          animationType="slide"
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Pressable onPress={closePicker}>
                  <Text style={styles.modalButton}>Cancel</Text>
                </Pressable>
                <Text style={styles.modalTitle}>Select Time</Text>
                <Pressable onPress={closePicker}>
                  <Text style={[styles.modalButton, styles.doneButton]}>Done</Text>
                </Pressable>
              </View>
              
              <DateTimePicker
                value={value}
                mode="datetime"
                display="wheels"
                onChange={handleDateChange}
                minimumDate={new Date()}
                style={styles.picker}
              />
            </View>
          </View>
        </Modal>
      ) : (
        showPicker && (
          <DateTimePicker
            value={value}
            mode="datetime"
            display="default"
            onChange={handleDateChange}
            minimumDate={new Date()}
          />
        )
      )}
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
    marginBottom: 8,
  },
  pickerButton: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  timeContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  timeText: {
    fontSize: 18,
    fontWeight: '600',
    color: GRAY,
  },
  dateText: {
    fontSize: 14,
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: WHITE,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34, // Safe area bottom
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: GRAY,
  },
  modalButton: {
    fontSize: 16,
    color: '#007AFF',
  },
  doneButton: {
    fontWeight: '600',
  },
  picker: {
    backgroundColor: WHITE,
  },
});