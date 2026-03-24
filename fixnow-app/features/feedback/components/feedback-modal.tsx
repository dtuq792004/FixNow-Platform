import { Feather } from '@expo/vector-icons';
import { useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Modal,
  Platform,
  Pressable,
  Text,
  TextInput,
  View,
} from 'react-native';
import { useCreateFeedback } from '../hooks/use-feedback';

// ── Rating labels ─────────────────────────────────────────────────────────────
const RATING_LABELS = ['', 'Tệ', 'Không tốt lắm', 'Bình thường', 'Khá tốt', 'Xuất sắc'];

// ── Star selector ─────────────────────────────────────────────────────────────
const StarSelector = ({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) => (
  <View className="flex-row justify-center gap-3 my-4">
    {[1, 2, 3, 4, 5].map((star) => (
      <Pressable key={star} onPress={() => onChange(star)} hitSlop={6}>
        <Feather
          name="star"
          size={38}
          color={star <= value ? '#F59E0B' : '#E4E4E7'}
        />
      </Pressable>
    ))}
  </View>
);

// ── Props ─────────────────────────────────────────────────────────────────────
interface FeedbackModalProps {
  visible: boolean;
  onClose: () => void;
  requestId: string;
  providerId: string;
  providerName: string;
}

// ── Component ─────────────────────────────────────────────────────────────────
export const FeedbackModal = ({
  visible,
  onClose,
  requestId,
  providerId,
  providerName,
}: FeedbackModalProps) => {
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const { mutate: submitFeedback, isPending } = useCreateFeedback(requestId);

  const handleClose = () => {
    if (isPending) return;
    setRating(0);
    setComment('');
    onClose();
  };

  const handleSubmit = () => {
    if (rating === 0) {
      Alert.alert('Chưa chọn số sao', 'Vui lòng chọn số sao trước khi gửi đánh giá.');
      return;
    }

    submitFeedback(
      {
        requestId,
        providerId,
        servicesFeedbacks: [{ rating, comment: comment.trim() || undefined }],
      },
      {
        onSuccess: () => {
          Alert.alert('Cảm ơn!', 'Đánh giá của bạn đã được ghi nhận.', [
            { text: 'OK', onPress: handleClose },
          ]);
        },
        onError: () => {
          Alert.alert('Lỗi', 'Không thể gửi đánh giá. Vui lòng thử lại.');
        },
      },
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={handleClose}
    >
      {/* Backdrop */}
      <Pressable
        className="flex-1 bg-black/40"
        onPress={handleClose}
      />

      {/* Bottom sheet */}
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <View className="bg-white rounded-t-3xl px-6 pt-4 pb-safe">
          {/* Handle */}
          <View className="w-10 h-1 rounded-full bg-zinc-200 self-center mb-5" />

          {/* Header */}
          <View className="flex-row items-start justify-between mb-1">
            <View className="flex-1">
              <Text className="text-lg font-bold text-zinc-900">Đánh giá dịch vụ</Text>
              <Text className="text-sm text-zinc-400 mt-0.5">
                Trải nghiệm của bạn với{' '}
                <Text className="font-semibold text-zinc-600">{providerName}</Text>
              </Text>
            </View>
            <Pressable onPress={handleClose} className="p-1 -mr-1">
              <Feather name="x" size={20} color="#a1a1aa" />
            </Pressable>
          </View>

          {/* Stars */}
          <StarSelector value={rating} onChange={setRating} />

          {/* Rating label */}
          <Text
            className={`text-center text-sm font-semibold mb-5 h-5 ${
              rating > 0 ? 'text-amber-500' : 'text-transparent'
            }`}
          >
            {RATING_LABELS[rating] ?? ''}
          </Text>

          {/* Comment */}
          <Text className="text-sm font-semibold text-zinc-700 mb-2">
            Nhận xét <Text className="text-zinc-400 font-normal">(tuỳ chọn)</Text>
          </Text>
          <TextInput
            className="bg-zinc-50 border border-zinc-200 rounded-xl px-4 py-3 text-sm text-zinc-900 min-h-[88px]"
            placeholder="Chia sẻ trải nghiệm của bạn..."
            placeholderTextColor="#a1a1aa"
            value={comment}
            onChangeText={setComment}
            multiline
            textAlignVertical="top"
            maxLength={300}
            editable={!isPending}
          />
          <Text className="text-[11px] text-zinc-400 text-right mt-1 mb-5">
            {comment.length}/300
          </Text>

          {/* Submit */}
          <Pressable
            onPress={handleSubmit}
            disabled={rating === 0 || isPending}
            className={`h-12 rounded-xl flex-row items-center justify-center gap-2 ${
              rating === 0 || isPending ? 'bg-zinc-200' : 'bg-zinc-900 active:opacity-80'
            }`}
          >
            {isPending ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Feather
                  name="send"
                  size={15}
                  color={rating === 0 ? '#a1a1aa' : '#fff'}
                />
                <Text
                  className={`font-bold text-sm ${
                    rating === 0 ? 'text-zinc-400' : 'text-white'
                  }`}
                >
                  Gửi đánh giá
                </Text>
              </>
            )}
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </Modal>
  );
};
