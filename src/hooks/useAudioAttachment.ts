import { useState, useCallback, useEffect } from 'react';
import { Alert } from 'react-native';
import {
  AudioModule,
  setAudioModeAsync,
  useAudioPlayer,
  useAudioPlayerStatus,
  useAudioRecorder,
  useAudioRecorderState,
  RecordingPresets,
  AudioPlayer,
} from 'expo-audio';

export const useAudioAttachment = () => {
  const [isRecording, setIsRecording] = useState(false);
  const [isPlaying, setIsPlaying] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [duration, setDuration] = useState<number | null>(null);
  const [playbackPosition, setPlaybackPosition] = useState<number>(0);

  // Создаём инстансы через хуки
  const recorder = useAudioRecorder(RecordingPresets.HIGH_QUALITY);
  const recorderState = useAudioRecorderState(recorder);

  const player = useAudioPlayer(previewUri ? { uri: previewUri } : null);
  const playerStatus = useAudioPlayerStatus(player);

  // 🔁 Синхронизация состояния плеера с локальным стейтом
  useEffect(() => {
    if (playerStatus.isLoaded) {
      setPlaybackPosition(Math.round((playerStatus.currentTime ?? 0) * 1000));

      if (playerStatus.didJustFinish) {
        setIsPlaying(false);
        setPlaybackPosition(0);
      }
    }
  }, [playerStatus.currentTime, playerStatus.didJustFinish, playerStatus.isLoaded]);

  useEffect(() => {
    setIsPlaying(playerStatus.playing ?? false);
  }, [playerStatus.playing]);

  useEffect(() => {
    if (playerStatus.duration && playerStatus.duration > 0) {
      setDuration(Math.round(playerStatus.duration));
    }
  }, [playerStatus.duration]);

  // 🔁 Синхронизация состояния записи
  useEffect(() => {
    setIsRecording(recorderState.isRecording ?? false);
  }, [recorderState.isRecording]);

  // Обновляем длительность после остановки записи
  useEffect(() => {
    if (!isRecording && recorderState.durationMillis) {
      setDuration(Math.round(recorderState.durationMillis / 1000));
    }
  }, [isRecording, recorderState.durationMillis]);

  const requestPermission = useCallback(async () => {
    const { granted } = await AudioModule.requestRecordingPermissionsAsync();
    return granted;
  }, []);

  const startRecording = useCallback(async () => {
    // Останавливаем воспроизведение перед записью
    if (player?.playing) {
      player.pause();
    }

    const granted = await requestPermission();
    if (!granted) {
      Alert.alert('Доступ отклонён', 'Разрешите доступ к микрофону');
      return;
    }

    try {
      await setAudioModeAsync({
        allowsRecording: true,
        playsInSilentMode: true,
      });

      await recorder.prepareToRecordAsync();
      recorder.record();
      setPlaybackPosition(0);
    } catch (err) {
      console.error('Ошибка записи:', err);
      Alert.alert('Ошибка', 'Не удалось начать запись');
    }
  }, [requestPermission, recorder, player]);

  const stopRecording = useCallback(
    async (onSuccess?: (uri: string, duration: number) => void) => {
      try {
        await recorder.stop(); // ✅ Просто stop(), без unload

        const uri = recorder.uri;
        // ⚠️ durationMillis — в миллисекундах, конвертируем в секунды
        const dur = recorderState.durationMillis
          ? Math.round(recorderState.durationMillis / 1000)
          : 0;

        if (uri) {
          setPreviewUri(uri);
          setDuration(dur);

          await setAudioModeAsync({
            allowsRecording: false,
            playsInSilentMode: true,
          });

          onSuccess?.(uri, dur);
        }
      } catch (err) {
        console.error('Ошибка остановки записи:', err);
        Alert.alert('Ошибка', 'Не удалось остановить запись');
      }
    },
    [recorder, recorderState.durationMillis],
  );

  const isValidPlayer = (p: any): p is AudioPlayer => {
    return p && typeof p.play === 'function' && typeof p.pause === 'function';
  };

  const playAudio = useCallback(async () => {
    if (!previewUri || !player) return;

    try {
      // 🔥 Ждём, пока плеер загрузит файл
      if (!playerStatus.isLoaded) {
        console.log('⏳ Плеер ещё не загрузился, ждём...');
        // Можно добавить небольшую задержку или просто вернуться и дать пользователю нажать ещё раз
        return;
      }

      // 🔥 Если аудио закончилось (позиция в конце) — сбрасываем в начало
      if (playerStatus.isLoaded && playerStatus.duration) {
        const isAtEnd =
          playerStatus.currentTime &&
          Math.abs(playerStatus.currentTime - playerStatus.duration) < 0.1;

        if (isAtEnd && !playerStatus.playing) {
          player.seekTo(0);
          setPlaybackPosition(0);
        }
      }

      // Переключаем play/pause
      if (playerStatus.playing) {
        player.pause();
      } else {
        player.play();
      }
    } catch (err) {
      console.error('Ошибка воспроизведения:', err);
      Alert.alert('Ошибка', 'Не удалось воспроизвести аудио');
    }
  }, [previewUri, player, playerStatus]);

  const pauseAudio = useCallback(() => {
    if (player?.playing) {
      player.pause();
    }
  }, [player]);

  const stopAudio = useCallback(() => {
    if (player) {
      player.pause();
      // ⚠️ В expo-audio нет stopAsync() — используем pause + seekTo(0)
      player.seekTo(0);
      setPlaybackPosition(0);
    }
  }, [player]);

  const reset = useCallback(() => {
    if (isValidPlayer(player) && playerStatus.isLoaded) {
      try {
        player.pause();
        player.seekTo(0);
      } catch {
        // Игнорируем ошибки, если плеер уже освобождён
      }
    }
    setPreviewUri(null);
    setDuration(null);
    setPlaybackPosition(0);
  }, [player, playerStatus.isLoaded]);

  const formatTime = useCallback((value: number) => {
    // ⚠️ Гибкая функция: принимает как секунды, так и миллисекунды
    const totalSeconds = value > 100 ? Math.floor(value / 1000) : Math.floor(value);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds < 10 ? '0' : ''}${seconds}`;
  }, []);

  return {
    isRecording,
    isPlaying,
    previewUri,
    duration,
    playbackPosition,
    startRecording,
    stopRecording,
    playAudio,
    pauseAudio,
    stopAudio,
    reset,
    requestPermission,
    formatTime,
    setPreviewUri: (uri: string, duration?: number) => {
      setPreviewUri(uri);
      if (duration !== undefined) setDuration(duration);
    },
  };
};
