// src/utils/confirm.ts
import { Alert, Platform } from 'react-native';

export const confirmAction = (title: string, message: string, onConfirm: () => void) => {
  if (Platform.OS === 'web') {
    // 👇 Для веба используем нативный confirm
    const confirmed = window.confirm(`${title}\n\n${message}`);
    if (confirmed) {
      onConfirm();
    }
  } else {
    // 👇 Для iOS/Android используем Alert
    Alert.alert(title, message, [
      { text: 'Отмена', style: 'cancel' },
      {
        text: 'Удалить',
        style: 'destructive',
        onPress: onConfirm,
      },
    ]);
  }
};
