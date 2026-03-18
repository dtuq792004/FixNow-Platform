import { Feather } from '@expo/vector-icons';
import { Text as RNText, View } from 'react-native';
import type { CreateRequestStep } from '~/features/requests/types';

interface StepIndicatorProps {
  currentStep: CreateRequestStep;
  totalSteps?: number;
}

const STEP_LABELS: Record<number, string> = {
  1: 'Chọn dịch vụ',
  2: 'Mô tả vấn đề',
  3: 'Xác nhận',
};

const DARK = '#18181b';
const GRAY = '#e4e4e7';
const GRAY_TEXT = '#a1a1aa';

export const StepIndicator = ({ currentStep, totalSteps = 3 }: StepIndicatorProps) => {
  return (
    <View style={{ paddingHorizontal: 20, paddingVertical: 16 }}>
      {/* Step label */}
      <RNText style={{ fontSize: 12, color: GRAY_TEXT, marginBottom: 12 }}>
        Bước {currentStep}/{totalSteps} · {STEP_LABELS[currentStep]}
      </RNText>

      {/* Dots + connectors */}
      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
        {Array.from({ length: totalSteps }, (_, i) => {
          const step = i + 1;
          const isCompleted = step < currentStep;
          const isActive = step === currentStep;

          return (
            <View key={step} style={{ flexDirection: 'row', alignItems: 'center', flex: step < totalSteps ? 1 : undefined }}>
              {/* Dot */}
              <View
                style={{
                  width: 28,
                  height: 28,
                  borderRadius: 14,
                  backgroundColor: isActive || isCompleted ? DARK : GRAY,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                {isCompleted ? (
                  <Feather name="check" size={13} color="#fff" />
                ) : (
                  <RNText
                    style={{
                      fontSize: 12,
                      fontWeight: '700',
                      color: isActive ? '#fff' : GRAY_TEXT,
                    }}
                  >
                    {step}
                  </RNText>
                )}
              </View>

              {/* Connector line */}
              {step < totalSteps && (
                <View
                  style={{
                    flex: 1,
                    height: 2,
                    backgroundColor: isCompleted ? DARK : GRAY,
                    marginHorizontal: 4,
                  }}
                />
              )}
            </View>
          );
        })}
      </View>
    </View>
  );
};
