import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  TextInput,
  Modal,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import BagCard from '../../../components/BagCard';
import { getBags, deleteBag, duplicateBag, createCustomGear } from '../../../services/api';
import { COLORS } from '../../../constants/colors';

const GEAR_CATEGORIES = [
  { value: 'backpack', label: 'Backpack' },
  { value: 'tent', label: 'Tent' },
  { value: 'sleeping_bag', label: 'Sleeping Bag' },
  { value: 'sleeping_pad', label: 'Sleeping Pad' },
  { value: 'stove', label: 'Stove' },
  { value: 'cookware', label: 'Cookware' },
  { value: 'clothing', label: 'Clothing' },
  { value: 'footwear', label: 'Footwear' },
  { value: 'accessory', label: 'Accessory' },
  { value: 'other', label: 'Other' },
];

export default function BagList() {
  const router = useRouter();
  const [bags, setBags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Custom gear modal
  const [customModalOpen, setCustomModalOpen] = useState(false);
  const [customForm, setCustomForm] = useState({ brand: '', model: '', category: 'backpack', weight_grams: '' });
  const [customLoading, setCustomLoading] = useState(false);
  const [customError, setCustomError] = useState('');

  // Duplicate modal
  const [dupeModalOpen, setDupeModalOpen] = useState(false);
  const [dupeName, setDupeName] = useState('');
  const [dupeBagId, setDupeBagId] = useState(null);

  useFocusEffect(
    useCallback(() => {
      loadBags();
    }, [])
  );

  const loadBags = async () => {
    try {
      const data = await getBags();
      setBags(data);
    } catch (err) {
      console.error('Load bags:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleRefresh = () => {
    setRefreshing(true);
    loadBags();
  };

  const handleDelete = (id, name) => {
    Alert.alert('Delete Bag', `Delete "${name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteBag(id);
            setBags((prev) => prev.filter((b) => b.id !== id));
          } catch {
            Alert.alert('Error', "Couldn't delete bag. Try again.");
          }
        },
      },
    ]);
  };

  const openDuplicate = (id, name) => {
    setDupeBagId(id);
    setDupeName(`${name} (copy)`);
    setDupeModalOpen(true);
  };

  const handleDuplicate = async () => {
    if (!dupeName.trim() || !dupeBagId) return;
    try {
      const newBag = await duplicateBag(dupeBagId, dupeName.trim());
      setBags((prev) => [newBag, ...prev]);
      setDupeModalOpen(false);
    } catch {
      Alert.alert('Error', "Couldn't duplicate bag.");
    }
  };

  const handleAddCustomGear = async () => {
    setCustomError('');
    const w = Number(customForm.weight_grams);
    if (!customForm.brand.trim() || !customForm.model.trim() || !w || w < 1) {
      setCustomError('Brand, model, category, and weight (positive grams) are required.');
      return;
    }
    setCustomLoading(true);
    try {
      await createCustomGear({
        brand: customForm.brand.trim(),
        model: customForm.model.trim(),
        category: customForm.category,
        weight_grams: w,
      });
      setCustomModalOpen(false);
      setCustomForm({ brand: '', model: '', category: 'backpack', weight_grams: '' });
      Alert.alert('Done', 'Custom gear added! You can now add it to your bags.');
    } catch (err) {
      setCustomError(err.data?.error || 'Failed to add custom gear.');
    } finally {
      setCustomLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading bags...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      {/* Header */}
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>My Bags</Text>
          <Text style={styles.subtitle}>
            {bags.length === 0 ? 'No bags yet' : `${bags.length} bag${bags.length !== 1 ? 's' : ''}`}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <TouchableOpacity style={styles.secondaryBtn} onPress={() => setCustomModalOpen(true)}>
            <Ionicons name="add" size={16} color={COLORS.neutral700} />
            <Text style={styles.secondaryBtnText}>My Gear</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(tabs)/bags/new')}>
            <Ionicons name="add" size={18} color={COLORS.white} />
            <Text style={styles.primaryBtnText}>New Bag</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={bags}
        keyExtractor={(b) => b.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={handleRefresh} tintColor={COLORS.primary500} />}
        renderItem={({ item }) => (
          <BagCard
            bag={item}
            onPress={() => router.push(`/(tabs)/bags/${item.id}`)}
            onEdit={() => router.push(`/(tabs)/bags/${item.id}`)}
            onDelete={() => handleDelete(item.id, item.name)}
            onDuplicate={() => openDuplicate(item.id, item.name)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="bag-outline" size={48} color={COLORS.neutral300} />
            <Text style={styles.emptyTitle}>No bags yet</Text>
            <Text style={styles.emptyText}>Create your first bag to track your gear weight</Text>
            <TouchableOpacity style={styles.primaryBtn} onPress={() => router.push('/(tabs)/bags/new')}>
              <Ionicons name="add" size={18} color={COLORS.white} />
              <Text style={styles.primaryBtnText}>Create First Bag</Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* Duplicate Name Modal */}
      <Modal visible={dupeModalOpen} transparent animationType="fade" onRequestClose={() => setDupeModalOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Duplicate Bag</Text>
            <Text style={styles.modalLabel}>New bag name</Text>
            <TextInput
              style={styles.modalInput}
              value={dupeName}
              onChangeText={setDupeName}
              autoFocus
              selectTextOnFocus
            />
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => setDupeModalOpen(false)}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.modalConfirm} onPress={handleDuplicate}>
                <Text style={styles.modalConfirmText}>Duplicate</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Add Custom Gear Modal */}
      <Modal visible={customModalOpen} transparent animationType="fade" onRequestClose={() => setCustomModalOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add Your Gear</Text>
              <TouchableOpacity onPress={() => { setCustomModalOpen(false); setCustomError(''); }}>
                <Ionicons name="close" size={22} color={COLORS.neutral600} />
              </TouchableOpacity>
            </View>
            <Text style={styles.modalHint}>Add gear not in the catalog. Use it in any bag.</Text>

            {customError ? <Text style={styles.modalError}>{customError}</Text> : null}

            <Text style={styles.modalLabel}>Brand *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Osprey"
              placeholderTextColor={COLORS.neutral400}
              value={customForm.brand}
              onChangeText={(v) => setCustomForm((f) => ({ ...f, brand: v }))}
            />

            <Text style={styles.modalLabel}>Model *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Exos 58"
              placeholderTextColor={COLORS.neutral400}
              value={customForm.model}
              onChangeText={(v) => setCustomForm((f) => ({ ...f, model: v }))}
            />

            <Text style={styles.modalLabel}>Category *</Text>
            <View style={styles.catGrid}>
              {GEAR_CATEGORIES.map((cat) => (
                <TouchableOpacity
                  key={cat.value}
                  style={[styles.catChip, customForm.category === cat.value && styles.catChipActive]}
                  onPress={() => setCustomForm((f) => ({ ...f, category: cat.value }))}
                >
                  <Text style={[styles.catChipText, customForm.category === cat.value && styles.catChipTextActive]}>
                    {cat.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.modalLabel}>Weight (grams) *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 1200"
              placeholderTextColor={COLORS.neutral400}
              value={customForm.weight_grams}
              onChangeText={(v) => setCustomForm((f) => ({ ...f, weight_grams: v }))}
              keyboardType="numeric"
            />

            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setCustomModalOpen(false); setCustomError(''); }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.modalConfirm, customLoading && { opacity: 0.6 }]} onPress={handleAddCustomGear} disabled={customLoading}>
                <Text style={styles.modalConfirmText}>{customLoading ? 'Adding...' : 'Add Gear'}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: COLORS.neutral500, fontSize: 15 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 8,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surfaceElevated,
    flexWrap: 'wrap',
    gap: 8,
  },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.neutral900 },
  subtitle: { fontSize: 13, color: COLORS.neutral500, marginTop: 2 },
  headerActions: { flexDirection: 'row', gap: 8, alignItems: 'center' },
  primaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.primary500, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  primaryBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  secondaryBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.neutral100, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 8,
  },
  secondaryBtnText: { color: COLORS.neutral700, fontSize: 14, fontWeight: '500' },
  list: { padding: 16, paddingBottom: 32 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.neutral700 },
  emptyText: { fontSize: 14, color: COLORS.neutral400, textAlign: 'center', paddingHorizontal: 40 },
  // Modal
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 20,
    padding: 20,
    maxHeight: '90%',
  },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.neutral900, marginBottom: 4 },
  modalHint: { fontSize: 13, color: COLORS.neutral500, marginBottom: 16 },
  modalError: { fontSize: 13, color: COLORS.error, marginBottom: 12 },
  modalLabel: { fontSize: 13, fontWeight: '600', color: COLORS.neutral700, marginBottom: 6, marginTop: 4 },
  modalInput: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 12, height: 44, fontSize: 15,
    color: COLORS.neutral900, backgroundColor: COLORS.neutral50,
    marginBottom: 8,
  },
  catGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 6, marginBottom: 12 },
  catChip: { paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, backgroundColor: COLORS.neutral100, borderWidth: 1, borderColor: COLORS.neutral200 },
  catChipActive: { backgroundColor: COLORS.primary500, borderColor: COLORS.primary500 },
  catChipText: { fontSize: 12, fontWeight: '500', color: COLORS.neutral700 },
  catChipTextActive: { color: COLORS.white },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  modalCancel: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  modalCancelText: { fontSize: 15, fontWeight: '500', color: COLORS.neutral700 },
  modalConfirm: { flex: 1, height: 44, borderRadius: 10, backgroundColor: COLORS.primary500, alignItems: 'center', justifyContent: 'center' },
  modalConfirmText: { fontSize: 15, fontWeight: '600', color: COLORS.white },
});
