/**
 * Shared UI primitives for provider registration form.
 * Exported: FieldWrapper, InfoRow, SectionHeader
 */
import { Feather } from '@expo/vector-icons';
import { Text as RNText, View } from 'react-native';

// ── FieldWrapper ──────────────────────────────────────────────────────────────
interface FieldWrapperProps {
  label: string;
  required?: boolean;
  error?: string;
  hint?: string;
  children: React.ReactNode;
}
export const FieldWrapper = ({ label, required, error, hint, children }: FieldWrapperProps) => (
  <View style={{ marginBottom: 20 }}>
    <RNText style={{ fontSize: 13, fontWeight: '600', color: '#52525b', marginBottom: 7 }}>
      {label}
      {required ? <RNText style={{ color: '#ef4444' }}> *</RNText> : null}
    </RNText>
    {children}
    {error ? (
      <RNText style={{ fontSize: 11, color: '#ef4444', marginTop: 5 }}>{error}</RNText>
    ) : hint ? (
      <RNText style={{ fontSize: 11, color: '#a1a1aa', marginTop: 5 }}>{hint}</RNText>
    ) : null}
  </View>
);

// ── InfoRow ───────────────────────────────────────────────────────────────────
interface InfoRowProps {
  icon: string;
  label: string;
  value: string;
}
export const InfoRow = ({ icon, label, value }: InfoRowProps) => (
  <View style={{
    flexDirection: 'row', alignItems: 'center',
    backgroundColor: '#f9f9f9', borderRadius: 10,
    borderWidth: 1, borderColor: '#e4e4e7',
    paddingHorizontal: 12, paddingVertical: 12,
  }}>
    <Feather name={icon as never} size={15} color="#a1a1aa" style={{ marginRight: 10 }} />
    <View style={{ flex: 1 }}>
      <RNText style={{ fontSize: 11, color: '#a1a1aa', marginBottom: 1 }}>{label}</RNText>
      <RNText style={{ fontSize: 14, color: '#52525b', fontWeight: '500' }}>{value || '—'}</RNText>
    </View>
    <Feather name="lock" size={12} color="#d4d4d8" />
  </View>
);

// ── SectionHeader ─────────────────────────────────────────────────────────────
interface SectionHeaderProps {
  title: string;
}
export const SectionHeader = ({ title }: SectionHeaderProps) => (
  <RNText style={{
    fontSize: 11, fontWeight: '700', color: '#a1a1aa',
    letterSpacing: 0.5, marginBottom: 12, marginTop: 8,
    textTransform: 'uppercase',
  }}>
    {title}
  </RNText>
);
