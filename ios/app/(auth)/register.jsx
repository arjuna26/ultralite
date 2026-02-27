import { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { register } from '../../services/api';
import { setToken } from '../../services/storage';
import { useAuth } from '../../context/AuthContext';
import { COLORS } from '../../constants/colors';

const validatePassword = (pw) => {
  const hasLetter = /[a-zA-Z]/.test(pw);
  const hasNumber = /[0-9]/.test(pw);
  const hasLength = pw.length >= 8;
  return { hasLetter, hasNumber, hasLength, valid: hasLetter && hasNumber && hasLength };
};

export default function Register() {
  const router = useRouter();
  const { setUser } = useAuth();
  const [email, setEmail] = useState('');
  const [nickname, setNickname] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const pwCheck = validatePassword(password);

  const handleRegister = async () => {
    setError('');
    if (!email.trim()) { setError('Email is required.'); return; }
    if (!pwCheck.valid) { setError('Password must be 8+ characters with at least one letter and number.'); return; }
    if (password !== confirm) { setError('Passwords do not match.'); return; }

    setLoading(true);
    try {
      const data = await register(email.trim(), password, nickname.trim() || undefined);
      await setToken(data.token);
      setUser(data.user);
    } catch (err) {
      setError(err.data?.error || 'Registration failed. Try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.safe}>
      <KeyboardAvoidingView style={{ flex: 1 }} behavior={Platform.OS === 'ios' ? 'padding' : 'height'}>
        <ScrollView contentContainerStyle={styles.scroll} keyboardShouldPersistTaps="handled">
          {/* Brand */}
          <View style={styles.brand}>
            <View style={styles.logoBox}>
              <Ionicons name="bag" size={28} color={COLORS.white} />
            </View>
            <Text style={styles.appName}>UltraLite</Text>
          </View>

          <View style={styles.card}>
            <Text style={styles.title}>Create your account</Text>

            {error ? (
              <View style={styles.errorBox}>
                <Text style={styles.errorText}>{error}</Text>
              </View>
            ) : null}

            <View style={styles.field}>
              <Text style={styles.label}>Email *</Text>
              <TextInput
                style={styles.input}
                placeholder="you@example.com"
                placeholderTextColor={COLORS.neutral400}
                value={email}
                onChangeText={setEmail}
                autoCapitalize="none"
                keyboardType="email-address"
                autoComplete="email"
              />
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Nickname <Text style={styles.optional}>(optional)</Text></Text>
              <TextInput
                style={styles.input}
                placeholder="Your trail name"
                placeholderTextColor={COLORS.neutral400}
                value={nickname}
                onChangeText={setNickname}
                autoCapitalize="words"
              />
              <Text style={styles.hint}>Defaults to your email prefix if left blank</Text>
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Password *</Text>
              <View style={styles.passwordBox}>
                <TextInput
                  style={styles.passwordInput}
                  placeholder="8+ chars, letter + number"
                  placeholderTextColor={COLORS.neutral400}
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={COLORS.neutral400} />
                </TouchableOpacity>
              </View>
              {password.length > 0 && (
                <View style={styles.pwReqs}>
                  <PwReq met={pwCheck.hasLength} label="8+ characters" />
                  <PwReq met={pwCheck.hasLetter} label="One letter" />
                  <PwReq met={pwCheck.hasNumber} label="One number" />
                </View>
              )}
            </View>

            <View style={styles.field}>
              <Text style={styles.label}>Confirm Password *</Text>
              <TextInput
                style={styles.input}
                placeholder="Repeat password"
                placeholderTextColor={COLORS.neutral400}
                value={confirm}
                onChangeText={setConfirm}
                secureTextEntry={!showPassword}
                returnKeyType="done"
                onSubmitEditing={handleRegister}
              />
            </View>

            <TouchableOpacity
              style={[styles.btn, loading && styles.btnDisabled]}
              onPress={handleRegister}
              disabled={loading}
              activeOpacity={0.8}
            >
              <Text style={styles.btnText}>{loading ? 'Creating account...' : 'Create Account'}</Text>
            </TouchableOpacity>

            <View style={styles.switchRow}>
              <Text style={styles.switchText}>Already have an account? </Text>
              <TouchableOpacity onPress={() => router.back()}>
                <Text style={styles.switchLink}>Sign in</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

function PwReq({ met, label }) {
  return (
    <View style={pwStyles.row}>
      <Ionicons name={met ? 'checkmark-circle' : 'ellipse-outline'} size={14} color={met ? COLORS.success : COLORS.neutral400} />
      <Text style={[pwStyles.text, met && pwStyles.textMet]}>{label}</Text>
    </View>
  );
}

const pwStyles = StyleSheet.create({
  row: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  text: { fontSize: 12, color: COLORS.neutral400 },
  textMet: { color: COLORS.success },
});

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: COLORS.surface },
  scroll: { flexGrow: 1, justifyContent: 'center', padding: 20 },
  brand: { alignItems: 'center', marginBottom: 24 },
  logoBox: { width: 52, height: 52, borderRadius: 14, backgroundColor: COLORS.primary500, alignItems: 'center', justifyContent: 'center', marginBottom: 10 },
  appName: { fontSize: 24, fontWeight: '700', color: COLORS.neutral900, letterSpacing: -0.5 },
  card: { backgroundColor: COLORS.surfaceElevated, borderRadius: 20, padding: 24, borderWidth: 1, borderColor: COLORS.border },
  title: { fontSize: 20, fontWeight: '700', color: COLORS.neutral900, marginBottom: 20 },
  errorBox: { backgroundColor: COLORS.errorLight, borderRadius: 10, padding: 12, marginBottom: 16 },
  errorText: { fontSize: 13, color: COLORS.error },
  field: { marginBottom: 16 },
  label: { fontSize: 13, fontWeight: '600', color: COLORS.neutral700, marginBottom: 6 },
  optional: { fontWeight: '400', color: COLORS.neutral400 },
  hint: { fontSize: 11, color: COLORS.neutral400, marginTop: 4 },
  input: { height: 48, borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, paddingHorizontal: 14, fontSize: 15, color: COLORS.neutral900, backgroundColor: COLORS.neutral50 },
  passwordBox: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: COLORS.border, borderRadius: 10, backgroundColor: COLORS.neutral50, height: 48 },
  passwordInput: { flex: 1, paddingHorizontal: 14, fontSize: 15, color: COLORS.neutral900 },
  eyeBtn: { padding: 12 },
  pwReqs: { marginTop: 6, gap: 2 },
  btn: { height: 50, backgroundColor: COLORS.primary500, borderRadius: 12, alignItems: 'center', justifyContent: 'center', marginTop: 8, marginBottom: 16 },
  btnDisabled: { opacity: 0.6 },
  btnText: { fontSize: 16, fontWeight: '600', color: COLORS.white },
  switchRow: { flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  switchText: { fontSize: 14, color: COLORS.neutral500 },
  switchLink: { fontSize: 14, fontWeight: '600', color: COLORS.primary600 },
});
