import { useState, useCallback } from 'react';
import * as Location from 'expo-location';
import { Alert } from 'react-native';

export const useLocationAttachment = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [locationData, setLocationData] = useState<{
    latitude: number;
    longitude: number;
    address?: string;
  } | null>(null);

  const requestPermission = useCallback(async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    return status === 'granted';
  }, []);

  const getCurrentLocation = useCallback(
    async (onSuccess?: (lat: number, lon: number, address?: string) => void) => {
      setIsLoading(true);
      try {
        const granted = await requestPermission();
        if (!granted) {
          Alert.alert('Доступ отклонён', 'Разрешите доступ к геолокации');
          return;
        }

        const location = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });

        let address: string | undefined;
        try {
          const [place] = await Location.reverseGeocodeAsync({
            latitude: location.coords.latitude,
            longitude: location.coords.longitude,
          });
          address = [place.city, place.street, place.name].filter(Boolean).join(', ');
        } catch (e) {
          console.warn('Не удалось получить адрес:', e);
        }

        const data = {
          latitude: location.coords.latitude,
          longitude: location.coords.longitude,
          address,
        };

        setLocationData(data);
        onSuccess?.(data.latitude, data.longitude, data.address);
        return data;
      } catch (err) {
        console.error('Ошибка получения локации:', err);
        Alert.alert('Ошибка', 'Не удалось определить местоположение');
        return null;
      } finally {
        setIsLoading(false);
      }
    },
    [requestPermission],
  );

  const reset = useCallback(() => {
    setLocationData(null);
  }, []);

  return {
    isLoading,
    locationData,
    getCurrentLocation,
    reset,
    requestPermission,
    setLocationData: (data: { latitude: number; longitude: number; address?: string }) => {
      setLocationData(data);
    },
  };
};
