import { MaterialIcons } from "@expo/vector-icons";
import type { Task } from "@state/useTasks";
import { GRAY, WHITE } from "@theme/colors";
import React from "react";
import {
  GestureResponderEvent,
  Pressable,
  StyleSheet,
  Text,
  View,
} from "react-native";
import NotificationService from "@services/notificationService";

interface Props {
  task: Task;
  onPress?: (e: GestureResponderEvent) => void;
  onDelete?: () => void;
}

export default function TaskCard({ task, onPress, onDelete }: Props) {
  return (
    <Pressable style={styles.card} onPress={onPress}>
      {/* delete button */}
      {onDelete && (
        <Pressable
          hitSlop={12}
          style={styles.close}
          accessibilityLabel="Delete task"
          onPress={(e) => {
            e.stopPropagation(); // don’t trigger card’s onPress
            onDelete();
          }}
        >
          <MaterialIcons name="close" size={20} color={GRAY} />
        </Pressable>
      )}

      <View style={styles.header}>
        <Text style={styles.title} numberOfLines={2}>{task.title}</Text>
        <Text style={styles.nextTime}>Next: {task.scheduledTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</Text>
      </View>
      
      <Text style={styles.description} numberOfLines={2}>{task.description}</Text>
      
      <View style={styles.footer}>
        <View style={styles.repeatInfo}>
          <Text style={styles.repeatIcon}>🔔</Text>
          <Text style={styles.repeatText}>
            {task.repeatType === 'none' ? 'Once' : task.repeatType}
          </Text>
        </View>
        
        <View style={styles.statusContainer}>
          <View 
            style={[
              styles.statusDot, 
              { backgroundColor: task.isEnabled ? '#34D399' : '#9CA3AF' }
            ]} 
          />
          <Text style={styles.statusText}>
            {task.isEnabled ? 'Active' : 'Paused'}
          </Text>
        </View>
      </View>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 16,
    marginVertical: 8,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  close: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  title: { 
    fontSize: 18, 
    fontWeight: '600',
    color: GRAY, 
    flex: 1,
    marginRight: 8,
  },
  nextTime: {
    fontSize: 12,
    color: '#007AFF',
    fontWeight: '500',
  },
  description: { 
    fontSize: 14, 
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  repeatInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  repeatIcon: {
    fontSize: 16,
    marginRight: 6,
  },
  repeatText: {
    fontSize: 14,
    color: '#666',
    textTransform: 'capitalize',
  },
  statusContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  statusText: {
    fontSize: 12,
    color: '#666',
    fontWeight: '500',
  },
});
