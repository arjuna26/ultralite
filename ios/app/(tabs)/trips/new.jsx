import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Modal,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { createTrip } from '../../../services/api';
import { COLORS } from '../../../constants/colors';

const formatDate = (dateStr) => {
  if (!dateStr) return '';
  const d = new Date(dateStr + 'T00:00:00');
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

export default function NewTrip() {
  const router = useRouter();
  const [form, setForm] = useState({
    name: '',
    location_text: '',
    start_date: '',
    end_date: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  // Date picker state
  const [showStartPicker, setShowStartPicker] = useState(false);
  const [showEndPicker, setShowEndPicker] = useState(false);

  const handleCreate = async () => {
    if (!form.name.trim()) { Alert.alert('Required', 'Trip name is required.'); return; }
    if (!form.start_date) { Alert.alert('Required', 'Start date is required.'); return; }
    if (!form.end_date) { Alert.alert('Required', 'End date is required.'); return; }

    setLoading(true);
    try {
      await createTrip({
        name: form.name.trim(),
        location_text: form.location_text.trim() || undefined,
        start_date: form.start_date,
        end_date: form.end_date,
        notes: form.notes.trim() || undefined,
      });
      router.back();
    } catch (err) {
      Alert.alert('Error', err.data?.error || 'Failed to create trip.');
    } finally {
      setLoading(false);
    }
  };

  const handleStartDate = (event, date) => {
    setShowStartPicker(false);
    if (date) {
      const iso = date.toISOString().split('T')[0];
      setForm((f) => ({ ...f, start_date: iso }));
    }
  };

  const handleEndDate = (event, date) => {
    setShowEndPicker(false);
    if (date) {
      const iso = date.toISOString().split('T')[0];
      setForm((f) => ({ ...f, end_date: iso }));
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        <View style={styles.card}>
          {/* Trip Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Trip Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. PCT Section Hike"
              placeholderTextColor={COLORS.neutral400}
              value={form.name}
              onChangeText={(v) => setForm((f) => ({ ...f, name: v }))}
            />
          </View>

          {/* Location */}
          <View style={styles.field}>
            <Text style={styles.label}>Location</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Glacier National Park, MT"
              placeholderTextColor={COLORS.neutral400}
              value={form.location_text}
              onChangeText={(v) => setForm((f) => ({ ...f, location_text: v }))}
            />
          </View>

          {/* Dates */}
          <View style={styles.dateRow}>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>Start Date *</Text>
              <TouchableOpacity style={styles.datePicker} onPress={() => setShowStartPicker(true)}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.neutral500} />
                <Text style={[styles.dateText, !form.start_date && styles.datePlaceholder]}>
                  {form.start_date ? formatDate(form.start_date) : 'Select date'}
                </Text>
              </TouchableOpacity>
            </View>
            <View style={[styles.field, { flex: 1 }]}>
              <Text style={styles.label}>End Date *</Text>
              <TouchableOpacity style={styles.datePicker} onPress={() => setShowEndPicker(true)}>
                <Ionicons name="calendar-outline" size={16} color={COLORS.neutral500} />
                <Text style={[styles.dateText, !form.end_date && styles.datePlaceholder]}>
                  {form.end_date ? formatDate(form.end_date) : 'Select date'}
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Notes */}
          <View style={styles.field}>
            <Text style={styles.label}>Notes</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Planning notes, gear reminders..."
              placeholderTextColor={COLORS.neutral400}
              value={form.notes}
              onChangeText={(v) => setForm((f) => ({ ...f, notes: v }))}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.createBtn, loading && { opacity: 0.6 }]}
            onPress={handleCreate}
            disabled={loading}
          >
            <Ionicons name="add" size={20} color={COLORS.white} />
            <Text style={styles.createBtnText}>{loading ? 'Creating...' : 'Create Trip'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* iOS DateTimePicker */}
      {showStartPicker && (
        <DateTimePicker
          mode="date"
          value={form.start_date ? new Date(form.start_date + 'T00:00:00') : new Date()}
          onChange={handleStartDate}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        />
      )}
      {showEndPicker && (
        <DateTimePicker
          mode="date"
          value={form.end_date ? new Date(form.end_date + 'T00:00:00') : new Date()}
          onChange={handleEndDate}
          minimumDate={form.start_date ? new Date(form.start_date + 'T00:00:00') : undefined}
          display={Platform.OS === 'ios' ? 'spinner' : 'default'}
        />
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  scroll: { padding: 16, paddingBottom: 40 },
  card: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.neutral700, marginBottom: 7 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 14, height: 48, fontSize: 15,
    color: COLORS.neutral900, backgroundColor: COLORS.neutral50,
  },
  textArea: { height: 90, paddingTop: 12 },
  dateRow: { flexDirection: 'row', gap: 10 },
  datePicker: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 12, height: 48, backgroundColor: COLORS.neutral50,
  },
  dateText: { fontSize: 14, color: COLORS.neutral900, flex: 1 },
  datePlaceholder: { color: COLORS.neutral400 },
  createBtn: {
    height: 52, backgroundColor: COLORS.primary500, borderRadius: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
    marginTop: 4,
  },
  createBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
});
