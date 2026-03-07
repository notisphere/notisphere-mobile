// Hooks
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';

// Core components
import {
  ActivityIndicator,
  Alert,
  GestureResponderEvent,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';

// Types
import { NotesStackScreenProps } from '@/src/types/navigation';
import { Note } from '@/src/types/note';
import { AttachmentDraft } from '@/src/types/attachmentDraft';

// Repositories
import { deleteNote, getNoteById, saveNote } from '@/src/db/repositories/notesRepository';
import {
  deleteAttachment,
  getAttachmentByNoteId,
  saveAttachment as saveAttachmentToDb,
} from '@/src/db/repositories/attachmentsRepository';

// State
import { getAppState, saveAppState } from '@/src/db/managers/stateManager';
import { StateKeys } from '@/src/db/stateKeys';

// Theme
import { useColors } from '@/src/theme/useColors';
import { useCameraAttachment } from '@/src/hooks/useCameraAttachment';
import { useAudioAttachment } from '@/src/hooks/useAudioAttachment';
import { useLocationAttachment } from '@/src/hooks/useLocationAttachment';
import { Attachment } from '@/src/types/attachment';
import { CameraView } from 'expo-camera';

/** Кнопка для взаимодействия с заметкой */
function ActionBtn(props: {
  label: string;
  onPress: (event: GestureResponderEvent) => void;
  disabled?: boolean;
}) {
  const { label, onPress, disabled = false } = props;
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.actionBtn,
        pressed && { opacity: 0.7 },
        disabled && { opacity: 0.4 },
      ]}
    >
      <Text style={styles.actionBtnText}>{label}</Text>
    </Pressable>
  );
}

/** Экран редактирования заметки */
export const NoteEditorScreen = (props: NotesStackScreenProps<'NoteEditor'>) => {
  const { route, navigation } = props;
  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  const params = route.params;
  const mode = params.mode;
  const noteId = mode === 'edit' ? params.noteId : undefined;

  // === Хуки для вложений ===
  const camera = useCameraAttachment();
  const audio = useAudioAttachment();
  const location = useLocationAttachment();

  // === Локальное состояние ===
  const [title, setTitle] = useState('');
  const [text, setText] = useState('');
  const [isLoading, setIsLoading] = useState(mode === 'edit');
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [isRestoring, setIsRestoring] = useState(false);

  // Храним оригинальные данные заметки для режима редактирования
  const [originalNote, setOriginalNote] = useState<Note | null>(null);
  const [loadedAttachments, setLoadedAttachments] = useState<Attachment | null>(null);

  const handleTakePhoto = useCallback(async () => {
    setIsCameraActive(true);
    // 📷 CameraView смонтируется, вызовет onCameraReady, который сделает снимок
  }, []);

  // Функция, которая вызывается когда камера готова
  const handleCameraReady = useCallback(async () => {
    // Небольшая задержка для фокусировки
    await new Promise((resolve) => setTimeout(resolve, 200));

    try {
      await camera.takePhoto({
        saveToGallery: false,
        quality: 0.8,
        onSuccess: () => {
          setIsCameraActive(false);
        },
      });
    } catch (err) {
      setIsCameraActive(false);
      console.error('Ошибка съёмки:', err);
    }
  }, [camera]);

  // === Загрузка заметки ===
  const loadNote = useCallback(async (id: number) => {
    try {
      const note = await getNoteById(id);
      if (note) {
        setOriginalNote(note);
        setTitle(note.title);
        setText(note.text ?? '');

        const attachment = await getAttachmentByNoteId(id);
        setLoadedAttachments(attachment);

        if (attachment?.photoUri) {
          camera.setPreviewUri(attachment.photoUri);
        }
        if (attachment?.audioUri) {
          audio.setPreviewUri(attachment.audioUri, attachment.audioDuration ?? undefined);
        }
        if (attachment?.location && attachment.latitude && attachment.longitude) {
          location.setLocationData({
            latitude: attachment.latitude,
            longitude: attachment.longitude,
            address: attachment.address ?? undefined,
          });
        }
      }
    } catch (error) {
      console.error('Ошибка загрузки заметки:', error);
      Alert.alert('Ошибка', 'Не удалось загрузить заметку');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if ((mode === 'edit' || mode === 'view') && noteId) {
      void loadNote(noteId);
    } else {
      setIsLoading(false);
    }
  }, [mode, noteId, loadNote]);

  // === Восстановление черновика ===
  useEffect(() => {
    if (mode !== 'create') return;

    const restoreDraft = async () => {
      const draft = await getAppState(StateKeys.LAST_EDITED_CACHE);

      if (draft?.timestamp && Date.now() - draft.timestamp < 30 * 60_000) {
        const confirmed =
          Platform.OS === 'web' ? window.confirm('Восстановить черновик заметки?') : true;

        if (confirmed) {
          setIsRestoring(true);
          const hasValidId = draft.id !== null && draft.id !== undefined && draft.id >= 0;
          const hasContent = draft.title?.trim() || draft.text?.trim();

          if (hasValidId) {
            navigation.setParams({ mode: 'edit', noteId: draft.id });
            await loadNote(draft.id);
          } else if (hasContent) {
            setTitle(draft.title ?? '');
            setText(draft.text ?? '');
          }
          setIsRestoring(false);
        }
        await saveAppState(StateKeys.LAST_EDITED_CACHE, null);
      }
    };

    void restoreDraft();
  }, [mode, navigation, loadNote]);

  // === Автосохранение черновика ===
  const hasSavedDraft = useRef(false);

  useEffect(() => {
    if (mode !== 'create' || isRestoring) return;

    if ((title.trim() || text.trim()) && !hasSavedDraft.current) {
      hasSavedDraft.current = true;
      void saveAppState(StateKeys.LAST_EDITED_CACHE, {
        id: null,
        title,
        text,
        timestamp: Date.now(),
      });
    }
  }, [mode, title, text, isRestoring]);

  useEffect(() => {
    return () => {
      if (mode === 'create' && (title.trim() || text.trim())) {
        void saveAppState(StateKeys.LAST_EDITED_CACHE, {
          id: null,
          title,
          text,
          timestamp: Date.now(),
        });
      }
    };
  }, [mode, title, text]);

  // === Сбор данных вложений из хуков ===
  const getCurrentAttachments = useCallback((): AttachmentDraft => {
    return {
      photo: !!camera.previewUri,
      photoUri: camera.previewUri ?? undefined,

      audio: !!audio.previewUri,
      audioUri: audio.previewUri ?? undefined,
      audioDuration: audio.duration ?? undefined,

      location: !!location.locationData,
      latitude: location.locationData?.latitude ?? undefined,
      longitude: location.locationData?.longitude ?? undefined,
      address: location.locationData?.address ?? undefined,
    };
  }, [camera.previewUri, audio.previewUri, audio.duration, location.locationData]);

  // === Сохранение заметки ===
  const handleSave = useCallback(async () => {
    if (!title.trim()) {
      Alert.alert('Ошибка', 'Заголовок не может быть пустым');
      return;
    }

    try {
      const noteIdToSave = mode === 'edit' && originalNote?.id ? originalNote.id : 0;

      // 1. Сохраняем основную заметку
      const note: Note = {
        id: noteIdToSave,
        title,
        text,
        createdAt: mode === 'edit' && originalNote?.createdAt ? originalNote.createdAt : new Date(),
        // Флаги вложений для быстрого доступа в списке
        attachment: {
          photo: !!camera.previewUri,
          audio: !!audio.previewUri,
          location: !!location.locationData,
        },
      };

      const savedNoteId = await saveNote(note);

      // 2. Сохраняем детальные данные вложений (если есть)
      const attachments = getCurrentAttachments();

      // 🔥 ЛОГ 2: что вернул getCurrentAttachments
      console.log('💾 [SAVE] getCurrentAttachments():', {
        photo: attachments.photo,
        photoUri: attachments.photoUri,
        audio: attachments.audio, // 👈 ключевое: true/false?
        audioUri: attachments.audioUri, // 👈 есть ли путь?
        audioDuration: attachments.audioDuration,
        location: attachments.location,
        latitude: attachments.latitude,
        longitude: attachments.longitude,
        address: attachments.address,
      });

      const normalizeAttachments = (draft: AttachmentDraft): Attachment => ({
        photo: draft.photo ?? false,
        photoUri: draft.photoUri,

        audio: draft.audio ?? false,
        audioUri: draft.audioUri,
        audioDuration: draft.audioDuration,

        location: draft.location ?? false,
        latitude: draft.latitude,
        longitude: draft.longitude,
        address: draft.address,
      });

      if (attachments.photo || attachments.audio || attachments.location) {
        const normalized = normalizeAttachments(attachments);
        await saveAttachmentToDb(savedNoteId, normalized);
      } else {
        if (mode === 'edit' && originalNote?.id) {
          await deleteAttachment(originalNote.id);
        }
      }

      // 3. Очищаем черновик и хуки
      await saveAppState(StateKeys.LAST_EDITED_CACHE, null);
      camera.reset();
      audio.reset();
      location.reset();

      navigation.popToTop();
    } catch (error) {
      console.error('Ошибка сохранения заметки:', error);
      Alert.alert('Ошибка', 'Не удалось сохранить заметку');
    }
  }, [mode, originalNote, title, text, camera, audio, location, navigation, getCurrentAttachments]);

  // === Режим просмотра: редактирование ===
  const handleEditPress = useCallback(() => {
    if (originalNote?.id) {
      navigation.setParams({ mode: 'edit' });
    }
  }, [originalNote?.id, navigation]);

  // === Режим просмотра: удаление ===
  const handleDeletePress = useCallback(async () => {
    if (!originalNote?.id) return;

    const confirmDelete = async () => {
      await deleteNote(originalNote?.id);
      navigation.goBack();
    };

    if (Platform.OS === 'web') {
      const confirmed = window.confirm('Удалить эту заметку?');
      if (confirmed) await confirmDelete();
    } else {
      Alert.alert('Удалить заметку?', 'Это действие нельзя отменить', [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Удалить', style: 'destructive', onPress: confirmDelete },
      ]);
    }
  }, [originalNote?.id, navigation]);

  // === Загрузка ===
  if (isLoading) {
    return (
      <View style={styles.container}>
        <ActivityIndicator size="large" color={c.primary} />
      </View>
    );
  }

  const isViewMode = mode === 'view';
  const isEditMode = mode === 'edit';

  return (
    <View style={styles.container}>
      <Text style={styles.h1}>
        {isViewMode ? 'Просмотр' : isEditMode ? 'Редактирование' : 'Новая заметка'}
      </Text>

      {/* === Заголовок === */}
      <Text style={styles.label}>Заголовок</Text>
      <TextInput
        value={title}
        onChangeText={isViewMode ? undefined : setTitle}
        placeholder="Например: Учёба"
        style={styles.input}
        editable={!isViewMode}
        placeholderTextColor={c.textMuted}
      />

      {/* === Текст заметки === */}
      <Text style={styles.label}>Текст</Text>
      <TextInput
        value={text}
        onChangeText={isViewMode ? undefined : setText}
        placeholder="Пиши заметку..."
        style={[styles.input, styles.textarea]}
        multiline
        editable={!isViewMode}
        placeholderTextColor={c.textMuted}
        textAlignVertical="top"
      />

      {/* === Вложения === */}
      {!isViewMode && (
        <>
          <Text style={styles.label}>Добавить</Text>
          <View style={styles.actionsRow}>
            {/* 📷 Фото */}
            <ActionBtn
              label={camera.previewUri ? '✅ Фото' : camera.isCapturing ? '⏳...' : '📷 Фото'}
              disabled={camera.isCapturing || isCameraActive}
              onPress={async () => {
                if (camera.previewUri) {
                  // 1. Сброс хука
                  camera.reset();

                  // 2. Очистка загруженного фото из стейта
                  setLoadedAttachments((prev) => {
                    if (!prev) return null;
                    return {
                      ...prev,
                      photo: false,
                      photoUri: undefined,
                    };
                  });
                } else {
                  // Сделать фото (хук сам управляет правами и UI)
                  await handleTakePhoto();
                }
              }}
            />

            {/* 🎤 Аудио */}
            <ActionBtn
              label={audio.previewUri ? '✅ Аудио' : audio.isRecording ? '⏹ Стоп' : '🎤 Аудио'}
              onPress={async () => {
                if (audio.previewUri) {
                  // 1. Сброс хука
                  audio.reset();

                  // 2. Очистка загруженного аудио из стейта
                  setLoadedAttachments((prev) => {
                    if (!prev) return null;
                    return {
                      ...prev,
                      audio: false,
                      audioUri: undefined,
                      audioDuration: undefined,
                    };
                  });
                } else if (audio.isRecording) {
                  // Остановить запись
                  await audio.stopRecording();
                } else {
                  // Начать запись
                  await audio.startRecording();
                }
              }}
            />

            {/* 📍 Геолокация */}
            <ActionBtn
              label={location.locationData ? '✅ Гео' : location.isLoading ? '⌛...' : '📍 Гео'}
              disabled={location.isLoading}
              onPress={async () => {
                if (location.locationData) {
                  // 1. Сброс хука
                  location.reset();

                  // 2. Очистка загруженного гео из стейта
                  setLoadedAttachments((prev) => {
                    if (!prev) return null;
                    return {
                      ...prev,
                      location: false,
                      latitude: undefined,
                      longitude: undefined,
                      address: undefined,
                    };
                  });
                } else {
                  // Получить локацию
                  await location.getCurrentLocation();
                }
              }}
            />
          </View>

          {/* === Превью вложений === */}
          {(camera.previewUri ||
            loadedAttachments?.photoUri ||
            audio.previewUri ||
            loadedAttachments?.audioUri ||
            location.locationData ||
            loadedAttachments?.location) && (
            <View style={styles.previewContainer}>
              {/* 📷 Фото: приоритет у нового, если нет - показываем старое */}
              {(camera.previewUri || loadedAttachments?.photoUri) && (
                <View style={styles.previewItem}>
                  <Image
                    source={{ uri: camera.previewUri || loadedAttachments!.photoUri! }}
                    style={styles.previewImage}
                    resizeMode="cover"
                  />
                  <Text style={styles.previewText}>📷 Фото</Text>
                  {/* Кнопка удаления должна сбрасывать либо хук, либо loadedAttachments */}
                </View>
              )}

              {/* 🎤 Аудио */}
              {(audio.previewUri || loadedAttachments?.audioUri) && (
                <View style={styles.previewItem}>
                  {/* Кнопка Play/Pause */}
                  <Pressable
                    onPress={audio.isPlaying ? audio.pauseAudio : audio.playAudio}
                    style={styles.audioBtn}
                  >
                    <Text style={styles.audioBtnText}>{audio.isPlaying ? '⏸' : '▶️'}</Text>
                  </Pressable>

                  {/* Кнопка сброса в начало */}
                  <Pressable
                    onPress={() => {
                      audio.pauseAudio();
                      audio.stopAudio(); // seekTo(0) внутри хука
                    }}
                    style={{ marginLeft: 4 }}
                  >
                    <Text style={{ fontSize: 16 }}>⏮</Text>
                  </Pressable>

                  {/* Длительность */}
                  <View style={styles.audioInfo}>
                    <Text style={styles.previewText}>
                      🎤{' '}
                      {audio.formatTime((audio.duration || loadedAttachments?.audioDuration) ?? 0)}
                    </Text>
                  </View>
                </View>
              )}

              {/* 📍 Геолокация */}
              {location.locationData && (
                <View style={styles.previewItem}>
                  <Text style={styles.previewText}>
                    📍 {location.locationData.address || 'Координаты'}
                  </Text>
                </View>
              )}
            </View>
          )}
        </>
      )}

      {/* 🔥 Скрытая камера для съёмки */}
      {isCameraActive && (
        <CameraView
          ref={camera.cameraRef}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            zIndex: -1, // 👈 Позади контента
            opacity: 0, // 👈 Невидимая
          }}
          facing={camera.cameraType}
          onCameraReady={handleCameraReady}
        />
      )}

      {/* === Футер с кнопками === */}
      <View style={styles.footer}>
        {isViewMode ? (
          <View style={styles.actionRow}>
            <Pressable
              onPress={handleEditPress}
              style={({ pressed }) => [styles.editBtn, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.editBtnText}>Редактировать</Text>
            </Pressable>
            <Pressable
              onPress={handleDeletePress}
              style={({ pressed }) => [styles.deleteBtn, pressed && { opacity: 0.7 }]}
            >
              <Text style={styles.deleteBtnText}>Удалить</Text>
            </Pressable>
          </View>
        ) : (
          <Pressable
            onPress={handleSave}
            style={({ pressed }) => [styles.saveBtn, pressed && { opacity: 0.7 }]}
          >
            <Text style={styles.saveBtnText}>
              {mode === 'edit' ? 'Сохранить изменения' : 'Создать заметку'}
            </Text>
          </Pressable>
        )}
      </View>
    </View>
  );
};

// === Стили ===
const makeStyles = (c: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    container: {
      flex: 1,
      padding: 16,
      backgroundColor: c.surface,
      paddingBottom: 24,
    },

    h1: {
      fontSize: 22,
      fontWeight: '800',
      marginBottom: 16,
      color: c.text,
    },

    label: {
      marginTop: 16,
      marginBottom: 8,
      fontWeight: '700',
      color: c.text,
      fontSize: 14,
    },

    input: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 12,
      paddingHorizontal: 14,
      paddingVertical: 12,
      backgroundColor: c.bg,
      color: c.text,
      fontSize: 16,
    },

    textarea: {
      minHeight: 160,
      textAlignVertical: 'top',
      paddingTop: 12,
    },

    cameraContainer: {
      marginTop: 12,
      marginBottom: 12,
      borderRadius: 12,
      overflow: 'hidden',
      backgroundColor: c.bg,
      borderWidth: 1,
      borderColor: c.border,
      alignItems: 'center',
      justifyContent: 'center',
    },

    cameraPreview: {
      width: '100%',
      height: 240,
      backgroundColor: '#000',
    },

    // Кнопки вложений
    actionsRow: {
      flexDirection: 'row',
      gap: 12,
      marginTop: 8,
      flexWrap: 'wrap',
    },

    actionBtn: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 999,
      paddingHorizontal: 16,
      paddingVertical: 10,
      backgroundColor: c.surface,
      minWidth: 90,
      alignItems: 'center',
    },

    actionBtnText: {
      fontWeight: '700',
      color: c.text,
      fontSize: 13,
    },

    audioBtn: {
      width: 36,
      height: 36,
      borderRadius: 18,
      backgroundColor: c.primaryBg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.primary,
    },
    audioBtnText: {
      fontSize: 16,
      color: c.primary,
      fontWeight: '700',
    },
    audioInfo: {
      flex: 1,
      gap: 4,
    },
    progressBar: {
      height: 4,
      backgroundColor: c.border,
      borderRadius: 2,
      overflow: 'hidden',
    },
    progressFill: {
      height: '100%',
      backgroundColor: c.primary,
      borderRadius: 2,
    },
    audioRemoveBtn: {
      width: 28,
      height: 28,
      borderRadius: 14,
      backgroundColor: c.dangerBg,
      alignItems: 'center',
      justifyContent: 'center',
      borderWidth: 1,
      borderColor: c.danger,
    },
    audioRemoveText: {
      fontSize: 14,
      color: c.danger,
      fontWeight: '700',
      lineHeight: 14,
    },

    // Превью вложений
    previewContainer: {
      marginTop: 16,
      padding: 12,
      borderRadius: 12,
      backgroundColor: c.bg,
      borderWidth: 1,
      borderColor: c.border,
      gap: 10,
    },

    previewItem: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: 10,
    },

    previewImage: {
      width: 60,
      height: 60,
      borderRadius: 8,
      backgroundColor: c.border,
    },

    previewText: {
      fontSize: 14,
      color: c.textMuted,
      flex: 1,
    },

    // Футер
    footer: {
      marginTop: 'auto',
      paddingTop: 20,
    },

    actionRow: {
      flexDirection: 'row',
      gap: 12,
      justifyContent: 'flex-end',
    },

    editBtn: {
      borderWidth: 1,
      borderColor: c.primary,
      borderRadius: 12,
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: c.primaryBg,
    },
    editBtnText: {
      color: c.primary,
      fontWeight: '700',
      fontSize: 15,
    },

    deleteBtn: {
      borderWidth: 1,
      borderColor: c.danger,
      borderRadius: 12,
      paddingHorizontal: 20,
      paddingVertical: 12,
      backgroundColor: c.dangerBg,
    },
    deleteBtnText: {
      color: c.danger,
      fontWeight: '700',
      fontSize: 15,
    },

    saveBtn: {
      borderRadius: 14,
      padding: 14,
      alignItems: 'center',
      backgroundColor: c.successBg,
      borderWidth: 1,
      borderColor: c.success,
    },
    saveBtnText: {
      fontWeight: '800',
      color: c.success,
      fontSize: 16,
    },
  });
