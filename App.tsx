// Navigation
import { NavigationContainer } from '@react-navigation/native';
// Components
import { RootNavigator } from '@/src/navigation/root-navigator';

export default function App() {
  return (
    <NavigationContainer>
      <RootNavigator />
    </NavigationContainer>
  );
}
