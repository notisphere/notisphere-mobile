// Hooks
import { useMemo, useState } from 'react';

// Core
import { View, Text, TextInput, Pressable, StyleSheet, Alert } from 'react-native';

// Theme
import { useColors } from '@/src/theme/useColors';

// Auth
import { login, register } from '@/src/firebase/auth';

export const AuthScreen = () => {
  const colors = useColors();
  const styles = useMemo(() => makeStyles(colors), [colors]);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isRegister, setIsRegister] = useState(false);

  const handleSubmit = async () => {
    try {
      if (isRegister) {
        await register(email, password);
        Alert.alert('Успех', 'Аккаунт создан');
        setIsRegister(false);
      } else {
        await login(email, password);
      }
    } catch (e: any) {
      Alert.alert('Ошибка', e.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{isRegister ? 'Регистрация' : 'Вход'}</Text>

      <Text style={styles.label}>Email</Text>
      <TextInput
        value={email}
        onChangeText={setEmail}
        placeholder="Введите email"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        autoCapitalize="none"
      />

      <Text style={styles.label}>Пароль</Text>
      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Введите пароль"
        placeholderTextColor={colors.textMuted}
        style={styles.input}
        secureTextEntry
      />

      <Pressable
        onPress={handleSubmit}
        style={({ pressed }) => [styles.button, pressed && { opacity: 0.7 }]}
      >
        <Text style={styles.buttonText}>{isRegister ? 'Создать аккаунт' : 'Войти'}</Text>
      </Pressable>

      <View style={styles.switchRow}>
        <Text style={styles.switchText}>{isRegister ? 'Уже есть аккаунт?' : 'Нет аккаунта?'}</Text>

        <Pressable onPress={() => setIsRegister(!isRegister)}>
          <Text style={styles.switchLink}>{isRegister ? 'Войти' : 'Зарегистрироваться'}</Text>
        </Pressable>
      </View>
    </View>
  );
};

const makeStyles = (c: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 20,
      justifyContent: 'center',
      backgroundColor: c.bg,
    },
    title: {
      fontSize: 26,
      fontWeight: '800',
      marginBottom: 28,
      color: c.text,
      textAlign: 'center',
    },
    label: {
      marginBottom: 6,
      color: c.textMuted,
    },
    input: {
      borderWidth: 1,
      borderColor: c.textMuted,
      borderRadius: 12,
      padding: 12,
      marginBottom: 16,
      color: c.text,
      backgroundColor: c.surface,
    },
    button: {
      backgroundColor: c.text,
      padding: 14,
      borderRadius: 12,
      alignItems: 'center',
      marginTop: 8,
    },
    buttonText: {
      color: c.bg,
      fontWeight: '700',
      fontSize: 15,
    },
    switchRow: {
      marginTop: 18,
      flexDirection: 'row',
      justifyContent: 'center',
      gap: 6,
    },
    switchText: {
      color: c.textMuted,
    },
    switchLink: {
      color: c.text,
      fontWeight: '700',
    },
  });
