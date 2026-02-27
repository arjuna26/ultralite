import { useState, useEffect, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  ScrollView,
  RefreshControl,
  ActivityIndicator,
  Alert,
  Modal,
  Image,
} from 'react-native';
import { useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import * as Haptics from 'expo-haptics';
import { getGear, getUserOwnedGear, toggleGearOwnership } from '../../../services/api';
import { COLORS } from '../../../constants/colors';
import { formatWeightGrams, getWeightCategory } from '../../../constants/weightCategories';

const CATEGORIES = [
  { value: '', label: 'All' },
  { value: 'backpack', label: 'Backpacks' },
  { value: 'tent', label: 'Tents' },
  { value: 'sleeping_bag', label: 'Sleeping Bags' },
  { value: 'sleeping_pad', label: 'Sleeping Pads' },
  { value: 'stove', label: 'Stoves' },
  { value: 'cookware', label: 'Cookware' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'footwear', label: 'Footwear' },
  { value: 'accessory', label: 'Accessories' },
  { value: 'other', label: 'Other' },
];

const LIMIT = 24;

export default function GearCatalog() {
  const [gear, setGear] = useState([]);
  const [ownedIds, setOwnedIds] = useState(new Set());
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [loadingMore, setLoadingMore] = useState(false);

  const [selectedItem, setSelectedItem] = useState(null);
  const [detailOpen, setDetailOpen] = useState(false);
  const [ownershipLoading, setOwnershipLoading] = useState(false);

  const searchTimer = useRef(null);

  useFocusEffect(
    useCallback(() => {
      loadOwnedGear();
    }, [])
  );

  useEffect(() => {
    setPage(1);
    if (searchTimer.current) clearTimeout(searchTimer.current);
    searchTimer.current = setTimeout(() => {
      loadGear(1, true);
    }, search ? 300 : 0);
    return () => clearTimeout(searchTimer.current);
  }, [search, category]);

  const loadGear = async (pageNum = 1, reset = true) => {
    if (reset) setLoading(true);
    else setLoadingMore(true);

    try {
      const offset = (pageNum - 1) * LIMIT;
      const params = { limit: LIMIT, offset };
      if (search) params.search = search;
      if (category) params.category = category;
      const data = await getGear(params);
      const items = data.items || data;
      const totalCount = data.total || items.length;
      setTotal(totalCount);
      setGear(reset ? items : (prev) => [...prev, ...items]);
      setPage(pageNum);
    } catch (err) {
      console.error('Load gear:', err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
      setRefreshing(false);
    }
  };

  const loadOwnedGear = async () => {
    try {
      const data = await getUserOwnedGear();
      setOwnedIds(new Set(data.map((g) => g.gear_item_id)));
    } catch (err) {
      console.error('Load owned gear:', err);
    }
  };

  const handleToggleOwned = async (itemId) => {
    setOwnershipLoading(true);
    try {
      const res = await toggleGearOwnership(itemId);
      if (res.owned) {
        setOwnedIds((prev) => new Set([...prev, itemId]));
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } else {
        setOwnedIds((prev) => { const s = new Set(prev); s.delete(itemId); return s; });
      }
      // Update the selected item state too
      if (selectedItem?.id === itemId) {
        setSelectedItem((prev) => ({ ...prev })); // trigger re-render
      }
    } catch {
      Alert.alert('Error', 'Failed to update ownership.');
    } finally {
      setOwnershipLoading(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && gear.length < total) {
      loadGear(page + 1, false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Gear Catalog</Text>
        <Text style={styles.subtitle}>
          {total > 0 ? `${total.toLocaleString()} items` : 'Loading...'}
        </Text>
      </View>

      {/* Search bar */}
      <View style={styles.searchBox}>
        <Ionicons name="search-outline" size={18} color={COLORS.neutral400} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search by brand or model..."
          placeholderTextColor={COLORS.neutral400}
          value={search}
          onChangeText={setSearch}
          returnKeyType="search"
        />
        {search ? (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={COLORS.neutral400} />
          </TouchableOpacity>
        ) : null}
      </View>

      {/* Category pills */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.catScroll}
        contentContainerStyle={styles.catContent}
      >
        {CATEGORIES.map((cat) => (
          <TouchableOpacity
            key={cat.value}
            style={[styles.catPill, category === cat.value && styles.catPillActive]}
            onPress={() => setCategory(cat.value)}
          >
            <Text style={[styles.catText, category === cat.value && styles.catTextActive]}>
              {cat.label}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>

      {/* Gear list */}
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={COLORS.primary500} />
        </View>
      ) : (
        <FlatList
          data={gear}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.row}
          contentContainerStyle={styles.list}
          refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadGear(1, true); }} tintColor={COLORS.primary500} />}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.3}
          renderItem={({ item }) => (
            <TouchableOpacity
              style={styles.gearCard}
              onPress={() => { setSelectedItem(item); setDetailOpen(true); }}
              activeOpacity={0.7}
            >
              <View style={styles.gearImageBox}>
                {item.image_url ? (
                  <Image source={{ uri: item.image_url }} style={styles.gearImage} resizeMode="contain" />
                ) : (
                  <Ionicons name="layers-outline" size={32} color={COLORS.neutral300} />
                )}
                {ownedIds.has(item.id) && (
                  <View style={styles.ownedDot}>
                    <Ionicons name="checkmark" size={10} color={COLORS.white} />
                  </View>
                )}
              </View>
              <Text style={styles.gearBrand} numberOfLines={1}>{item.brand}</Text>
              <Text style={styles.gearModel} numberOfLines={2}>{item.model}</Text>
              <Text style={styles.gearWeight}>{formatWeightGrams(item.weight_grams)}</Text>
            </TouchableOpacity>
          )}
          ListFooterComponent={
            loadingMore ? (
              <View style={{ padding: 20, alignItems: 'center' }}>
                <ActivityIndicator color={COLORS.primary500} />
              </View>
            ) : gear.length > 0 && gear.length < total ? (
              <TouchableOpacity style={styles.loadMoreBtn} onPress={handleLoadMore}>
                <Text style={styles.loadMoreText}>Load More</Text>
              </TouchableOpacity>
            ) : null
          }
          ListEmptyComponent={
            <View style={styles.center}>
              <Ionicons name="search-outline" size={40} color={COLORS.neutral300} />
              <Text style={styles.emptyText}>No gear found</Text>
              <Text style={styles.emptyHint}>Try a different search or category</Text>
            </View>
          }
        />
      )}

      {/* Gear Detail Modal */}
      <Modal visible={detailOpen} animationType="slide" presentationStyle="pageSheet" onRequestClose={() => setDetailOpen(false)}>
        {selectedItem && (
          <View style={styles.detailContainer}>
            <View style={styles.detailHeader}>
              <Text style={styles.detailTitle} numberOfLines={2}>{selectedItem.brand} {selectedItem.model}</Text>
              <TouchableOpacity onPress={() => setDetailOpen(false)}>
                <Ionicons name="close" size={24} color={COLORS.neutral700} />
              </TouchableOpacity>
            </View>

            <ScrollView contentContainerStyle={styles.detailScroll}>
              {selectedItem.image_url ? (
                <View style={styles.detailImageBox}>
                  <Image source={{ uri: selectedItem.image_url }} style={styles.detailImage} resizeMode="contain" />
                </View>
              ) : (
                <View style={[styles.detailImageBox, { justifyContent: 'center', alignItems: 'center' }]}>
                  <Ionicons name="layers-outline" size={64} color={COLORS.neutral300} />
                </View>
              )}

              <View style={styles.detailInfo}>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Weight</Text>
                  <Text style={[styles.detailValue, { color: COLORS.primary600, fontWeight: '700' }]}>
                    {formatWeightGrams(selectedItem.weight_grams)}
                  </Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Category</Text>
                  <Text style={styles.detailValue}>{selectedItem.category?.replace(/_/g, ' ')}</Text>
                </View>
                {selectedItem.capacity ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Capacity</Text>
                    <Text style={styles.detailValue}>{selectedItem.capacity}L</Text>
                  </View>
                ) : null}
                {selectedItem.season_rating ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Season</Text>
                    <Text style={styles.detailValue}>{selectedItem.season_rating}</Text>
                  </View>
                ) : null}
                {selectedItem.materials ? (
                  <View style={styles.detailRow}>
                    <Text style={styles.detailLabel}>Materials</Text>
                    <Text style={styles.detailValue}>{selectedItem.materials}</Text>
                  </View>
                ) : null}
              </View>

              {/* Mark as Owned - only for catalog items */}
              {!selectedItem.user_id && (
                <TouchableOpacity
                  style={[styles.ownBtn, ownedIds.has(selectedItem.id) && styles.ownBtnActive, ownershipLoading && { opacity: 0.6 }]}
                  onPress={() => handleToggleOwned(selectedItem.id)}
                  disabled={ownershipLoading}
                >
                  <Ionicons
                    name={ownedIds.has(selectedItem.id) ? 'checkmark-circle' : 'add-circle-outline'}
                    size={20}
                    color={ownedIds.has(selectedItem.id) ? COLORS.success : COLORS.primary500}
                  />
                  <Text style={[styles.ownBtnText, ownedIds.has(selectedItem.id) && styles.ownBtnTextActive]}>
                    {ownedIds.has(selectedItem.id) ? 'Owned' : 'Mark as Owned'}
                  </Text>
                </TouchableOpacity>
              )}
            </ScrollView>
          </View>
        )}
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  header: {
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 10,
    backgroundColor: COLORS.surfaceElevated,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
  },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.neutral900 },
  subtitle: { fontSize: 13, color: COLORS.neutral500, marginTop: 2 },
  searchBox: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    backgroundColor: COLORS.surfaceElevated, borderRadius: 12,
    margin: 12, paddingHorizontal: 12, borderWidth: 1, borderColor: COLORS.border, height: 46,
  },
  searchInput: { flex: 1, fontSize: 15, color: COLORS.neutral900 },
  catScroll: { maxHeight: 44 },
  catContent: { paddingHorizontal: 12, gap: 6, alignItems: 'center' },
  catPill: { paddingHorizontal: 14, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.neutral100, marginRight: 6 },
  catPillActive: { backgroundColor: COLORS.primary500 },
  catText: { fontSize: 13, fontWeight: '500', color: COLORS.neutral700 },
  catTextActive: { color: COLORS.white },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingTop: 60, gap: 10 },
  emptyText: { fontSize: 16, fontWeight: '600', color: COLORS.neutral600 },
  emptyHint: { fontSize: 13, color: COLORS.neutral400 },
  list: { padding: 12, paddingBottom: 40 },
  row: { gap: 10 },
  gearCard: {
    flex: 1, backgroundColor: COLORS.surfaceElevated,
    borderRadius: 12, padding: 10, marginBottom: 10,
    borderWidth: 1, borderColor: COLORS.border,
  },
  gearImageBox: {
    width: '100%', height: 110,
    borderRadius: 8, backgroundColor: COLORS.neutral50,
    alignItems: 'center', justifyContent: 'center',
    marginBottom: 8, overflow: 'visible',
  },
  gearImage: { width: '100%', height: '100%', borderRadius: 8 },
  ownedDot: {
    position: 'absolute', top: 4, right: 4,
    width: 20, height: 20, borderRadius: 10,
    backgroundColor: COLORS.success, alignItems: 'center', justifyContent: 'center',
  },
  gearBrand: { fontSize: 11, color: COLORS.neutral500, marginBottom: 2 },
  gearModel: { fontSize: 13, fontWeight: '600', color: COLORS.neutral900, marginBottom: 4, minHeight: 34 },
  gearWeight: { fontSize: 12, fontWeight: '600', color: COLORS.primary600 },
  loadMoreBtn: {
    margin: 12, padding: 14, borderRadius: 12,
    backgroundColor: COLORS.primary50, alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.primary200,
  },
  loadMoreText: { fontSize: 14, fontWeight: '600', color: COLORS.primary600 },
  // Detail modal
  detailContainer: { flex: 1, backgroundColor: COLORS.surface },
  detailHeader: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    padding: 16, borderBottomWidth: 1, borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surfaceElevated,
  },
  detailTitle: { fontSize: 18, fontWeight: '700', color: COLORS.neutral900, flex: 1, marginRight: 12 },
  detailScroll: { padding: 16, paddingBottom: 40 },
  detailImageBox: {
    width: '100%', height: 220,
    backgroundColor: COLORS.surfaceElevated, borderRadius: 16,
    marginBottom: 16, overflow: 'hidden',
    borderWidth: 1, borderColor: COLORS.border,
  },
  detailImage: { width: '100%', height: '100%' },
  detailInfo: {
    backgroundColor: COLORS.surfaceElevated, borderRadius: 14,
    padding: 14, marginBottom: 14,
    borderWidth: 1, borderColor: COLORS.border,
  },
  detailRow: {
    flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
    paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: COLORS.neutral100,
  },
  detailLabel: { fontSize: 13, color: COLORS.neutral500, fontWeight: '500', textTransform: 'capitalize' },
  detailValue: { fontSize: 14, color: COLORS.neutral900, textTransform: 'capitalize', maxWidth: '60%', textAlign: 'right' },
  ownBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 50, borderRadius: 12, borderWidth: 2, borderColor: COLORS.primary200,
    backgroundColor: COLORS.primary50,
  },
  ownBtnActive: { borderColor: COLORS.success, backgroundColor: COLORS.successLight },
  ownBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.primary600 },
  ownBtnTextActive: { color: COLORS.success },
});
