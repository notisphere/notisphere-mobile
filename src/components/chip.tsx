// Core components
import { View, Text, StyleSheet } from 'react-native';

export const Chip = (props: { label: string }) => {
  const { label } = props;

  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
};

/** Стили */
const styles = StyleSheet.create({
  chip: {
    borderWidth: 1,
    borderColor: '#bbb',
    borderRadius: 999,
    paddingHorizontal: 12,
    paddingVertical: 6,
  },
  chipText: { fontSize: 13 },
});
