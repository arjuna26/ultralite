import { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { useRouter, useFocusEffect } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import TripCard from '../../../components/TripCard';
import { getTrips, deleteTrip } from '../../../services/api';
import { COLORS } from '../../../constants/colors';

export default function TripList() {
  const router = useRouter();
  const [trips, setTrips] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  useFocusEffect(
    useCallback(() => {
      loadTrips();
    }, [])
  );

  const loadTrips = async () => {
    try {
      const data = await getTrips();
      setTrips(data);
    } catch (err) {
      console.error('Load trips:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleDelete = (id, name) => {
    Alert.alert('Delete Trip', `Delete "${name}"? This cannot be undone.`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteTrip(id);
            setTrips((prev) => prev.filter((t) => t.id !== id));
          } catch {
            Alert.alert('Error', "Couldn't delete trip.");
          }
        },
      },
    ]);
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.center}>
          <Text style={styles.loadingText}>Loading trips...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe}>
      <View style={styles.header}>
        <View>
          <Text style={styles.title}>Trips</Text>
          <Text style={styles.subtitle}>
            {trips.length === 0 ? 'Plan your next adventure' : `${trips.length} trip${trips.length !== 1 ? 's' : ''}`}
          </Text>
        </View>
        <TouchableOpacity style={styles.newBtn} onPress={() => router.push('/(tabs)/trips/new')}>
          <Ionicons name="add" size={18} color={COLORS.white} />
          <Text style={styles.newBtnText}>New Trip</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={trips}
        keyExtractor={(t) => t.id}
        contentContainerStyle={styles.list}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={() => { setRefreshing(true); loadTrips(); }} tintColor={COLORS.primary500} />}
        renderItem={({ item }) => (
          <TripCard
            trip={item}
            onPress={() => router.push(`/(tabs)/trips/${item.id}`)}
            onDelete={() => handleDelete(item.id, item.name)}
          />
        )}
        ListEmptyComponent={
          <View style={styles.empty}>
            <Ionicons name="map-outline" size={48} color={COLORS.neutral300} />
            <Text style={styles.emptyTitle}>No trips yet</Text>
            <Text style={styles.emptyText}>
              Create a trip to plan your next adventure and track your gear
            </Text>
            <TouchableOpacity style={styles.newBtn} onPress={() => router.push('/(tabs)/trips/new')}>
              <Ionicons name="add" size={18} color={COLORS.white} />
              <Text style={styles.newBtnText}>Plan First Trip</Text>
            </TouchableOpacity>
          </View>
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  loadingText: { color: COLORS.neutral500, fontSize: 15 },
  header: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
    paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12,
    borderBottomWidth: 1, borderBottomColor: COLORS.border,
    backgroundColor: COLORS.surfaceElevated,
  },
  title: { fontSize: 22, fontWeight: '700', color: COLORS.neutral900 },
  subtitle: { fontSize: 13, color: COLORS.neutral500, marginTop: 2 },
  newBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    backgroundColor: COLORS.primary500, borderRadius: 10,
    paddingHorizontal: 14, paddingVertical: 8,
  },
  newBtnText: { color: COLORS.white, fontSize: 14, fontWeight: '600' },
  list: { padding: 16, paddingBottom: 32 },
  empty: { alignItems: 'center', paddingTop: 60, gap: 12 },
  emptyTitle: { fontSize: 18, fontWeight: '600', color: COLORS.neutral700 },
  emptyText: { fontSize: 14, color: COLORS.neutral400, textAlign: 'center', paddingHorizontal: 40 },
});
