import { Text as RNText, View } from 'react-native';

interface AddressFieldWrapperProps {
  label: string;
  error?: string;
  required?: boolean;
  children: React.ReactNode;
}

export const AddressFieldWrapper = ({
  label,
  error,
  required,
  children,
}: AddressFieldWrapperProps) => (
  <View style={{ marginBottom: 14 }}>
    <RNText style={{ fontSize: 12, fontWeight: '600', color: '#52525b', marginBottom: 5 }}>
      {label}
      {required ? <RNText style={{ color: '#ef4444' }}> *</RNText> : null}
    </RNText>
    {children}
    {error ? (
      <RNText style={{ fontSize: 11, color: '#ef4444', marginTop: 3 }}>{error}</RNText>
    ) : null}
  </View>
);
