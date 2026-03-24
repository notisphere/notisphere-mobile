import * as Notifications from 'expo-notifications';
import { Platform } from 'react-native';

Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowBanner: true,
    shouldShowList: true,
    shouldPlaySound: false,
    shouldSetBadge: false,
  }),
});

export const initNotifications = async () => {
  const { status } = await Notifications.requestPermissionsAsync();

  if (status !== 'granted') {
    throw new Error('Разрешение на уведомления не выдано');
  }

  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('reminders', {
      name: 'Напоминания',
      importance: Notifications.AndroidImportance.HIGH,
    });
  }
};

export const scheduleNoteReminder = async ({
                                             noteId,
                                             title,
                                             body,
                                             triggerDate,
                                           }: {
  noteId: number;
  title: string;
  body?: string;
  triggerDate: Date;
}) => {
  return Notifications.scheduleNotificationAsync({
    content: {
      title: title || 'Напоминание',
      body: body || 'Пора открыть заметку',
      data: { noteId },
      sound: true,
    },
    trigger: {
      type: Notifications.SchedulableTriggerInputTypes.DATE,
      date: triggerDate,
      channelId: 'reminders',
    },
  });
};

export const cancelReminder = async (notificationId: string) => {
  await Notifications.cancelScheduledNotificationAsync(notificationId);
};
