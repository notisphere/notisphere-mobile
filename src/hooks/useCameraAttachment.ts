import { useCallback, useEffect, useRef, useState } from 'react';
import { CameraType, CameraView, useCameraPermissions } from 'expo-camera';

interface UseCameraAttachmentProps {
  onPhotoCaptured?: () => void;
}

export const useCameraAttachment = ({ onPhotoCaptured }: UseCameraAttachmentProps = {}) => {
  const [cameraPermission, requestCameraPermission] = useCameraPermissions();

  const [previewUri, setPreviewUri] = useState<string | null>(null);
  const [cameraType, setCameraType] = useState<CameraType>('back');
  const [isCameraReady, setIsCameraReady] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false); // ← новое: блокировка повторных нажатий

  const cameraRef = useRef<CameraView>(null);

  const hasCameraPermission = !!cameraPermission?.granted;

  useEffect(() => {
    return () => {
      setIsCameraReady(false);
      // Опционально: очистка временных файлов через FileSystem
    };
  }, []);

  useEffect(() => {
    setIsCameraReady(false);
  }, [cameraType]);

  const requestAllPermissions = useCallback(async () => {
    if (!hasCameraPermission && requestCameraPermission) {
      const result = await requestCameraPermission();
      if (!result?.granted) return false;
    }
    return true;
  }, [hasCameraPermission, requestCameraPermission]);

  const toggleCameraType = useCallback(() => {
    setCameraType((prev) => (prev === 'back' ? 'front' : 'back'));
    setIsCameraReady(false);
  }, []);

  const handleCameraReady = useCallback(() => {
    setIsCameraReady(true);
  }, []);

  const handleCameraNotReady = useCallback(() => {
    setIsCameraReady(false);
  }, []);

  // 📸 СЪЁМКА ФОТО — главная функция
  const takePicture = useCallback(async () => {
    if (!cameraRef.current || !isCameraReady || isCapturing) {
      console.warn('Camera not ready', !cameraRef.current, !isCameraReady, isCapturing);
      return null;
    }

    setIsCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.85, // баланс качество/размер
        base64: false, // не нужно, если не планируешь отправлять как строку
        exif: false, // метаданные не нужны для превью
        skipProcessing: true, // быстрее, но может быть меньше качество на некоторых устройствах
      });

      if (photo?.uri) {
        setPreviewUri(photo.uri);
        onPhotoCaptured?.();
        return photo.uri;
      }
      console.warn('takePictureAsync returned no URI:', photo);
      return null;
    } catch (error) {
      console.error('Ошибка при съёмке:', error);
      throw error;
    } finally {
      setIsCapturing(false);
    }
  }, [isCameraReady, isCapturing, onPhotoCaptured]);

  const reset = useCallback(() => {
    setPreviewUri(null);
    setIsCameraReady(false);
    setIsCapturing(false);
  }, []);

  return {
    cameraRef,

    // Состояния
    previewUri,
    cameraType,
    isCameraReady,
    isCapturing,
    setIsCapturing,

    // Права
    hasCameraPermission,

    // Действия
    reset,
    toggleCameraType,
    requestPermissions: requestAllPermissions,
    onCameraNotReady: handleCameraNotReady,
    onCameraReady: handleCameraReady,
    takePicture, // ← новая функция для съёмки
    setPreviewUri: (uri: string) => setPreviewUri(uri),
  };
};
