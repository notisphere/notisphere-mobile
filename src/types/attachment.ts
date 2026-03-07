/** Типы вложений для заметки */
export type Attachment = {
  /** Фото */
  photo: boolean;
  /** Путь/URI к фото (для предпросмотра) */
  photoUri?: string | null;

  /** Аудио */
  audio: boolean;
  /** Путь/URI к аудиофайлу */
  audioUri?: string | null;
  /** Длительность аудио в секундах */
  audioDuration?: number | null;

  /** Геолокация */
  location: boolean;
  /** Широта */
  latitude?: number | null;
  /** Долгота */
  longitude?: number | null;
  /** Человекочитаемый адрес (опционально) */
  address?: string | null;
};
