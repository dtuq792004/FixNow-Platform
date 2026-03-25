import { Feather } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { View } from 'react-native';

/** Animated three-dot indicator shown while AI is generating a reply. */
export const TypingIndicator = () => {
  const [dotCount, setDotCount] = useState(1);
  useEffect(() => {
    const timer = setInterval(() => setDotCount((n) => (n % 3) + 1), 380);
    return () => clearInterval(timer);
  }, []);

  return (
    <View className="mb-4 flex-row items-end">
      <View className="w-7 h-7 rounded-full bg-zinc-900 items-center justify-center mr-2 mb-0.5">
        <Feather name="cpu" size={13} color="#fff" />
      </View>
      <View className="bg-zinc-100 rounded-2xl rounded-bl-sm px-4 py-3">
        <View className="flex-row items-center gap-1.5">
          {[1, 2, 3].map((i) => (
            <View
              key={i}
              className={`w-2 h-2 rounded-full ${i <= dotCount ? 'bg-zinc-500' : 'bg-zinc-300'}`}
            />
          ))}
        </View>
      </View>
    </View>
  );
};
