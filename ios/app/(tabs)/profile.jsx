import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useAuth } from '../../context/AuthContext';
import { updateProfile, changePassword } from '../../services/api';
import { removeToken } from '../../services/storage';
import { COLORS } from '../../constants/colors';

export default function Profile() {
  const { user, setUser } = useAuth();
  const [editingNickname, setEditingNickname] = useState(false);
  const [nickname, setNickname] = useState(user?.nickname || '');
  const [nicknameSaving, setNicknameSaving] = useState(false);

  const [editingPassword, setEditingPassword] = useState(false);
  const [currentPw, setCurrentPw] = useState('');
  const [newPw, setNewPw] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [pwSaving, setPwSaving] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleSaveNickname = async () => {
    if (!nickname.trim()) { Alert.alert('Required', 'Nickname cannot be empty.'); return; }
    setNicknameSaving(true);
    try {
      const updated = await updateProfile({ nickname: nickname.trim() });
      setUser((prev) => ({ ...prev, nickname: updated.nickname }));
      setEditingNickname(false);
      Alert.alert('Saved', 'Your nickname has been updated.');
    } catch (err) {
      Alert.alert('Error', err.data?.error || 'Failed to update nickname.');
    } finally {
      setNicknameSaving(false);
    }
  };

  const handleSavePassword = async () => {
    if (!currentPw || !newPw || !confirmPw) { Alert.alert('Required', 'All password fields are required.'); return; }
    if (newPw !== confirmPw) { Alert.alert('Mismatch', 'New passwords do not match.'); return; }
    const hasLetter = /[a-zA-Z]/.test(newPw);
    const hasNumber = /[0-9]/.test(newPw);
    if (newPw.length < 8 || !hasLetter || !hasNumber) {
      Alert.alert('Invalid', 'Password must be 8+ characters with at least one letter and number.');
      return;
    }
    setPwSaving(true);
    try {
      await changePassword(currentPw, newPw);
      setEditingPassword(false);
      setCurrentPw(''); setNewPw(''); setConfirmPw('');
      Alert.alert('Password Changed', 'Your password has been updated successfully.');
    } catch (err) {
      Alert.alert('Error', err.data?.error || 'Failed to change password. Check your current password.');
    } finally {
      setPwSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert('Log Out', 'Are you sure you want to log out?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Log Out',
        style: 'destructive',
        onPress: async () => {
          await removeToken();
          setUser(null);
        },
      },
    ]);
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Profile</Text>
          </View>

          {/* User Info Card */}
          <View style={styles.card}>
            <View style={styles.avatar}>
              <Ionicons name="person" size={32} color={COLORS.white} />
            </View>
            <Text style={styles.displayName}>{user?.nickname || user?.email?.split('@')[0] || 'User'}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>

          {/* Nickname section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Nickname</Text>
              <TouchableOpacity style={styles.editBtn} onPress={() => setEditingNickname(!editingNickname)}>
                <Ionicons name={editingNickname ? 'close' : 'pencil-outline'} size={14} color={COLORS.neutral600} />
                <Text style={styles.editBtnText}>{editingNickname ? 'Cancel' : 'Edit'}</Text>
              </TouchableOpacity>
            </View>

            {!editingNickname ? (
              <Text style={styles.fieldValue}>{user?.nickname || 'Not set'}</Text>
            ) : (
              <View style={styles.editForm}>
                <TextInput
                  style={styles.input}
                  value={nickname}
                  onChangeText={setNickname}
                  placeholder="Your nickname"
                  placeholderTextColor={COLORS.neutral400}
                  autoFocus
                />
                <Text style={styles.hint}>2–50 characters, letters, numbers, spaces, _ or -</Text>
                <TouchableOpacity
                  style={[styles.saveBtn, nicknameSaving && { opacity: 0.6 }]}
                  onPress={handleSaveNickname}
                  disabled={nicknameSaving}
                >
                  <Text style={styles.saveBtnText}>{nicknameSaving ? 'Saving...' : 'Save Nickname'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Change Password section */}
          <View style={styles.section}>
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>Password</Text>
              <TouchableOpacity style={styles.editBtn} onPress={() => setEditingPassword(!editingPassword)}>
                <Ionicons name={editingPassword ? 'close' : 'key-outline'} size={14} color={COLORS.neutral600} />
                <Text style={styles.editBtnText}>{editingPassword ? 'Cancel' : 'Change'}</Text>
              </TouchableOpacity>
            </View>

            {!editingPassword ? (
              <Text style={styles.fieldValue}>••••••••</Text>
            ) : (
              <View style={styles.editForm}>
                <Text style={styles.label}>Current Password</Text>
                <View style={styles.pwBox}>
                  <TextInput
                    style={styles.pwInput}
                    value={currentPw}
                    onChangeText={setCurrentPw}
                    secureTextEntry={!showPw}
                    placeholder="Current password"
                    placeholderTextColor={COLORS.neutral400}
                  />
                  <TouchableOpacity onPress={() => setShowPw(!showPw)} style={styles.eyeBtn}>
                    <Ionicons name={showPw ? 'eye-off-outline' : 'eye-outline'} size={18} color={COLORS.neutral400} />
                  </TouchableOpacity>
                </View>

                <Text style={styles.label}>New Password</Text>
                <TextInput
                  style={styles.input}
                  value={newPw}
                  onChangeText={setNewPw}
                  secureTextEntry={!showPw}
                  placeholder="8+ chars, letter + number"
                  placeholderTextColor={COLORS.neutral400}
                />

                <Text style={styles.label}>Confirm New Password</Text>
                <TextInput
                  style={styles.input}
                  value={confirmPw}
                  onChangeText={setConfirmPw}
                  secureTextEntry={!showPw}
                  placeholder="Repeat new password"
                  placeholderTextColor={COLORS.neutral400}
                />

                <TouchableOpacity
                  style={[styles.saveBtn, pwSaving && { opacity: 0.6 }]}
                  onPress={handleSavePassword}
                  disabled={pwSaving}
                >
                  <Text style={styles.saveBtnText}>{pwSaving ? 'Updating...' : 'Update Password'}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>

          {/* Account info */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Account</Text>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Email</Text>
              <Text style={styles.infoValue} numberOfLines={1}>{user?.email}</Text>
            </View>
          </View>

          {/* Log out */}
          <TouchableOpacity style={styles.logoutBtn} onPress={handleLogout} activeOpacity={0.8}>
            <Ionicons name="log-out-outline" size={20} color={COLORS.error} />
            <Text style={styles.logoutText}>Log Out</Text>
          </TouchableOpacity>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  scroll: { padding: 16, paddingBottom: 40 },
  header: { marginBottom: 16 },
  title: { fontSize: 26, fontWeight: '700', color: COLORS.neutral900 },
  card: {
    backgroundColor: COLORS.surfaceElevated,
    borderRadius: 20, padding: 24, marginBottom: 16,
    alignItems: 'center', borderWidth: 1, borderColor: COLORS.border,
  },
  avatar: {
    width: 72, height: 72, borderRadius: 36,
    backgroundColor: COLORS.primary500, alignItems: 'center', justifyContent: 'center',
    marginBottom: 12,
  },
  displayName: { fontSize: 20, fontWeight: '700', color: COLORS.neutral900, marginBottom: 4 },
  email: { fontSize: 14, color: COLORS.neutral500 },
  section: {
    backgroundColor: COLORS.surfaceElevated, borderRadius: 16,
    padding: 16, marginBottom: 12, borderWidth: 1, borderColor: COLORS.border,
  },
  sectionHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 12 },
  sectionTitle: { fontSize: 16, fontWeight: '700', color: COLORS.neutral800 },
  editBtn: {
    flexDirection: 'row', alignItems: 'center', gap: 4,
    paddingHorizontal: 10, paddingVertical: 5,
    borderRadius: 20, backgroundColor: COLORS.neutral100,
  },
  editBtnText: { fontSize: 12, fontWeight: '500', color: COLORS.neutral600 },
  fieldValue: { fontSize: 15, color: COLORS.neutral700 },
  editForm: { gap: 4 },
  label: { fontSize: 12, fontWeight: '600', color: COLORS.neutral600, marginBottom: 5, marginTop: 8 },
  hint: { fontSize: 11, color: COLORS.neutral400, marginTop: 2 },
  input: {
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    paddingHorizontal: 12, height: 44, fontSize: 14,
    color: COLORS.neutral900, backgroundColor: COLORS.neutral50,
  },
  pwBox: {
    flexDirection: 'row', alignItems: 'center',
    borderWidth: 1, borderColor: COLORS.border, borderRadius: 10,
    backgroundColor: COLORS.neutral50, height: 44,
  },
  pwInput: { flex: 1, paddingHorizontal: 12, fontSize: 14, color: COLORS.neutral900 },
  eyeBtn: { padding: 10 },
  saveBtn: {
    height: 46, backgroundColor: COLORS.primary500, borderRadius: 10,
    alignItems: 'center', justifyContent: 'center', marginTop: 14,
  },
  saveBtnText: { fontSize: 15, fontWeight: '600', color: COLORS.white },
  infoRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  infoLabel: { fontSize: 14, color: COLORS.neutral500 },
  infoValue: { fontSize: 14, color: COLORS.neutral900, fontWeight: '500', flex: 1, textAlign: 'right' },
  logoutBtn: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8,
    height: 52, borderRadius: 14,
    borderWidth: 1.5, borderColor: COLORS.error,
    backgroundColor: COLORS.errorLight, marginTop: 8,
  },
  logoutText: { fontSize: 16, fontWeight: '600', color: COLORS.error },
});
