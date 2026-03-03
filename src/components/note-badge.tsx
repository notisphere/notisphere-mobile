// Core components
import { View, Text, StyleSheet } from 'react-native';
import { useColors } from '@/src/theme/useColors';
import { useMemo } from 'react';

export const Badge = (props: { label: string }) => {
  const { label } = props;

  const c = useColors();
  const styles = useMemo(() => makeStyles(c), [c]);

  return (
    <View style={styles.badge}>
      <Text style={styles.badgeText}>{label}</Text>
    </View>
  );
};

/** Стили */
const makeStyles = (c: ReturnType<typeof useColors>) =>
  StyleSheet.create({
    badge: {
      borderWidth: 1,
      borderColor: c.border,
      borderRadius: 999,
      paddingHorizontal: 10,
      paddingVertical: 4,
      backgroundColor: c.surface,
    },
    badgeText: { fontSize: 12, color: c.textMuted },
  });
