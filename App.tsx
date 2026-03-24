// Navigation
import {DarkTheme, DefaultTheme, NavigationContainer} from '@react-navigation/native';
// Components
import { RootNavigator } from '@/src/navigation/root-navigator';
// Hooks
import { useAppInitialization } from '@/src/db/useAppInitialization';
import { View, ActivityIndicator } from 'react-native';
import { AppSettingsProvider, useAppSettings } from "@/src/theme/AppSettingsContext";
import { useEffect } from "react";
// Notifications
import { initNotifications } from "@/src/services/notifications";

export default function App() {
  const { isLoading, error, appSettings, isInitialized } = useAppInitialization();

  useEffect(() => {
    void initNotifications();
  }, []);

  if (isLoading || !appSettings) return null;
  if (error) return null;

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <AppSettingsProvider initialSettings={appSettings}>
      <ThemedNavigation />
    </AppSettingsProvider>
  );
}

const ThemedNavigation = () => {
  const { appSettings } = useAppSettings();
  const navTheme = appSettings.theme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationContainer theme={navTheme}>
      <RootNavigator />
    </NavigationContainer>
  );
}
