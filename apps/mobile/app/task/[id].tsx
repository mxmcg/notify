import PrimaryButton from "@components/PrimaryButton";
import TimePicker from "@components/TimePicker";
import RepeatSelector from "@components/RepeatSelector";
import { useTasks } from "@state/useTasks";
import { BG, GRAY, WHITE } from "@theme/colors";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  Switch,
  Alert,
} from "react-native";
import NotificationService from "@services/notificationService";

export default function TaskDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { tasks, update, remove } = useTasks();
  const task = tasks.find((t) => t.id === id);

  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [scheduledTime, setScheduledTime] = useState(task?.scheduledTime || new Date());
  const [repeatType, setRepeatType] = useState<'none' | 'daily' | 'weekly' | 'monthly'>(task?.repeatType || 'none');
  const [isEnabled, setIsEnabled] = useState(task?.isEnabled ?? true);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    if (task && !isInitialized) {
      setTitle(task.title);
      setDescription(task.description);
      setScheduledTime(task.scheduledTime);
      setRepeatType(task.repeatType);
      setIsEnabled(task.isEnabled);
      setIsInitialized(true);
    }
  }, [task, isInitialized]);

  if (!task) {
    // if task was deleted, just pop back
    router.back();
    return null;
  }

  const handleSave = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert('Missing Information', 'Please fill in both title and description.');
      return;
    }

    // Cancel existing notification if it exists
    if (task.notificationId) {
      await NotificationService.cancelNotification(task.notificationId);
    }

    // Schedule new notification if enabled
    let newNotificationId = null;
    if (isEnabled) {
      newNotificationId = await NotificationService.scheduleNotification({
        title: title.trim(),
        description: description.trim(),
        scheduledTime,
        repeatType,
      });
    }

    // Update the task
    const updatedTask = {
      ...task,
      title: title.trim(),
      description: description.trim(),
      scheduledTime,
      repeatType,
      isEnabled,
      notificationId: newNotificationId,
    };

    update(updatedTask);
    
    Alert.alert(
      'Reminder Updated!',
      isEnabled 
        ? `Your notification is updated for ${scheduledTime.toLocaleString()}`
        : 'Your reminder has been paused'
    );
    
    router.back();
  };

  const handleDelete = async () => {
    Alert.alert(
      'Delete Reminder',
      'Are you sure you want to delete this reminder?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            // Cancel notification
            if (task.notificationId) {
              await NotificationService.cancelNotification(task.notificationId);
            }
            remove(task.id);
            router.back();
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.content}
      >
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Edit Reminder</Text>
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Title</Text>
          <TextInput
            style={styles.textInput}
            value={title}
            onChangeText={setTitle}
            placeholder="What should I remind you about?"
            placeholderTextColor="#999"
          />
        </View>

        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Description</Text>
          <TextInput
            style={[styles.textInput, styles.multilineInput]}
            value={description}
            onChangeText={setDescription}
            placeholder="Add more details about this reminder..."
            placeholderTextColor="#999"
            multiline
            numberOfLines={3}
          />
        </View>

        <TimePicker
          value={scheduledTime}
          onValueChange={setScheduledTime}
          label="When"
        />

        <RepeatSelector
          value={repeatType}
          onValueChange={setRepeatType}
          label="Repeat"
        />

        <View style={styles.switchContainer}>
          <Text style={styles.switchLabel}>Active</Text>
          <Switch
            value={isEnabled}
            onValueChange={setIsEnabled}
            trackColor={{ false: '#767577', true: '#81b0ff' }}
            thumbColor={isEnabled ? '#007AFF' : '#f4f3f4'}
          />
        </View>

        <View style={styles.buttons}>
          <PrimaryButton 
            label="Save Changes" 
            onPress={handleSave}
            disabled={!title.trim() || !description.trim()}
          />
          <PrimaryButton 
            label="Delete Reminder" 
            onPress={handleDelete}
          />
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: BG 
  },
  content: { 
    flex: 1, 
    paddingHorizontal: 24, 
    paddingTop: 20 
  },
  header: {
    paddingBottom: 24,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: GRAY,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: GRAY,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: GRAY,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: 'top',
  },
  switchContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  switchLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: GRAY,
  },
  buttons: { 
    marginTop: 24,
    gap: 12,
  },
});
