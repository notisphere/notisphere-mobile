// Core components
import { View, Text, StyleSheet } from 'react-native';

export const Badge = (props: { label: string }) => {
  const { label } = props;

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
};

/** Стили */
const styles = StyleSheet.create({
  badge: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 12 },
});
