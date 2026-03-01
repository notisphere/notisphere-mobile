// Core components
import { View, Text, StyleSheet } from 'react-native';

export const WeatherScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Погода (заглушка)</Text>
      <Text>Потом подключим API и геолокацию.</Text>
    </View>
  );
};

/** Стили */
const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#fff',
  },
  title: { fontSize: 20, fontWeight: '800' },
});
