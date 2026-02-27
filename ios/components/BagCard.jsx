import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { getWeightCategory, formatWeight } from '../constants/weightCategories';

export default function BagCard({ bag, onPress, onEdit, onDelete, onDuplicate }) {
  const cat = getWeightCategory(bag.total_weight_grams || 0);

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.header}>
        {/* Backpack image */}
        <View style={styles.imageBox}>
          {bag.backpack_image_url ? (
            <Image
              source={{ uri: bag.backpack_image_url }}
              style={styles.image}
              resizeMode="contain"
            />
          ) : (
            <Ionicons name="bag-outline" size={24} color={COLORS.neutral400} />
          )}
        </View>

        {/* Name + backpack */}
        <View style={styles.info}>
          <Text style={styles.name} numberOfLines={1}>{bag.name}</Text>
          <Text style={styles.sub} numberOfLines={1}>
            {bag.backpack_brand} {bag.backpack_model}
          </Text>
        </View>

        {/* Weight */}
        <View style={styles.weightBox}>
          <Text style={[styles.weightNum, { color: cat.color }]}>
            {formatWeight(bag.total_weight_grams)}
          </Text>
        </View>
      </View>

      {/* Badge row */}
      <View style={styles.badgeRow}>
        <View style={[styles.badge, { backgroundColor: cat.bg }]}>
          <Text style={[styles.badgeText, { color: cat.color }]}>{cat.label}</Text>
        </View>
        {bag.description ? (
          <Text style={styles.desc} numberOfLines={1}>{bag.description}</Text>
        ) : null}
      </View>

      {/* Actions */}
      <View style={styles.actions}>
        <TouchableOpacity style={styles.actionBtn} onPress={onEdit}>
          <Ionicons name="pencil-outline" size={16} color={COLORS.neutral600} />
          <Text style={styles.actionText}>Edit</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionBtn} onPress={onDuplicate}>
          <Ionicons name="copy-outline" size={16} color={COLORS.neutral600} />
          <Text style={styles.actionText}>Duplicate</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, styles.deleteBtn]} onPress={onDelete}>
          <Ionicons name="trash-outline" size={16} color={COLORS.error} />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  imageBox: {
    width: 52,
    height: 52,
    borderRadius: 10,
    backgroundColor: COLORS.neutral100,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  image: {
    width: 52,
    height: 52,
  },
  info: {
    flex: 1,
    marginRight: 8,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: COLORS.neutral900,
    marginBottom: 2,
  },
  sub: {
    fontSize: 13,
    color: COLORS.neutral500,
  },
  weightBox: {
    alignItems: 'flex-end',
  },
  weightNum: {
    fontSize: 18,
    fontWeight: '700',
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 20,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  desc: {
    flex: 1,
    fontSize: 13,
    color: COLORS.neutral500,
  },
  actions: {
    flexDirection: 'row',
    gap: 8,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.neutral100,
  },
  actionBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: COLORS.neutral50,
  },
  actionText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.neutral700,
  },
  deleteBtn: {
    flex: 0,
    paddingHorizontal: 14,
    backgroundColor: COLORS.errorLight,
  },
});
