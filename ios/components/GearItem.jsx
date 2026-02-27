import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { formatWeightGrams } from '../constants/weightCategories';

const CATEGORY_LABELS = {
  backpack: 'Backpack',
  tent: 'Tent',
  sleeping_bag: 'Sleeping Bag',
  sleeping_pad: 'Sleeping Pad',
  stove: 'Stove',
  cookware: 'Cookware',
  clothing: 'Clothing',
  footwear: 'Footwear',
  accessory: 'Accessory',
  other: 'Other',
};

export default function GearItem({ item, onPress, isOwned, onToggleOwned, compact = false }) {
  const label = CATEGORY_LABELS[item.category] || item.category;

  if (compact) {
    return (
      <TouchableOpacity style={styles.compactRow} onPress={onPress} activeOpacity={0.7}>
        <View style={styles.compactImage}>
          {item.image_url ? (
            <Image source={{ uri: item.image_url }} style={styles.compactImg} resizeMode="contain" />
          ) : (
            <Ionicons name="layers-outline" size={18} color={COLORS.neutral400} />
          )}
        </View>
        <View style={styles.compactInfo}>
          <Text style={styles.compactName} numberOfLines={1}>
            {item.brand} {item.model}
          </Text>
          <Text style={styles.compactSub}>{label}</Text>
        </View>
        <Text style={styles.compactWeight}>{formatWeightGrams(item.weight_grams)}</Text>
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.imageBox}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={styles.image} resizeMode="contain" />
        ) : (
          <Ionicons name="layers-outline" size={28} color={COLORS.neutral400} />
        )}
        {isOwned && (
          <View style={styles.ownedBadge}>
            <Ionicons name="checkmark" size={10} color={COLORS.white} />
          </View>
        )}
      </View>
      <Text style={styles.brand} numberOfLines={1}>{item.brand}</Text>
      <Text style={styles.model} numberOfLines={2}>{item.model}</Text>
      <View style={styles.footer}>
        <Text style={styles.weight}>{formatWeightGrams(item.weight_grams)}</Text>
        {onToggleOwned && (
          <TouchableOpacity
            onPress={() => onToggleOwned(item.id)}
            style={[styles.ownToggle, isOwned && styles.ownToggleActive]}
          >
            <Text style={[styles.ownToggleText, isOwned && styles.ownToggleTextActive]}>
              {isOwned ? 'Owned' : 'Own it?'}
            </Text>
          </TouchableOpacity>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  imageBox: {
    width: '100%',
    height: 100,
    borderRadius: 8,
    backgroundColor: COLORS.neutral50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    overflow: 'visible',
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 8,
  },
  ownedBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.success,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brand: {
    fontSize: 11,
    color: COLORS.neutral500,
    marginBottom: 1,
  },
  model: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.neutral900,
    marginBottom: 6,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  weight: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.primary600,
  },
  ownToggle: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    backgroundColor: COLORS.neutral100,
  },
  ownToggleActive: {
    backgroundColor: COLORS.successLight,
  },
  ownToggleText: {
    fontSize: 11,
    fontWeight: '500',
    color: COLORS.neutral600,
  },
  ownToggleTextActive: {
    color: COLORS.success,
  },
  // Compact row
  compactRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 4,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral100,
  },
  compactImage: {
    width: 40,
    height: 40,
    borderRadius: 8,
    backgroundColor: COLORS.neutral50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    overflow: 'hidden',
  },
  compactImg: {
    width: 40,
    height: 40,
  },
  compactInfo: {
    flex: 1,
  },
  compactName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.neutral900,
  },
  compactSub: {
    fontSize: 12,
    color: COLORS.neutral500,
  },
  compactWeight: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.primary600,
    marginLeft: 8,
  },
});
