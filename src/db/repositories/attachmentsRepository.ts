import { Attachment } from '@/src/types/attachment';
import { getDatabase } from '@/src/db/database';

/**
 * Сохраняет вложение для заметки
 */
export const saveAttachment = async (noteId: number, attachment: Attachment): Promise<void> => {
  const db = await getDatabase();

  await db.runAsync(
    `INSERT OR REPLACE INTO attachments (noteId, photo, audio, location, photoUri, audioUri, audioDuration, latitude, longitude, address)
     VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      noteId,
      attachment.photo ? 1 : 0,
      attachment.audio ? 1 : 0,
      attachment.location ? 1 : 0,
      attachment.photoUri ?? null,
      attachment.audioUri ?? null,
      attachment.audioDuration ?? null,
      attachment.latitude ?? null,
      attachment.longitude ?? null,
      attachment.address ?? null,
    ],
  );
};

/**
 * Получает вложение по ID заметки
 */
export const getAttachmentByNoteId = async (noteId: number): Promise<Attachment | null> => {
  const db = await getDatabase();

  const row = await db.getFirstAsync<{
    photo: number;
    audio: number;
    location: number;
    photoUri: string | null;
    audioUri: string | null;
    audioDuration: number | null;
    latitude: number | null;
    longitude: number | null;
    address: string | null;
  }>(`SELECT * FROM attachments WHERE noteId = ?`, [noteId]);

  if (!row) return null;

  return {
    photo: !!row.photo,
    photoUri: row.photoUri,
    audio: !!row.audio,
    audioUri: row.audioUri,
    audioDuration: row.audioDuration,
    location: !!row.location,
    latitude: row.latitude,
    longitude: row.longitude,
    address: row.address,
  };
};

/**
 * Удаляет вложение заметки
 */
export const deleteAttachment = async (noteId: number): Promise<void> => {
  const db = await getDatabase();
  await db.runAsync(`DELETE FROM attachments WHERE noteId = ?`, [noteId]);
};
