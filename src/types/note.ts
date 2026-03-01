// Types
import { Attachment } from '@/src/types/attachment';

/**
 * Заметка
 */
export type Note = {
  /** ID заметки */
  id: number;

  /** Название заметки */
  title: string;

  /** Описание/контент заметки */
  text: string;

  /** Дата создания заметки */
  createdAt: Date;

  /** Вложение у заметки */
  attachment: Attachment;
};
