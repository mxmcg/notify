import messaging from '@react-native-firebase/messaging';
import notifee, { 
  AndroidImportance, 
  AndroidStyle, 
  RepeatFrequency, 
  TimestampTrigger, 
  TriggerType 
} from '@notifee/react-native';
import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface ScheduleNotificationParams {
  title: string;
  description: string;
  scheduledTime: Date;
  repeatType: 'none' | 'daily' | 'weekly' | 'monthly';
}

class NotificationService {
  private static instance: NotificationService;
  private hasPermission = false;

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().requestPermission();
        const enabled =
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL;
        
        if (enabled) {
          await messaging().registerDeviceForRemoteMessages();
        }
        
        this.hasPermission = enabled;
        await AsyncStorage.setItem('notificationPermission', enabled.toString());
        return enabled;
      } else {
        // Android doesn't need explicit permission for notifications
        this.hasPermission = true;
        await AsyncStorage.setItem('notificationPermission', 'true');
        return true;
      }
    } catch (error) {
      console.error('Failed to request permissions:', error);
      return false;
    }
  }

  async checkPermissions(): Promise<boolean> {
    try {
      if (Platform.OS === 'ios') {
        const authStatus = await messaging().hasPermission();
        this.hasPermission = (
          authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
          authStatus === messaging.AuthorizationStatus.PROVISIONAL
        );
      } else {
        this.hasPermission = true;
      }
      
      // Also check stored permission
      const storedPermission = await AsyncStorage.getItem('notificationPermission');
      
      return this.hasPermission && storedPermission === 'true';
    } catch (error) {
      console.error('Failed to check permissions:', error);
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
      return token;
    } catch (error) {
      console.error('Failed to get FCM token:', error);
      return null;
    }
  }

  async createNotificationChannel() {
    if (Platform.OS === 'android') {
      await notifee.createChannel({
        id: 'reminders',
        name: 'Task Reminders',
        importance: AndroidImportance.HIGH,
        sound: 'default',
      });
    }
  }

  async scheduleNotification(params: ScheduleNotificationParams): Promise<string | null> {
    try {
      if (!this.hasPermission) {
        const granted = await this.requestPermissions();
        if (!granted) {
          throw new Error('Notification permissions not granted');
        }
      }

      await this.createNotificationChannel();

      const trigger: TimestampTrigger = {
        type: TriggerType.TIMESTAMP,
        timestamp: params.scheduledTime.getTime(),
      };

      // Set repeat interval based on repeatType
      if (params.repeatType !== 'none') {
        switch (params.repeatType) {
          case 'daily':
            trigger.repeatFrequency = RepeatFrequency.DAILY;
            break;
          case 'weekly':
            trigger.repeatFrequency = RepeatFrequency.WEEKLY;
            break;
          case 'monthly':
            // Notifee doesn't have monthly, so we'll use interval
            trigger.repeatFrequency = RepeatFrequency.NONE;
            // We'll need to handle monthly repeats differently
            break;
        }
      }

      const notificationId = await notifee.createTriggerNotification(
        {
          title: params.title,
          body: params.description,
          android: {
            channelId: 'reminders',
            importance: AndroidImportance.HIGH,
            pressAction: {
              id: 'default',
            },
            style: {
              type: AndroidStyle.BIGTEXT,
              text: params.description,
            },
          },
          ios: {
            categoryId: 'reminder',
            sound: 'default',
          },
        },
        trigger
      );

      console.log('Notification scheduled with ID:', notificationId);
      return notificationId;
    } catch (error) {
      console.error('Failed to schedule notification:', error);
      return null;
    }
  }

  async cancelNotification(notificationId: string): Promise<void> {
    try {
      await notifee.cancelNotification(notificationId);
      console.log('Notification cancelled:', notificationId);
    } catch (error) {
      console.error('Failed to cancel notification:', error);
    }
  }

  async cancelAllNotifications(): Promise<void> {
    try {
      await notifee.cancelAllNotifications();
      console.log('All notifications cancelled');
    } catch (error) {
      console.error('Failed to cancel all notifications:', error);
    }
  }

  async getScheduledNotifications(): Promise<string[]> {
    try {
      const notifications = await notifee.getTriggerNotificationIds();
      return notifications;
    } catch (error) {
      console.error('Failed to get scheduled notifications:', error);
      return [];
    }
  }

  // Set up listeners for remote notifications
  setupRemoteNotificationListeners() {
    // Handle background messages
    messaging().setBackgroundMessageHandler(async remoteMessage => {
      console.log('Message handled in the background!', remoteMessage);
      
      // Display a local notification
      await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'New Message',
        body: remoteMessage.notification?.body || '',
        android: {
          channelId: 'reminders',
          importance: AndroidImportance.HIGH,
        },
      });
    });

    // Handle foreground messages
    const unsubscribe = messaging().onMessage(async remoteMessage => {
      console.log('A new FCM message arrived!', remoteMessage);
      
      // Display a local notification when app is in foreground
      await notifee.displayNotification({
        title: remoteMessage.notification?.title || 'New Message',
        body: remoteMessage.notification?.body || '',
        android: {
          channelId: 'reminders',
          importance: AndroidImportance.HIGH,
        },
      });
    });

    return unsubscribe;
  }

  // Handle notification interactions
  setupNotificationHandlers() {
    // Handle foreground notification events
    notifee.onForegroundEvent(({ type, detail }) => {
      console.log('Foreground notification event:', type, detail);
    });

    // Handle background notification events
    notifee.onBackgroundEvent(async ({ type, detail }) => {
      console.log('Background notification event:', type, detail);
    });
  }

  // Helper method to format next notification time
  getNextNotificationTime(scheduledTime: Date, repeatType: string): Date {
    const now = new Date();
    let nextTime = new Date(scheduledTime);

    if (repeatType === 'none') {
      return nextTime > now ? nextTime : new Date(now.getTime() + 60000); // 1 minute from now if in past
    }

    // Find the next occurrence
    while (nextTime <= now) {
      switch (repeatType) {
        case 'daily':
          nextTime.setDate(nextTime.getDate() + 1);
          break;
        case 'weekly':
          nextTime.setDate(nextTime.getDate() + 7);
          break;
        case 'monthly':
          nextTime.setMonth(nextTime.getMonth() + 1);
          break;
      }
    }

    return nextTime;
  }
}

export default NotificationService.getInstance();