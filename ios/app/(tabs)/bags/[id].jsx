import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  Image,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import GearSearchModal from '../../../components/GearSearchModal';
import { getBag, addItemToBag, removeItemFromBag } from '../../../services/api';
import { COLORS } from '../../../constants/colors';
import { getWeightCategory, formatWeight, formatWeightGrams } from '../../../constants/weightCategories';

export default function BagDetail() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [bag, setBag] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [gearModalOpen, setGearModalOpen] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadBag();
    }, [id])
  );

  const loadBag = async () => {
    try {
      const data = await getBag(id);
      setBag(data);
      navigation.setOptions({ title: data.name || 'Bag Details' });
    } catch (err) {
      console.error('Load bag:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddItem = async (gearItem) => {
    setGearModalOpen(false);
    try {
      await addItemToBag(id, gearItem.id, 1);
      await loadBag();
    } catch (err) {
      Alert.alert('Error', err.data?.error || "Couldn't add item. It may already be in the bag.");
    }
  };

  const handleRemoveItem = (itemId, itemName) => {
    Alert.alert('Remove Item', `Remove "${itemName}" from the bag?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove',
        style: 'destructive',
        onPress: async () => {
          try {
            await removeItemFromBag(id, itemId);
            await loadBag();
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          } catch {
            Alert.alert('Error', "Couldn't remove item.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={COLORS.primary500} />
      </View>
    );
  }

  if (!bag) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>Bag not found.</Text>
      </View>
    );
  }

  const cat = getWeightCategory(bag.total_weight_grams || 0);
  const progressPct = Math.min(((bag.total_weight_grams || 0) / 15000) * 100, 100);

  return (
    <>
      <FlatList
        data={bag.items || []}
        keyExtractor={(item) => item.gear_item_id || item.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadBag(); }} tintColor={COLORS.primary500} />}
        ListHeaderComponent={
          <View>
            {/* Bag summary card */}
            <View style={styles.summaryCard}>
              <View style={styles.summaryRow}>
                {/* Left: name + weight */}
                <View style={styles.summaryLeft}>
                  <Text style={styles.bagName} numberOfLines={2}>{bag.name}</Text>
                  {bag.description ? <Text style={styles.bagDesc} numberOfLines={2}>{bag.description}</Text> : null}
                  <Text style={[styles.weightNum, { color: cat.color }]}>{formatWeight(bag.total_weight_grams)}</Text>
                  <View style={[styles.badge, { backgroundColor: cat.bg }]}>
                    <Text style={[styles.badgeText, { color: cat.color }]}>{cat.label}</Text>
                  </View>
                </View>

                {/* Right: backpack image */}
                <View style={styles.backpackBox}>
                  {bag.backpack_image_url ? (
                    <Image source={{ uri: bag.backpack_image_url }} style={styles.backpackImg} resizeMode="contain" />
                  ) : (
                    <Ionicons name="bag-outline" size={48} color={COLORS.neutral300} />
                  )}
                  <Text style={styles.backpackName} numberOfLines={1}>
                    {bag.backpack_brand} {bag.backpack_model}
                  </Text>
                  <Text style={styles.backpackWeight}>{bag.backpack_weight_grams}g</Text>
                </View>
              </View>

              {/* Weight progress bar */}
              <View style={styles.progressContainer}>
                <Text style={[styles.progressLabel, { color: cat.color }]}>{cat.label}</Text>
                <View style={styles.progressTrack}>
                  <View style={[styles.progressFill, { width: `${progressPct}%`, backgroundColor: cat.color }]} />
                </View>
                <View style={styles.progressEndpoints}>
                  <Text style={styles.progressMark}>0 kg</Text>
                  <Text style={styles.progressMark}>15 kg</Text>
                </View>
              </View>
            </View>

            {/* Items header */}
            <View style={styles.itemsHeader}>
              <Text style={styles.itemsTitle}>Items ({bag.items?.length || 0})</Text>
              <TouchableOpacity style={styles.addBtn} onPress={() => setGearModalOpen(true)}>
                <Ionicons name="add" size={18} color={COLORS.white} />
                <Text style={styles.addBtnText}>Add Gear</Text>
              </TouchableOpacity>
            </View>
          </View>
        }
        renderItem={({ item }) => (
          <BagItemRow item={item} onRemove={handleRemoveItem} />
        )}
        ListEmptyComponent={
          <View style={styles.emptyItems}>
            <Ionicons name="layers-outline" size={36} color={COLORS.neutral300} />
            <Text style={styles.emptyText}>No gear added yet</Text>
            <TouchableOpacity style={styles.addBtn} onPress={() => setGearModalOpen(true)}>
              <Ionicons name="add" size={18} color={COLORS.white} />
              <Text style={styles.addBtnText}>Add Gear</Text>
            </TouchableOpacity>
          </View>
        }
      />

      <GearSearchModal
        isVisible={gearModalOpen}
        onClose={() => setGearModalOpen(false)}
        onSelect={handleAddItem}
        title="Add Gear to Bag"
      />
    </>
  );
}

function BagItemRow({ item, onRemove }) {
  return (
    <View style={styles.itemRow}>
      <View style={styles.itemImage}>
        {item.image_url ? (
          <Image source={{ uri: item.image_url }} style={{ width: 44, height: 44 }} resizeMode="contain" />
        ) : (
          <Ionicons name="layers-outline" size={20} color={COLORS.neutral400} />
        )}
      </View>
      <View style={styles.itemInfo}>
        <Text style={styles.itemName} numberOfLines={1}>{item.brand} {item.model}</Text>
        <Text style={styles.itemMeta}>
          {item.quantity > 1 ? `x${item.quantity} · ` : ''}
          {formatWeightGrams(item.total_item_weight_grams)}
        </Text>
      </View>
      <TouchableOpacity
        onPress={() => onRemove(item.gear_item_id, `${item.brand} ${item.model}`)}
        style={styles.removeBtn}
      >
        <Ionicons name="trash-outline" size={18} color={COLORS.error} />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
  errorText: { color: COLORS.neutral500, fontSize: 15 },
  list: { padding: 16, paddingBottom: 40, backgroundColor: COLORS.surface },
  summaryCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  summaryRow: { flexDirection: 'row', gap: 16, marginBottom: 16 },
  summaryLeft: { flex: 1, gap: 6 },
  bagName: { fontSize: 18, fontWeight: '700', color: COLORS.neutral900 },
  bagDesc: { fontSize: 13, color: COLORS.neutral500 },
  weightNum: { fontSize: 28, fontWeight: '800' },
  badge: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 20 },
  badgeText: { fontSize: 12, fontWeight: '600' },
  backpackBox: { alignItems: 'center', width: 100 },
  backpackImg: { width: 100, height: 100, marginBottom: 6 },
  backpackName: { fontSize: 11, fontWeight: '500', color: COLORS.neutral700, textAlign: 'center' },
  backpackWeight: { fontSize: 11, color: COLORS.neutral500 },
  progressContainer: { gap: 4 },
  progressLabel: { fontSize: 12, fontWeight: '600' },
  progressTrack: { height: 8, borderRadius: 4, backgroundColor: COLORS.neutral100, overflow: 'hidden' },
  progressFill: { height: '100%', borderRadius: 4 },
  progressEndpoints: { flexDirection: 'row', justifyContent: 'space-between' },
  progressMark: { fontSize: 10, color: COLORS.neutral400 },
  itemsHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    marginBottom: 8,
  },
  itemsTitle: { fontSize: 16, fontWeight: '600', color: COLORS.neutral800 },
  addBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.primary500, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  addBtnText: { fontSize: 14, fontWeight: '600', color: COLORS.white },
  emptyItems: { alignItems: 'center', paddingVertical: 40, gap: 10 },
  emptyText: { fontSize: 14, color: COLORS.neutral400 },
  itemRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12, padding: 12, marginBottom: 8,
    borderWidth: 1, borderColor: COLORS.border,
  },
  itemImage: {
    width: 44, height: 44, borderRadius: 8,
    backgroundColor: COLORS.neutral50, alignItems: 'center', justifyContent: 'center',
    marginRight: 12, overflow: 'hidden',
  },
  itemInfo: { flex: 1 },
  itemName: { fontSize: 14, fontWeight: '500', color: COLORS.neutral900, marginBottom: 2 },
  itemMeta: { fontSize: 12, color: COLORS.neutral500 },
  removeBtn: { padding: 6 },
});
