import { Icon } from '~/components/ui/icon';
import { cn } from '~/lib/utils';
import * as SelectPrimitive from '@rn-primitives/select';
import { Check } from 'lucide-react-native';
import * as React from 'react';
import { Platform, View } from 'react-native';

function SelectLabel({
  className,
  ...props
}: SelectPrimitive.LabelProps & React.RefAttributes<SelectPrimitive.LabelRef>) {
  return (
    <SelectPrimitive.Label
      className={cn('text-muted-foreground px-2 py-2 text-xs sm:py-1.5', className)}
      {...props}
    />
  );
}

function SelectItem({
  className,
  children,
  ...props
}: SelectPrimitive.ItemProps & React.RefAttributes<SelectPrimitive.ItemRef>) {
  return (
    <SelectPrimitive.Item
      className={cn(
        'active:bg-accent group relative flex w-full flex-row items-center gap-2 rounded-sm py-2 pl-2 pr-8 sm:py-1.5',
        Platform.select({
          web: 'focus:bg-accent focus:text-accent-foreground *:[span]:last:flex *:[span]:last:items-center *:[span]:last:gap-2 cursor-default outline-none data-[disabled]:pointer-events-none [&_svg]:pointer-events-none',
        }),
        props.disabled && 'opacity-50',
        className
      )}
      {...props}>
      <View className="absolute right-2 flex size-3.5 items-center justify-center">
        <SelectPrimitive.ItemIndicator>
          <Icon as={Check} className="text-muted-foreground size-4 shrink-0" />
        </SelectPrimitive.ItemIndicator>
      </View>
      <SelectPrimitive.ItemText className="text-foreground group-active:text-accent-foreground select-none text-sm" />
    </SelectPrimitive.Item>
  );
}

function SelectSeparator({
  className,
  ...props
}: SelectPrimitive.SeparatorProps & React.RefAttributes<SelectPrimitive.SeparatorRef>) {
  return (
    <SelectPrimitive.Separator
      className={cn(
        'bg-border -mx-1 my-1 h-px',
        Platform.select({ web: 'pointer-events-none' }),
        className
      )}
      {...props}
    />
  );
}

export { SelectItem, SelectLabel, SelectSeparator };
