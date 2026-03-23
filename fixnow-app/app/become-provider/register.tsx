import { zodResolver } from '@hookform/resolvers/zod';
import { Feather } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { KeyboardAvoidingView, Platform, Pressable, ScrollView, Text as RNText, View, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useUser } from '~/features/auth/stores/auth.store';
import { RegisterFormFields } from '~/features/provider/components/register-form-fields';
import { useProviderApplication } from '~/features/provider/hooks/use-provider-application';
import { registerProviderSchema, type RegisterProviderFormData } from '~/features/provider/validations/schemas';

const RegisterProviderScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const user = useUser();
  const { submit, loading, checkExistingApplication } = useProviderApplication();

  const {
    control, handleSubmit, setValue, watch,
    formState: { errors, isSubmitting },
  } = useForm<RegisterProviderFormData>({
    resolver: zodResolver(registerProviderSchema),
    defaultValues: { 
  fullName: user?.fullName || '',
  phone: user?.phone || '',
  specialties: [], 
  experience: '', 
  serviceArea: '', 
  idCard: '', 
  motivation: '' 
},
  });

  const selectedSpecialties = watch('specialties');

  useEffect(() => {
    if (user) {
      checkExistingApplication(user._id).then((existingApp) => {
        if (existingApp) {
          // User already has an application, redirect to status
          router.replace('/become-provider/status');
        }
      });
    }
  }, [user, router, checkExistingApplication]);

  const onSubmit = async (data: RegisterProviderFormData) => {
    if (!user) return;
    
    try {
      await submit(data, user);
      router.replace('/become-provider/status');
    } catch (error: any) {
      console.error('Submit application error:', error);
      // TODO: Show error toast/message
    }
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: '#fff', alignItems: 'center', justifyContent: 'center' }}>
        <ActivityIndicator size="large" color="#18181B" />
        <RNText style={{ marginTop: 16, fontSize: 14, color: '#71717A' }}>
          Đang kiểm tra đơn đăng ký...
        </RNText>
      </View>
    );
  }

  if (!user) return null;

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: '#fff' }}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={{
        paddingTop: insets.top + 8, paddingBottom: 14,
        paddingHorizontal: 16, flexDirection: 'row', alignItems: 'center',
        borderBottomWidth: 1, borderBottomColor: '#f4f4f5',
      }}>
        <Pressable onPress={() => router.back()} style={{ padding: 8, marginRight: 4 }}>
          <Feather name="arrow-left" size={22} color="#18181b" />
        </Pressable>
        <View style={{ flex: 1 }}>
          <RNText style={{ fontSize: 17, fontWeight: '700', color: '#18181b' }}>
            Đăng ký làm thợ
          </RNText>
          <RNText style={{ fontSize: 12, color: '#a1a1aa', marginTop: 1 }}>
            Điền đầy đủ thông tin để được xét duyệt
          </RNText>
        </View>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, paddingBottom: insets.bottom + 32 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <RegisterFormFields
          control={control}
          errors={errors}
          setValue={setValue}
          selectedSpecialties={selectedSpecialties}
          user={user}
          isSubmitting={isSubmitting}
          onSubmit={handleSubmit(onSubmit)}
        />
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

export default RegisterProviderScreen;
