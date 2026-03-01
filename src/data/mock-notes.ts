// Types
import { Note } from '@/src/types/note';

/** Моковые заметки */
export const mockNotes: Note[] = [
  {
    id: 1,
    title: 'Список покупок',
    text: 'Молоко, хлеб, сыр',
    createdAt: new Date(),
    attachment: {
      photo: false,
      audio: false,
      location: true,
    },
  },
  {
    id: 2,
    title: 'Идея для проекта',
    text: 'Сделать умный блокнот с медиа и гео',
    createdAt: new Date(),
    attachment: {
      photo: true,
      audio: true,
      location: false,
    },
  },
  {
    id: 3,
    title: 'Заметка без вложений',
    text: 'Просто текст',
    createdAt: new Date(),
    attachment: {
      photo: false,
      audio: false,
      location: false,
    },
  },
];
