// Navigation
import { NavigationContainer } from '@react-navigation/native';
// Components
import { RootNavigator } from '@/src/navigation/root-navigator';
// Hooks
import { useAppInitialization } from '@/src/db/useAppInitialization';
import { View, ActivityIndicator } from 'react-native';

export default function App() {
  const { isInitialized } = useAppInitialization();

  if (!isInitialized) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
