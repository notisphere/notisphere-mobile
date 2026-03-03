// Core
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Screens
import { HomeScreen } from '../screens/home-screen';
import { NoteDetailsScreen } from '../screens/note-details-screen';
import { NoteEditorScreen } from '../screens/note-editor-screen';

// Additional screens
import { WeatherScreen } from '../screens/weather-screen';
import { SettingsScreen } from '../screens/settings-screen';

// Types
import { NotesStackParamList, RootTabParamList } from '@/src/types/navigation';

// Elements
const Tab = createBottomTabNavigator<RootTabParamList>();
const Stack = createNativeStackNavigator<NotesStackParamList>();

// Навигация в рамках главного экрана
const HomeStack = () => {
  return (
    <Stack.Navigator>
      <Stack.Screen name="Home" component={HomeScreen} options={{ title: 'Заметки' }} />
      <Stack.Screen
        name="NoteDetails"
        component={NoteDetailsScreen}
        options={{ title: 'Детали' }}
      />
      <Stack.Screen
        name="NoteEditor"
        component={NoteEditorScreen}
        options={{ title: 'Редактор' }}
      />
    </Stack.Navigator>
  );
};

/** Нижний бар для навигации в приложении */
export const RootNavigator = () => {
  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="NotesTab" component={HomeStack} options={{ title: 'Заметки' }} />
      <Tab.Screen name="WeatherTab" component={WeatherScreen} options={{ title: 'Погода' }} />
      <Tab.Screen name="SettingsTab" component={SettingsScreen} options={{ title: 'Настройки' }} />
    </Tab.Navigator>
  );
};
