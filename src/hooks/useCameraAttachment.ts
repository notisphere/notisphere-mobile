import { useCallback, useEffect, useRef, useState } from 'react';
import { Alert, Linking, Platform } from 'react-native';
import {
  CameraView,
  CameraType,
  useCameraPermissions,
  type CameraCapturedPicture,
} from 'expo-camera';
import * as MediaLibrary from 'expo-media-library';

export const useCameraAttachment = () => {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();
  const [mediaPermission, requestMediaPermission] = MediaLibrary.usePermissions({
    granularPermissions: ['photo'],
  });

  const [isCapturing, setIsCapturing] = useState(false);
  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>('back');

  const [isCameraReady, setIsCameraReady] = useState(false);

  // 🔁 Внутренний ref камеры — больше не нужно передавать извне
  const cameraRef = useRef<CameraView | null>(null);

  const hasCameraPermission = !!cameraPermission?.granted;
  const hasMediaPermission = !!mediaPermission?.granted;

  useEffect(() => {
    return () => {
      setIsCameraReady(false);
      if (previewUri?.startsWith('file://')) {
        // Опциональная очистка через FileSystem
      }
    };
  }, [previewUri]);

  useEffect(() => {
    setIsCameraReady(false);
  }, [cameraType]);

  const requestAllPermissions = useCallback(async () => {
    if (!hasCameraPermission && requestCameraPermission) {
      const result = await requestCameraPermission();
      if (!result?.granted) return false;
    }
    if (!hasMediaPermission && requestMediaPermission) {
      const result = await requestMediaPermission();
      if (!result?.granted) return false;
    }
    return true;
  }, [hasCameraPermission, hasMediaPermission, requestCameraPermission, requestMediaPermission]);

  const toggleCameraType = useCallback(() => {
    setCameraType((prev) => (prev === 'back' ? 'front' : 'back'));
  }, []);

  const handleCameraReady = useCallback(() => {
    setIsCameraReady(true);
  }, []);

  const takePhoto = useCallback(
    async (options?: {
      saveToGallery?: boolean;
      quality?: number;
      onSuccess?: (uri: string) => void;
    }) => {
      const { saveToGallery = false, quality = 0.8, onSuccess } = options || {};

      if (!cameraRef.current) {
        Alert.alert('Ошибка', 'Камера не инициализирована');
        return null;
      }

      if (!hasCameraPermission || !hasMediaPermission) {
        const ok = await requestAllPermissions();
        if (!ok) {
          Alert.alert('Доступ отклонён', 'Разрешите доступ к камере и галерее', [
            { text: 'Отмена', style: 'cancel' },
            { text: 'Настройки', onPress: () => Linking.openSettings() },
          ]);
          return null;
        }
      }

      setIsCapturing(true);

      try {
        const photo: CameraCapturedPicture | undefined = await cameraRef.current.takePictureAsync({
          quality,
          base64: false,
          exif: false,
          skipProcessing: false,
        });

        if (!photo?.uri) throw new Error('Не удалось получить данные снимка');

        let finalUri = photo.uri;

        if (saveToGallery) {
          try {
            const uriToSave =
              Platform.OS === 'android' && !photo.uri.startsWith('file://')
                ? `file://${photo.uri}`
                : photo.uri;

            await MediaLibrary.saveToLibraryAsync(uriToSave);
          } catch (mediaError: any) {
            // 🔥 Игнорируем ошибку в Expo Go / debug-режиме
            if (__DEV__ || mediaError.message?.includes('Expo Go')) {
              console.warn('⚠️ Сохранение в галерею недоступно в Expo Go. Пропускаем...');
            } else {
              // В продакшене — показываем алерт
              console.error('Ошибка сохранения в галерею:', mediaError);
              Alert.alert('Внимание', 'Не удалось сохранить фото в галерею');
            }
          }
        }

        setPreviewUri(finalUri);
        onSuccess?.(finalUri);
        return finalUri;
      } catch (err) {
        console.error('Ошибка камеры:', err);
        Alert.alert('Ошибка', err instanceof Error ? err.message : 'Не удалось сделать фото');
        return null;
      } finally {
        setIsCapturing(false);
      }
    },
    [hasCameraPermission, hasMediaPermission, requestAllPermissions],
  );

  const reset = useCallback(() => {
    setPreviewUri(null);
    setIsCameraReady(false);
  }, []);

  return {
    isCapturing,
    isCameraReady,
    previewUri,
    cameraType,
    cameraRef,

    // Права
    hasCameraPermission,
    hasMediaPermission,

    // Действия
    takePhoto,
    reset,
    toggleCameraType,
    requestPermissions: requestAllPermissions,
    onCameraReady: handleCameraReady,
    setPreviewUri: (uri: string) => {
      setPreviewUri(uri);
    },
  };
};
