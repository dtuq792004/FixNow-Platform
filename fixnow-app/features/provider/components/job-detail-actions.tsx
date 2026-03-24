/**
 * Action button panel for the Provider Job Detail screen.
 * Renders the correct CTA(s) based on the current job status.
 */
import { Feather } from '@expo/vector-icons';
import { ActivityIndicator, TextInput, View, Text as RNText } from 'react-native';
import { Button } from '~/components/ui/button';
import { Text } from '~/components/ui/text';
import type { ProviderJobStatus } from '../types/job.types';

interface Props {
  status: ProviderJobStatus;
  actionLoading: boolean;
  showNoteInput: boolean;
  completionNote: string;
  onNoteChange: (v: string) => void;
  onAccept: () => void;
  onDecline: () => void;
  onStart: () => void;
  onShowNote: () => void;
  onCancelNote: () => void;
  onComplete: () => void;
}

export const JobDetailActions = ({
  status,
  actionLoading,
  showNoteInput,
  completionNote,
  onNoteChange,
  onAccept,
  onDecline,
  onStart,
  onShowNote,
  onCancelNote,
  onComplete,
}: Props) => {
  if (status === 'COMPLETED') return null;

  if (status === 'CANCELLED') {
    return (
      <View className="bg-red-50 border border-red-200 rounded-2xl p-4 mt-2 flex-row items-center gap-3">
        <Feather name="x-circle" size={18} color="#dc2626" />
        <Text className="text-sm text-red-700 flex-1">Yêu cầu này đã bị hủy</Text>
      </View>
    );
  }

  return (
    <View className="mt-2">
      {/* PENDING: accept / decline */}
      {status === 'PENDING' && (
        <View className="flex-row gap-3">
          <Button
            variant="outline"
            className="flex-1 rounded-xl h-12"
            disabled={actionLoading}
            onPress={onDecline}
          >
            <Text className="font-semibold">Từ chối</Text>
          </Button>
          <Button
            variant="brand"
            className="flex-1 rounded-xl h-12"
            disabled={actionLoading}
            onPress={onAccept}
          >
            <Text className="font-bold text-white">Nhận việc</Text>
          </Button>
        </View>
      )}

      {/* ASSIGNED: start */}
      {status === 'ASSIGNED' && (
        <Button
          variant="brand"
          className="rounded-xl h-12"
          disabled={actionLoading}
          onPress={onStart}
        >
          <View className="flex-row items-center gap-2">
            <Feather name="play-circle" size={16} color="#fff" />
            <Text className="font-bold text-white ml-1">Bắt đầu làm việc</Text>
          </View>
        </Button>
      )}

      {/* IN_PROGRESS: complete (+ optional note) */}
      {status === 'IN_PROGRESS' && (
        <>
          {showNoteInput && (
            <View className="bg-zinc-50 border border-zinc-200 rounded-2xl p-4 mb-4">
              <RNText style={{ fontSize: 13, fontWeight: '600', color: '#18181b', marginBottom: 8 }}>
                Ghi chú hoàn thành{' '}
                <RNText style={{ fontWeight: '400', color: '#a1a1aa' }}>(tuỳ chọn)</RNText>
              </RNText>
              <TextInput
                value={completionNote}
                onChangeText={onNoteChange}
                placeholder="Mô tả công việc đã thực hiện, vật tư đã dùng..."
                multiline
                numberOfLines={3}
                textAlignVertical="top"
                style={{
                  borderWidth: 1,
                  borderColor: '#e4e4e7',
                  borderRadius: 10,
                  padding: 10,
                  minHeight: 80,
                  fontSize: 13,
                  color: '#18181b',
                  backgroundColor: '#fff',
                }}
              />
            </View>
          )}

          {!showNoteInput ? (
            <Button
              variant="brand"
              className="rounded-xl h-12"
              disabled={actionLoading}
              onPress={onShowNote}
            >
              <View className="flex-row items-center gap-2">
                <Feather name="check-circle" size={16} color="#fff" />
                <Text className="font-bold text-white ml-1">Hoàn thành công việc</Text>
              </View>
            </Button>
          ) : (
            <View className="flex-row gap-3">
              <Button
                variant="outline"
                className="flex-1 rounded-xl h-12"
                disabled={actionLoading}
                onPress={onCancelNote}
              >
                <Text className="font-semibold">Huỷ</Text>
              </Button>
              <Button
                variant="brand"
                className="flex-1 rounded-xl h-12"
                disabled={actionLoading}
                onPress={onComplete}
              >
                {actionLoading ? (
                  <ActivityIndicator size="small" color="#fff" />
                ) : (
                  <Text className="font-bold text-white">Xác nhận hoàn thành</Text>
                )}
              </Button>
            </View>
          )}
        </>
      )}
    </View>
  );
};
