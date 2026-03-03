// Core components
import { View, Text, StyleSheet } from 'react-native';

// Hooks
import { useMemo } from 'react';

// Theme
import { useColors } from '@/src/theme/useColors';

export const Chip = (props: { label: string }) => {
  const { label } = props;

  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <View style={styles.chip}>
      <Text style={styles.chipText}>{label}</Text>
    </View>
  );
};

/** Стили */
const makeStyles = (c: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    chip: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 999,
      paddingHorizontal: 12,
      paddingVertical: 6,
      backgroundColor: c.bg,
    },
    chipText: { fontSize: 13, color: c.text },
  });
