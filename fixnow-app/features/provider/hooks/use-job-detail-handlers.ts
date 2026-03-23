/**
 * Encapsulates all Alert-based action handlers for the Provider Job Detail screen.
 * Keeps the screen component free of inline Alert.alert boilerplate.
 */
import { Alert } from 'react-native';

interface Actions {
  accept: () => Promise<void>;
  decline: () => Promise<void>;
  start: () => Promise<void>;
  complete: (note?: string) => Promise<void>;
  onBack: () => void;
}

export const useJobDetailHandlers = ({ accept, decline, start, complete, onBack }: Actions) => {
  const handleAccept = () =>
    Alert.alert('Nhận việc', 'Bạn có chắc muốn nhận yêu cầu này?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Nhận việc',
        onPress: () => accept().catch(() => Alert.alert('Lỗi', 'Không thể nhận việc. Thử lại sau.')),
      },
    ]);

  const handleDecline = () =>
    Alert.alert('Từ chối', 'Bạn có chắc muốn từ chối yêu cầu này?', [
      { text: 'Huỷ', style: 'cancel' },
      {
        text: 'Từ chối',
        style: 'destructive',
        onPress: () =>
          decline()
            .then(() => onBack())
            .catch(() => Alert.alert('Lỗi', 'Không thể từ chối. Thử lại sau.')),
      },
    ]);

  const handleStart = () =>
    Alert.alert(
      'Bắt đầu làm việc',
      'Xác nhận bạn đã đến nơi và bắt đầu thực hiện công việc?',
      [
        { text: 'Huỷ', style: 'cancel' },
        {
          text: 'Bắt đầu',
          onPress: () =>
            start().catch(() => Alert.alert('Lỗi', 'Không thể bắt đầu. Thử lại sau.')),
        },
      ],
    );

  const handleComplete = (note: string, onSuccess: () => void) =>
    complete(note.trim() || undefined)
      .then(onSuccess)
      .catch(() => Alert.alert('Lỗi', 'Không thể hoàn thành. Thử lại sau.'));

  return { handleAccept, handleDecline, handleStart, handleComplete };
};
