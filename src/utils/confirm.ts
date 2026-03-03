// Core
import { Alert, Platform } from 'react-native';

/** Подтверждение действия в приложении (показ алерта в зависимости от платформы приложения) */
export const confirmAction = (title: string, message: string, onConfirm: () => void) => {
  if (Platform.OS === 'web') {
    const confirmed = window.confirm(`${title}\n\n${message}`);
    if (confirmed) {
      onConfirm();
    }
  } else {
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
