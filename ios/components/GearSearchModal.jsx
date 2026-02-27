import { useState, useEffect, useCallback } from 'react';
import {
  Modal,
  View,
  Text,
  TextInput,
  FlatList,
  TouchableOpacity,
  ActivityIndicator,
  StyleSheet,
  Image,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/colors';
import { getGear } from '../services/api';
import { formatWeightGrams } from '../constants/weightCategories';

const ALL_CATEGORIES = [
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

const LIMIT = 10;

export default function GearSearchModal({ isVisible, onClose, onSelect, restrictCategory, title }) {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState(restrictCategory || '');
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(false);
  const [offset, setOffset] = useState(0);
  const [total, setTotal] = useState(0);

  const categories = restrictCategory
    ? ALL_CATEGORIES.filter((c) => c.value === '' || c.value === restrictCategory)
    : ALL_CATEGORIES;

  const loadGear = useCallback(async (newOffset = 0, reset = true) => {
    if (!search && !category) {
      if (reset) { setItems([]); setTotal(0); }
      return;
    }
    setLoading(true);
    try {
      const params = { limit: LIMIT, offset: newOffset };
      if (search) params.search = search;
      if (category) params.category = category;
      const data = await getGear(params);
      const newItems = data.items || data;
      const totalCount = data.total || newItems.length;
      setTotal(totalCount);
      setItems(reset ? newItems : (prev) => [...prev, ...newItems]);
      setOffset(newOffset);
    } catch (err) {
      console.error('Gear search error:', err);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      loadGear(0, true);
    }, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [search, category]);

  const handleClose = () => {
    setSearch('');
    setCategory(restrictCategory || '');
    setItems([]);
    setOffset(0);
    onClose();
  };

  const handleSelect = (item) => {
    handleClose();
    onSelect(item);
  };

  const loadMore = () => {
    if (items.length < total && !loading) {
      loadGear(offset + LIMIT, false);
    }
  };

  return (
    <Modal visible={isVisible} animationType="slide" presentationStyle="pageSheet" onRequestClose={handleClose}>
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>{title || 'Search Gear'}</Text>
          <TouchableOpacity onPress={handleClose} style={styles.closeBtn}>
            <Ionicons name="close" size={24} color={COLORS.neutral700} />
          </TouchableOpacity>
        </View>

        {/* Search bar */}
        <View style={styles.searchBox}>
          <Ionicons name="search-outline" size={18} color={COLORS.neutral400} style={styles.searchIcon} />
          <TextInput
            style={styles.searchInput}
            placeholder="Search by brand or model..."
            placeholderTextColor={COLORS.neutral400}
            value={search}
            onChangeText={setSearch}
            autoFocus
            returnKeyType="search"
          />
          {search ? (
            <TouchableOpacity onPress={() => setSearch('')}>
              <Ionicons name="close-circle" size={18} color={COLORS.neutral400} />
            </TouchableOpacity>
          ) : null}
        </View>

        {/* Category filters */}
        {!restrictCategory && (
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categories}
            contentContainerStyle={styles.categoriesContent}
          >
            {categories.map((cat) => (
              <TouchableOpacity
                key={cat.value}
                style={[styles.catPill, category === cat.value && styles.catPillActive]}
                onPress={() => setCategory(cat.value)}
              >
                <Text style={[styles.catPillText, category === cat.value && styles.catPillTextActive]}>
                  {cat.label}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        )}

        {/* Results */}
        {loading && items.length === 0 ? (
          <View style={styles.center}>
            <ActivityIndicator size="large" color={COLORS.primary500} />
          </View>
        ) : !search && !category ? (
          <View style={styles.center}>
            <Ionicons name="search-outline" size={40} color={COLORS.neutral300} />
            <Text style={styles.emptyText}>Type to search gear</Text>
          </View>
        ) : items.length === 0 && !loading ? (
          <View style={styles.center}>
            <Text style={styles.emptyText}>No gear found</Text>
          </View>
        ) : (
          <FlatList
            data={items}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity style={styles.resultItem} onPress={() => handleSelect(item)}>
                <View style={styles.resultImage}>
                  {item.image_url ? (
                    <Image source={{ uri: item.image_url }} style={styles.resultImg} resizeMode="contain" />
                  ) : (
                    <Ionicons name="layers-outline" size={20} color={COLORS.neutral400} />
                  )}
                </View>
                <View style={styles.resultInfo}>
                  <Text style={styles.resultName} numberOfLines={1}>
                    {item.brand} {item.model}
                  </Text>
                  <Text style={styles.resultMeta}>
                    {item.category?.replace(/_/g, ' ')} · {formatWeightGrams(item.weight_grams)}
                  </Text>
                </View>
                <Ionicons name="add-circle" size={24} color={COLORS.primary500} />
              </TouchableOpacity>
            )}
            onEndReached={loadMore}
            onEndReachedThreshold={0.3}
            ListFooterComponent={
              items.length < total ? (
                <TouchableOpacity style={styles.loadMore} onPress={loadMore}>
                  {loading ? (
                    <ActivityIndicator size="small" color={COLORS.primary500} />
                  ) : (
                    <Text style={styles.loadMoreText}>Load more</Text>
                  )}
                </TouchableOpacity>
              ) : null
            }
          />
        )}
      </KeyboardAvoidingView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.surface,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surfaceElevated,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: COLORS.neutral900,
  },
  closeBtn: {
    padding: 4,
  },
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    margin: 12,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.border,
    height: 48,
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 15,
    color: COLORS.neutral900,
  },
  categories: {
    maxHeight: 44,
    marginBottom: 8,
  },
  categoriesContent: {
    paddingHorizontal: 12,
    gap: 6,
  },
  catPill: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.neutral100,
    marginRight: 6,
  },
  catPillActive: {
    backgroundColor: COLORS.primary500,
  },
  catPillText: {
    fontSize: 13,
    fontWeight: '500',
    color: COLORS.neutral700,
  },
  catPillTextActive: {
    color: COLORS.white,
  },
  center: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: COLORS.neutral400,
  },
  resultItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.neutral100,
    backgroundColor: COLORS.surfaceElevated,
  },
  resultImage: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: COLORS.neutral50,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
    overflow: 'hidden',
  },
  resultImg: {
    width: 44,
    height: 44,
  },
  resultInfo: {
    flex: 1,
  },
  resultName: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.neutral900,
    marginBottom: 2,
  },
  resultMeta: {
    fontSize: 12,
    color: COLORS.neutral500,
    textTransform: 'capitalize',
  },
  loadMore: {
    padding: 16,
    alignItems: 'center',
  },
  loadMoreText: {
    fontSize: 14,
    fontWeight: '500',
    color: COLORS.primary600,
  },
});
