// Navigation
import type { NavigatorScreenParams, CompositeScreenProps } from '@react-navigation/native';

// Props
import type { NativeStackScreenProps } from '@react-navigation/native-stack';
import type { BottomTabScreenProps } from '@react-navigation/bottom-tabs';

/** Stack внутри вкладки "Заметки" */
export type NotesStackParamList = {
  Home: undefined;
  NoteDetails: { noteId: number };
  NoteEditor:
    | { mode: 'create' }
    | { mode: 'edit'; noteId: number }
    | { mode: 'view'; noteId: number };
};

/** Tabs (корневые) */
export type RootTabParamList = {
  NotesTab: NavigatorScreenParams<NotesStackParamList>;
  WeatherTab: undefined;
  SettingsTab: undefined;
};

/** Удобный тип props для экранов Stack (Home/Details/Editor) */
export type NotesStackScreenProps<T extends keyof NotesStackParamList> = CompositeScreenProps<
  NativeStackScreenProps<NotesStackParamList, T>,
  BottomTabScreenProps<RootTabParamList>
>;
