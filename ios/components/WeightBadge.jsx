import { View, Text, StyleSheet } from 'react-native';
import { getWeightCategory, formatWeight } from '../constants/weightCategories';

export default function WeightBadge({ grams, showWeight = false, size = 'md' }) {
  const cat = getWeightCategory(grams);
  const isSmall = size === 'sm';

  return (
    <View style={styles.row}>
      {showWeight && (
        <Text style={[styles.weight, { color: cat.color, fontSize: isSmall ? 16 : 22 }]}>
          {formatWeight(grams)}
        </Text>
      )}
      <View style={[styles.badge, { backgroundColor: cat.bg }]}>
        <Text style={[styles.label, { color: cat.color, fontSize: isSmall ? 10 : 12 }]}>
          {cat.label}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  weight: {
    fontWeight: '700',
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  label: {
    fontWeight: '600',
  },
});
