import { zodResolver } from '@hookform/resolvers/zod';
import { Feather } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Pressable, Text as RNText, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { CategoryPicker } from '~/features/requests/components/category-picker';
import { ConfirmSummary } from '~/features/requests/components/confirm-summary';
import { DetailsForm } from '~/features/requests/components/details-form';
import { StepIndicator } from '~/features/requests/components/step-indicator';
import { SubmitSuccess } from '~/features/requests/components/submit-success';
import { MOCK_CREATE_REQUEST } from '~/features/requests/data/mock-request-data';
import { createRequestApi } from '~/features/requests/services/request.service';
import type { CreateRequestStep, ServiceCategoryType } from '~/features/requests/types';
import {
  createRequestSchema,
  STEP_FIELDS,
  type CreateRequestSchema,
} from '~/features/requests/validations/create-request.schema';

const CreateRequestScreen = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { category: categoryParam } = useLocalSearchParams<{ category?: string }>();

  const [step, setStep] = useState<CreateRequestStep>(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);

  const {
    control,
    handleSubmit,
    watch,
    setValue,
    trigger,
    formState: { errors },
  } = useForm<CreateRequestSchema>({
    resolver: zodResolver(createRequestSchema),
    mode: 'onTouched',
    // ── Mock defaults: pre-fills the form for UI testing ──
    // TODO: replace with empty defaults when backend integration is ready:
    // defaultValues: { category: undefined, title: '', description: '', address: '', note: '' }
    defaultValues: MOCK_CREATE_REQUEST,
  });

  // Pre-select category when navigating from the service grid (e.g. ?category=electrical)
  useEffect(() => {
    if (categoryParam) {
      setValue('category', categoryParam as ServiceCategoryType, { shouldValidate: true });
    }
  }, [categoryParam, setValue]);

  const selectedCategory = watch('category');
  const formData = watch();

  const handleNext = async () => {
    const fields = STEP_FIELDS[step] as unknown as (keyof CreateRequestSchema)[];
    if (fields.length > 0) {
      const valid = await trigger(fields);
      if (!valid) return;
    }
    setStep((prev) => (prev < 3 ? ((prev + 1) as CreateRequestStep) : prev));
  };

  const handleBack = () => {
    if (step > 1) setStep((prev) => (prev - 1) as CreateRequestStep);
    else router.back();
  };

  const onSubmit = async (data: CreateRequestSchema) => {
    try {
      setIsSubmitting(true);
      const response = await createRequestApi(data);
      setSubmittedId(response.id);
    } catch {
      // TODO: show error toast/alert when error handling is in place
    } finally {
      setIsSubmitting(false);
    }
  };

  // ── Success screen ──────────────────────────────────────────────────────────
  if (submittedId) {
    return (
      <View style={{ flex: 1, backgroundColor: '#ffffff', paddingTop: insets.top }}>
        <SubmitSuccess requestId={submittedId} />
      </View>
    );
  }

  // ── Multi-step form ─────────────────────────────────────────────────────────
  return (
    <View style={{ flex: 1, backgroundColor: '#ffffff' }}>
      {/* ── Header ─────────────────────────────────────────────────────────── */}
      <View
        style={{
          paddingTop: insets.top + 8,
          paddingBottom: 4,
          paddingHorizontal: 16,
          flexDirection: 'row',
          alignItems: 'center',
          borderBottomWidth: 1,
          borderBottomColor: '#f4f4f5',
        }}
      >
        <Pressable
          onPress={handleBack}
          style={{ padding: 8, marginRight: 4 }}
          accessibilityLabel="Quay lại"
        >
          <Feather name="arrow-left" size={22} color="#18181b" />
        </Pressable>
        <RNText style={{ fontSize: 17, fontWeight: '700', color: '#18181b' }}>
          Tạo yêu cầu mới
        </RNText>
      </View>

      {/* ── Step indicator ──────────────────────────────────────────────────── */}
      <StepIndicator currentStep={step} />

      {/* ── Step content ───────────────────────────────────────────────────── */}
      <View style={{ flex: 1 }}>
        {step === 1 && (
          <CategoryPicker
            selected={selectedCategory}
            onSelect={(cat) => setValue('category', cat, { shouldValidate: true })}
            error={errors.category?.message}
          />
        )}
        {step === 2 && <DetailsForm control={control} errors={errors} />}
        {step === 3 && (
          <ConfirmSummary
            data={formData as CreateRequestSchema}
            isSubmitting={isSubmitting}
            onSubmit={handleSubmit(onSubmit)}
          />
        )}
      </View>

      {/* ── Footer nav (hidden on step 3 — submit lives inside ConfirmSummary) */}
      {step < 3 && (
        <View
          style={{
            paddingHorizontal: 20,
            paddingTop: 12,
            paddingBottom: insets.bottom + 12,
            borderTopWidth: 1,
            borderTopColor: '#f4f4f5',
            backgroundColor: '#ffffff',
          }}
        >
          <Pressable
            onPress={handleNext}
            style={{
              backgroundColor: '#18181b',
              borderRadius: 14,
              height: 52,
              alignItems: 'center',
              justifyContent: 'center',
              flexDirection: 'row',
            }}
            accessibilityRole="button"
          >
            <RNText style={{ color: '#ffffff', fontSize: 15, fontWeight: '700', marginRight: 6 }}>
              Tiếp tục
            </RNText>
            <Feather name="arrow-right" size={18} color="#ffffff" />
          </Pressable>
        </View>
      )}
    </View>
  );
};

export default CreateRequestScreen;
