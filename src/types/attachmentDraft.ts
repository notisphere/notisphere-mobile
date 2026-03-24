/**
 * Черновик приложения
 */
export interface AttachmentDraft {
  // Фото
  photo?: boolean;
  photoUri?: string;

  // Аудио
  audio?: boolean;
  audioUri?: string;
  audioDuration?: number;

  // Геолокация
  location?: boolean;
  latitude?: number;
  longitude?: number;
  address?: string;
}
