import PrimaryButton from "@components/PrimaryButton";
import TaskCard from "@components/TaskCard";
import TimePicker from "@components/TimePicker";
import RepeatSelector from "@components/RepeatSelector";
import { useTasks } from "@state/useTasks";
import { BG, GRAY, WHITE } from "@theme/colors";
import { useRouter } from "expo-router";
import React, { useState, useEffect } from "react";
import {
  ActivityIndicator,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StyleSheet,
  Text,
  TextInput,
  View,
  Alert,
} from "react-native";
import NotificationService from "@services/notificationService";

export default function HomeScreen() {
  const router = useRouter();
  const { tasks, add, remove, isLoading, error, isCreating } = useTasks();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [scheduledTime, setScheduledTime] = useState(
    new Date(Date.now() + 60 * 60 * 1000)
  ); // 1 hour from now
  const [repeatType, setRepeatType] = useState<
    "none" | "daily" | "weekly" | "monthly"
  >("none");
  const [hasNotificationPermission, setHasNotificationPermission] =
    useState(false);

  useEffect(() => {
    checkNotificationPermissions();
    setupNotificationListeners();
  }, []);

  const checkNotificationPermissions = async () => {
    const hasPermission = await NotificationService.checkPermissions();
    setHasNotificationPermission(hasPermission);
  };

  const setupNotificationListeners = () => {
    // Set up notification handlers
    NotificationService.setupNotificationHandlers();
    
    // Set up remote notification listeners
    const unsubscribe = NotificationService.setupRemoteNotificationListeners();
    
    return () => {
      if (unsubscribe) {
        unsubscribe();
      }
    };
  };

  const requestNotificationPermission = async () => {
    const granted = await NotificationService.requestPermissions();
    setHasNotificationPermission(granted);

    if (!granted) {
      Alert.alert(
        "Permission Required",
        "Notifications are required to remind you about your tasks. Please enable them in Settings.",
        [{ text: "OK" }]
      );
    }
  };

  const handleAdd = async () => {
    if (!title.trim() || !description.trim()) {
      Alert.alert(
        "Missing Information",
        "Please fill in both title and description."
      );
      return;
    }

    if (!hasNotificationPermission) {
      await requestNotificationPermission();
      if (!hasNotificationPermission) return;
    }

    const newTask = {
      title: title.trim(),
      description: description.trim(),
      scheduledTime,
      repeatType,
      isEnabled: true,
    };

    // Schedule the notification
    const notificationId = await NotificationService.scheduleNotification({
      title: newTask.title,
      description: newTask.description,
      scheduledTime: newTask.scheduledTime,
      repeatType: newTask.repeatType,
    });

    if (notificationId) {
      add(newTask);
      setTitle("");
      setDescription("");
      setScheduledTime(new Date(Date.now() + 60 * 60 * 1000));
      setRepeatType("none");

      Alert.alert(
        "Task Created!",
        `Your notification is scheduled for ${scheduledTime.toLocaleString()}`
      );
    } else {
      Alert.alert(
        "Error",
        "Failed to schedule notification. Please try again."
      );
    }
  };

  if (isLoading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <ActivityIndicator size="large" color={GRAY} />
          <Text style={styles.emptyText}>Loading notifications...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.empty}>
          <Text style={styles.errorText}>Failed to load notifications</Text>
          <Text style={styles.emptyText}>
            Check your connection and try again
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Smart Reminders</Text>
        <Text style={styles.headerSubtitle}>
          Schedule personalized notifications
        </Text>
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : undefined}
        style={styles.formContainer}
      >
        <View style={styles.inputContainer}>
          <Text style={styles.inputLabel}>Reminder Title</Text>
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

        {!hasNotificationPermission && (
          <View style={styles.permissionWarning}>
            <Text style={styles.permissionText}>
              📱 Notification permission required to send reminders
            </Text>
          </View>
        )}

        <PrimaryButton
          label={isCreating ? "Creating..." : "Create Reminder"}
          onPress={handleAdd}
          disabled={isCreating || !title.trim() || !description.trim()}
        />
      </KeyboardAvoidingView>

      {tasks.length > 0 && (
        <View style={styles.tasksSection}>
          <Text style={styles.sectionTitle}>Your Reminders</Text>
          <FlatList
            data={tasks}
            keyExtractor={(item) => item.id}
            showsVerticalScrollIndicator={false}
            renderItem={({ item }) => (
              <TaskCard
                task={item}
                onDelete={() => remove(item.id)}
                onPress={() =>
                  router.push({
                    pathname: "task/[id]",
                    params: { id: item.id },
                  })
                }
              />
            )}
          />
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 20,
    paddingBottom: 24,
    backgroundColor: WHITE,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 2 },
    elevation: 2,
  },
  headerTitle: {
    fontSize: 28,
    fontWeight: "bold",
    color: GRAY,
    marginBottom: 4,
  },
  headerSubtitle: {
    fontSize: 16,
    color: "#666",
  },
  empty: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyText: {
    fontSize: 16,
    color: GRAY,
    textAlign: "center",
  },
  errorText: {
    fontSize: 18,
    color: "#ff4444",
    marginBottom: 8,
    textAlign: "center",
  },
  formContainer: {
    paddingHorizontal: 24,
    paddingVertical: 24,
  },
  inputContainer: {
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: "600",
    color: GRAY,
    marginBottom: 8,
  },
  textInput: {
    backgroundColor: WHITE,
    borderRadius: 12,
    padding: 16,
    fontSize: 16,
    color: GRAY,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
    elevation: 2,
  },
  multilineInput: {
    height: 80,
    textAlignVertical: "top",
  },
  permissionWarning: {
    backgroundColor: "#FFF3CD",
    borderRadius: 8,
    padding: 12,
    marginBottom: 20,
  },
  permissionText: {
    fontSize: 14,
    color: "#856404",
    textAlign: "center",
  },
  tasksSection: {
    flex: 1,
    paddingHorizontal: 24,
    paddingTop: 20,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: GRAY,
    marginBottom: 16,
  },
});
