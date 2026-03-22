import { Feather } from '@expo/vector-icons';
import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import { Input } from '~/components/ui/input';
import { cn } from '~/lib/utils';

type PasswordInputProps = React.ComponentProps<typeof Input> & {
  error?: boolean;
};

export function PasswordInput({ error, className, ...props }: PasswordInputProps) {
  const [visible, setVisible] = useState(false);

  return (
    <View style={{ position: 'relative' }}>
      <Input
        {...props}
        secureTextEntry={!visible}
        className={cn(error && 'border-destructive', className)}
        style={{ paddingRight: 48 }}
      />
      <Pressable
        onPress={() => setVisible((v) => !v)}
        style={{ position: 'absolute', right: 14, top: 0, bottom: 0, justifyContent: 'center' }}
        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
        accessibilityLabel={visible ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
      >
        <Feather name={visible ? 'eye-off' : 'eye'} size={18} color="#9ca3af" />
      </Pressable>
    </View>
  );
}
