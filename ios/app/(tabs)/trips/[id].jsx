import { useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
  ScrollView,
  TextInput,
  ActivityIndicator,
  Modal,
} from 'react-native';
import { useLocalSearchParams, useNavigation, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getTrip, getBags, addBagToTrip, removeBagFromTrip, updateTrip, updateTripStats } from '../../../services/api';
import { COLORS } from '../../../constants/colors';
import { getWeightCategory, formatWeight } from '../../../constants/weightCategories';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  return new Date(dateStr).toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
};

export default function TripDetail() {
  const { id } = useLocalSearchParams();
  const navigation = useNavigation();
  const [trip, setTrip] = useState(null);
  const [allBags, setAllBags] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Edit trip
  const [editingTrip, setEditingTrip] = useState(false);
  const [tripForm, setTripForm] = useState({ name: '', location_text: '', notes: '' });

  // Edit stats
  const [editingStats, setEditingStats] = useState(false);
  const [statsForm, setStatsForm] = useState({ nights: '', miles: '', elevation_gain_ft: '', weather_notes: '', lessons_learned: '' });

  // Add bag modal
  const [bagModalOpen, setBagModalOpen] = useState(false);
  const [selectedBagId, setSelectedBagId] = useState('');

  useFocusEffect(
    useCallback(() => {
      loadAll();
    }, [id])
  );

  const loadAll = async () => {
    try {
      const [tripData, bagsData] = await Promise.all([getTrip(id), getBags()]);
      setTrip(tripData);
      setAllBags(bagsData);
      navigation.setOptions({ title: tripData.name || 'Trip Details' });
      setTripForm({
        name: tripData.name || '',
        location_text: tripData.location_text || '',
        notes: tripData.notes || '',
      });
      if (tripData.stats) {
        setStatsForm({
          nights: String(tripData.stats.nights || ''),
          miles: String(tripData.stats.miles || ''),
          elevation_gain_ft: String(tripData.stats.elevation_gain_ft || ''),
          weather_notes: tripData.stats.weather_notes || '',
          lessons_learned: tripData.stats.lessons_learned || '',
        });
      }
    } catch (err) {
      console.error('Load trip:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleUpdateTrip = async () => {
    if (!tripForm.name.trim()) { Alert.alert('Required', 'Trip name is required.'); return; }
    try {
      await updateTrip(id, { name: tripForm.name.trim(), location_text: tripForm.location_text.trim() || null, notes: tripForm.notes.trim() || null });
      setEditingTrip(false);
      loadAll();
    } catch {
      Alert.alert('Error', 'Failed to update trip.');
    }
  };

  const handleUpdateStats = async () => {
    try {
      await updateTripStats(id, {
        nights: statsForm.nights ? Number(statsForm.nights) : null,
        miles: statsForm.miles ? Number(statsForm.miles) : null,
        elevation_gain_ft: statsForm.elevation_gain_ft ? Number(statsForm.elevation_gain_ft) : null,
        weather_notes: statsForm.weather_notes || null,
        lessons_learned: statsForm.lessons_learned || null,
      });
      setEditingStats(false);
      loadAll();
    } catch {
      Alert.alert('Error', 'Failed to save stats.');
    }
  };

  const handleAddBag = async () => {
    if (!selectedBagId) { Alert.alert('Select a bag first.'); return; }
    try {
      await addBagToTrip(id, selectedBagId);
      setBagModalOpen(false);
      setSelectedBagId('');
      loadAll();
    } catch (err) {
      Alert.alert('Error', err.data?.error || 'Failed to add bag to trip.');
    }
  };

  const handleRemoveBag = (bagId, bagName) => {
    Alert.alert('Remove Bag', `Remove "${bagName}" from this trip?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Remove', style: 'destructive',
        onPress: async () => {
          try { await removeBagFromTrip(id, bagId); loadAll(); }
          catch { Alert.alert('Error', 'Failed to remove bag.'); }
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

  if (!trip) {
    return <View style={styles.center}><Text style={styles.errorText}>Trip not found.</Text></View>;
  }

  const availableBags = allBags.filter((b) => !trip.bags?.some((tb) => tb.id === b.id));

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scroll}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadAll(); }} tintColor={COLORS.primary500} />}
    >
      {/* Trip header card */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <View style={{ flex: 1 }}>
            <Text style={styles.tripName}>{trip.name}</Text>
            {trip.location_text ? (
              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={14} color={COLORS.accent500} />
                <Text style={styles.metaText}>{trip.location_text}</Text>
              </View>
            ) : null}
            {trip.start_date ? (
              <View style={styles.metaRow}>
                <Ionicons name="calendar-outline" size={14} color={COLORS.neutral400} />
                <Text style={styles.metaText}>
                  {formatDate(trip.start_date)}{trip.end_date ? ` — ${formatDate(trip.end_date)}` : ''}
                </Text>
              </View>
            ) : null}
            {trip.notes ? <Text style={styles.tripNotes}>{trip.notes}</Text> : null}
          </View>
          <TouchableOpacity style={styles.editChip} onPress={() => setEditingTrip(!editingTrip)}>
            <Ionicons name={editingTrip ? 'close' : 'pencil-outline'} size={14} color={COLORS.neutral600} />
            <Text style={styles.editChipText}>{editingTrip ? 'Cancel' : 'Edit'}</Text>
          </TouchableOpacity>
        </View>

        {editingTrip && (
          <View style={styles.editForm}>
            <Text style={styles.label}>Name *</Text>
            <TextInput style={styles.input} value={tripForm.name} onChangeText={(v) => setTripForm((f) => ({ ...f, name: v }))} />
            <Text style={styles.label}>Location</Text>
            <TextInput style={styles.input} value={tripForm.location_text} onChangeText={(v) => setTripForm((f) => ({ ...f, location_text: v }))} />
            <Text style={styles.label}>Notes</Text>
            <TextInput style={[styles.input, styles.textArea]} value={tripForm.notes} onChangeText={(v) => setTripForm((f) => ({ ...f, notes: v }))} multiline numberOfLines={3} textAlignVertical="top" />
            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateTrip}>
              <Text style={styles.saveBtnText}>Save Changes</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Bags section */}
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text style={styles.sectionTitle}>Bags ({trip.bags?.length || 0})</Text>
          <TouchableOpacity style={styles.addBagBtn} onPress={() => setBagModalOpen(true)} disabled={availableBags.length === 0}>
            <Ionicons name="add" size={16} color={availableBags.length === 0 ? COLORS.neutral400 : COLORS.white} />
            <Text style={[styles.addBagBtnText, availableBags.length === 0 && { color: COLORS.neutral400 }]}>Add Bag</Text>
          </TouchableOpacity>
        </View>

        {trip.bags && trip.bags.length > 0 ? (
          trip.bags.map((bag) => {
            const cat = getWeightCategory(bag.total_weight_grams || 0);
            return (
              <View key={bag.id} style={styles.bagRow}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bagName} numberOfLines={1}>{bag.name}</Text>
                  <Text style={styles.bagSub}>{bag.backpack_brand} {bag.backpack_model}</Text>
                  <View style={styles.bagMeta}>
                    <Text style={[styles.bagWeight, { color: cat.color }]}>{formatWeight(bag.total_weight_grams)}</Text>
                    <View style={[styles.badge, { backgroundColor: cat.bg }]}>
                      <Text style={[styles.badgeText, { color: cat.color }]}>{cat.label}</Text>
                    </View>
                    <View style={styles.roleBadge}>
                      <Text style={styles.roleText}>{bag.role}</Text>
                    </View>
                  </View>
                </View>
                <TouchableOpacity onPress={() => handleRemoveBag(bag.id, bag.name)} style={styles.removeBtn}>
                  <Ionicons name="close-circle-outline" size={22} color={COLORS.error} />
                </TouchableOpacity>
              </View>
            );
          })
        ) : (
          <View style={styles.emptySection}>
            <Text style={styles.emptyText}>No bags added yet</Text>
          </View>
        )}
      </View>

      {/* Stats section */}
      <View style={styles.card}>
        <View style={styles.cardHeader}>
          <Text style={styles.sectionTitle}>Trip Stats</Text>
          <TouchableOpacity style={styles.editChip} onPress={() => setEditingStats(!editingStats)}>
            <Text style={styles.editChipText}>{editingStats ? 'Cancel' : 'Edit Stats'}</Text>
          </TouchableOpacity>
        </View>

        {!editingStats ? (
          trip.stats && (trip.stats.nights || trip.stats.miles || trip.stats.elevation_gain_ft) ? (
            <View style={styles.statsGrid}>
              {trip.stats.nights ? <StatBox value={trip.stats.nights} label="Nights" /> : null}
              {trip.stats.miles ? <StatBox value={trip.stats.miles} label="Miles" /> : null}
              {trip.stats.elevation_gain_ft ? <StatBox value={Number(trip.stats.elevation_gain_ft).toLocaleString()} label="Elev. (ft)" /> : null}
            </View>
          ) : (
            <View style={styles.emptySection}>
              <Text style={styles.emptyText}>No stats recorded yet</Text>
              <TouchableOpacity style={styles.editChip} onPress={() => setEditingStats(true)}>
                <Text style={styles.editChipText}>Add Stats</Text>
              </TouchableOpacity>
            </View>
          )
        ) : (
          <View style={styles.editForm}>
            <View style={styles.statsInputRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Nights</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={statsForm.nights} onChangeText={(v) => setStatsForm((f) => ({ ...f, nights: v }))} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Miles</Text>
                <TextInput style={styles.input} keyboardType="decimal-pad" value={statsForm.miles} onChangeText={(v) => setStatsForm((f) => ({ ...f, miles: v }))} />
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.label}>Elevation (ft)</Text>
                <TextInput style={styles.input} keyboardType="numeric" value={statsForm.elevation_gain_ft} onChangeText={(v) => setStatsForm((f) => ({ ...f, elevation_gain_ft: v }))} />
              </View>
            </View>
            <Text style={styles.label}>Weather Notes</Text>
            <TextInput style={[styles.input, styles.textArea]} value={statsForm.weather_notes} onChangeText={(v) => setStatsForm((f) => ({ ...f, weather_notes: v }))} multiline numberOfLines={2} textAlignVertical="top" />
            <Text style={styles.label}>Lessons Learned</Text>
            <TextInput style={[styles.input, styles.textArea]} value={statsForm.lessons_learned} onChangeText={(v) => setStatsForm((f) => ({ ...f, lessons_learned: v }))} multiline numberOfLines={2} textAlignVertical="top" />
            <TouchableOpacity style={styles.saveBtn} onPress={handleUpdateStats}>
              <Text style={styles.saveBtnText}>Save Stats</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>

      {/* Add Bag Modal */}
      <Modal visible={bagModalOpen} transparent animationType="fade" onRequestClose={() => setBagModalOpen(false)}>
        <View style={styles.overlay}>
          <View style={styles.modalCard}>
            <Text style={styles.modalTitle}>Add Bag to Trip</Text>
            {availableBags.length === 0 ? (
              <Text style={styles.emptyText}>All your bags are already on this trip.</Text>
            ) : (
              <>
                <Text style={styles.label}>Select a bag</Text>
                {availableBags.map((b) => (
                  <TouchableOpacity
                    key={b.id}
                    style={[styles.bagOption, selectedBagId === b.id && styles.bagOptionSelected]}
                    onPress={() => setSelectedBagId(b.id)}
                  >
                    <Text style={[styles.bagOptionText, selectedBagId === b.id && styles.bagOptionTextSelected]}>
                      {b.name} ({formatWeight(b.total_weight_grams)})
                    </Text>
                  </TouchableOpacity>
                ))}
              </>
            )}
            <View style={styles.modalActions}>
              <TouchableOpacity style={styles.modalCancel} onPress={() => { setBagModalOpen(false); setSelectedBagId(''); }}>
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              {availableBags.length > 0 && (
                <TouchableOpacity style={styles.modalConfirm} onPress={handleAddBag}>
                  <Text style={styles.modalConfirmText}>Add to Trip</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function StatBox({ value, label }) {
  return (
    <View style={{ alignItems: 'center' }}>
      <Text style={styles.statValue}>{value}</Text>
      <Text style={styles.statLabel}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  scroll: { padding: 16, paddingBottom: 40 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.surface },
  errorText: { color: COLORS.neutral500 },
  card: {
    backgroundColor: COLORS.surfaceElevated, borderRadius: 16,
    padding: 16, marginBottom: 14, borderWidth: 1, borderColor: COLORS.border,
  },
  cardHeader: { flexDirection: 'row', alignItems: 'flex-start', gap: 10, marginBottom: 4 },
  tripName: { fontSize: 20, fontWeight: '700', color: COLORS.neutral900, marginBottom: 6 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 3 },
  metaText: { fontSize: 13, color: COLORS.neutral600, flex: 1 },
  tripNotes: { fontSize: 13, color: COLORS.neutral600, marginTop: 8 },
  editChip: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, backgroundColor: COLORS.neutral100,
  },
  editChipText: { fontSize: 12, fontWeight: '500', color: COLORS.neutral600 },
  editForm: { marginTop: 16, gap: 4 },
  label: { fontSize: 12, fontWeight: '600', color: COLORS.neutral600, marginBottom: 5, marginTop: 8 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 12, height: 44, fontSize: 14,
    color: COLORS.neutral900, backgroundColor: COLORS.neutral50,
  },
  textArea: { height: 80, paddingTop: 10 },
  saveBtn: { height: 46, backgroundColor: COLORS.primary500, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginTop: 12 },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.white },
  section: { marginBottom: 14 },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.neutral800, flex: 1 },
  addBagBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.primary500, borderRadius: 10,
    paddingHorizontal: 12, paddingVertical: 6,
  },
  addBagBtnText: { fontSize: 13, fontWeight: '600', color: COLORS.white },
  bagRow: {
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated, borderRadius: 12,
    padding: 12, marginBottom: 8, borderWidth: 1, borderColor: COLORS.border,
  },
  bagName: { fontSize: 15, fontWeight: '600', color: COLORS.neutral900 },
  bagSub: { fontSize: 12, color: COLORS.neutral500, marginBottom: 6 },
  bagMeta: { flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' },
  bagWeight: { fontSize: 14, fontWeight: '700' },
  badge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12 },
  badgeText: { fontSize: 11, fontWeight: '600' },
  roleBadge: { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 12, backgroundColor: COLORS.neutral100 },
  roleText: { fontSize: 11, fontWeight: '500', color: COLORS.neutral600, textTransform: 'capitalize' },
  removeBtn: { padding: 4 },
  emptySection: { alignItems: 'center', paddingVertical: 20, gap: 8 },
  emptyText: { fontSize: 13, color: COLORS.neutral400, textAlign: 'center' },
  statsGrid: { flexDirection: 'row', justifyContent: 'space-around', paddingVertical: 8 },
  statsInputRow: { flexDirection: 'row', gap: 8 },
  statValue: { fontSize: 32, fontWeight: '800', color: COLORS.primary600 },
  statLabel: { fontSize: 12, color: COLORS.neutral500, marginTop: 2 },
  overlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', padding: 20 },
  modalCard: { backgroundColor: COLORS.surfaceElevated, borderRadius: 20, padding: 20 },
  modalTitle: { fontSize: 18, fontWeight: '700', color: COLORS.neutral900, marginBottom: 16 },
  bagOption: {
    padding: 12, borderRadius: 10, borderWidth: 1,
    borderColor: COLORS.border, marginBottom: 6, backgroundColor: COLORS.neutral50,
  },
  bagOptionSelected: { borderColor: COLORS.primary500, backgroundColor: COLORS.primary50 },
  bagOptionText: { fontSize: 14, color: COLORS.neutral800 },
  bagOptionTextSelected: { color: COLORS.primary700, fontWeight: '600' },
  modalActions: { flexDirection: 'row', gap: 10, marginTop: 16 },
  modalCancel: { flex: 1, height: 44, borderRadius: 10, borderWidth: 1, borderColor: COLORS.border, alignItems: 'center', justifyContent: 'center' },
  modalCancelText: { fontSize: 15, fontWeight: '500', color: COLORS.neutral700 },
  modalConfirm: { flex: 1, height: 44, borderRadius: 10, backgroundColor: COLORS.primary500, alignItems: 'center', justifyContent: 'center' },
  modalConfirmText: { fontSize: 15, fontWeight: '600', color: COLORS.white },
});
