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
  Image,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import GearSearchModal from '../../../components/GearSearchModal';
import { createBag } from '../../../services/api';
import { COLORS } from '../../../constants/colors';

export default function NewBag() {
  const router = useRouter();
  const [bagName, setBagName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedBackpack, setSelectedBackpack] = useState(null);
  const [backpackModalOpen, setBackpackModalOpen] = useState(false);
  const [loading, setLoading] = useState(false);

  const handleCreate = async () => {
    if (!bagName.trim()) { Alert.alert('Missing field', 'Please enter a bag name.'); return; }
    if (!selectedBackpack) { Alert.alert('Missing field', 'Please choose a backpack.'); return; }

    setLoading(true);
    try {
      const bag = await createBag({
        name: bagName.trim(),
        backpack_gear_item_id: selectedBackpack.id,
        description: description.trim() || undefined,
      });
      // Navigate to the new bag's detail screen
      router.replace(`/(tabs)/bags/${bag.id}`);
    } catch (err) {
      Alert.alert('Error', err.data?.error || 'Failed to create bag. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
      <ScrollView style={styles.container} contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
        {/* Backpack preview */}
        {selectedBackpack && (
          <View style={styles.backpackPreview}>
            {selectedBackpack.image_url ? (
              <Image source={{ uri: selectedBackpack.image_url }} style={styles.backpackImg} resizeMode="contain" />
            ) : (
              <View style={styles.backpackPlaceholder}>
                <Ionicons name="bag-outline" size={64} color={COLORS.neutral300} />
              </View>
            )}
            <Text style={styles.backpackName}>{selectedBackpack.brand} {selectedBackpack.model}</Text>
            <Text style={styles.backpackWeight}>{selectedBackpack.weight_grams}g</Text>
          </View>
        )}

        <View style={styles.form}>
          {/* Bag Name */}
          <View style={styles.field}>
            <Text style={styles.label}>Bag Name *</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. Glacier 3-Night Solo Pack"
              placeholderTextColor={COLORS.neutral400}
              value={bagName}
              onChangeText={setBagName}
              returnKeyType="next"
            />
          </View>

          {/* Backpack picker */}
          <View style={styles.field}>
            <Text style={styles.label}>Backpack *</Text>
            {selectedBackpack ? (
              <TouchableOpacity
                style={styles.backpackChosen}
                onPress={() => setBackpackModalOpen(true)}
              >
                <View style={styles.backpackThumb}>
                  {selectedBackpack.image_url ? (
                    <Image source={{ uri: selectedBackpack.image_url }} style={{ width: 40, height: 40 }} resizeMode="contain" />
                  ) : (
                    <Ionicons name="bag-outline" size={20} color={COLORS.neutral400} />
                  )}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.backpackChosenName} numberOfLines={1}>
                    {selectedBackpack.brand} {selectedBackpack.model}
                  </Text>
                  <Text style={styles.backpackChosenWeight}>{selectedBackpack.weight_grams}g</Text>
                </View>
                <Text style={styles.changeText}>Change</Text>
              </TouchableOpacity>
            ) : (
              <TouchableOpacity style={styles.backpackSearch} onPress={() => setBackpackModalOpen(true)}>
                <Ionicons name="search-outline" size={18} color={COLORS.neutral400} />
                <Text style={styles.backpackSearchText}>Search backpacks...</Text>
              </TouchableOpacity>
            )}
            <Text style={styles.hint}>Backpack weight is included in total</Text>
          </View>

          {/* Description */}
          <View style={styles.field}>
            <Text style={styles.label}>Description <Text style={styles.optional}>(optional)</Text></Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Notes about this setup — trip type, conditions..."
              placeholderTextColor={COLORS.neutral400}
              value={description}
              onChangeText={setDescription}
              multiline
              numberOfLines={3}
              textAlignVertical="top"
            />
          </View>

          <TouchableOpacity
            style={[styles.createBtn, loading && { opacity: 0.6 }]}
            onPress={handleCreate}
            disabled={loading}
            activeOpacity={0.8}
          >
            <Ionicons name="add" size={20} color={COLORS.white} />
            <Text style={styles.createBtnText}>{loading ? 'Creating...' : 'Create Bag'}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <GearSearchModal
        isVisible={backpackModalOpen}
        onClose={() => setBackpackModalOpen(false)}
        onSelect={(item) => { setSelectedBackpack(item); setBackpackModalOpen(false); }}
        restrictCategory="backpack"
        title="Choose Backpack"
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.surface },
  scroll: { padding: 16, paddingBottom: 40 },
  backpackPreview: {
    alignItems: 'center',
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 16,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  backpackImg: { width: 160, height: 160, marginBottom: 12 },
  backpackPlaceholder: { height: 140, justifyContent: 'center', alignItems: 'center' },
  backpackName: { fontSize: 16, fontWeight: '600', color: COLORS.neutral900, textAlign: 'center' },
  backpackWeight: { fontSize: 13, color: COLORS.neutral500, marginTop: 2 },
  form: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  field: { marginBottom: 18 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.neutral700, marginBottom: 7 },
  optional: { fontWeight: '400', color: COLORS.neutral400 },
  hint: { fontSize: 11, color: COLORS.neutral400, marginTop: 4 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 14, height: 48, fontSize: 15,
    color: COLORS.neutral900, backgroundColor: COLORS.neutral50,
  },
  textArea: { height: 90, paddingTop: 12 },
  backpackSearch: {
    flexDirection: 'row', alignItems: 'center', gap: 8,
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 14, height: 48, backgroundColor: COLORS.neutral50,
  },
  backpackSearchText: { fontSize: 15, color: COLORS.neutral400 },
  backpackChosen: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    padding: 10, backgroundColor: COLORS.neutral50, gap: 10,
  },
  backpackThumb: {
    width: 44, height: 44, borderRadius: 8,
    backgroundColor: COLORS.neutral100, alignItems: 'center', justifyContent: 'center', overflow: 'hidden',
  },
  backpackChosenName: { fontSize: 14, fontWeight: '600', color: COLORS.neutral900 },
  backpackChosenWeight: { fontSize: 12, color: COLORS.neutral500 },
  changeText: { fontSize: 13, fontWeight: '500', color: COLORS.primary600 },
  createBtn: {
    height: 52, backgroundColor: COLORS.primary500, borderRadius: 12,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6,
  },
  createBtnText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
});
