import { Icon } from '~/components/ui/icon';
import { NativeOnlyAnimatedView } from '~/components/ui/native-only-animated-view';
import { TextClassContext } from '~/components/ui/text';
import { cn } from '~/lib/utils';
import * as SelectPrimitive from '@rn-primitives/select';
import { ChevronDownIcon, ChevronUpIcon } from 'lucide-react-native';
import * as React from 'react';
import { Platform, StyleSheet, View } from 'react-native';
import { FadeIn, FadeOut } from 'react-native-reanimated';
import { FullWindowOverlay as RNFullWindowOverlay } from 'react-native-screens';

const FullWindowOverlay = Platform.OS === 'ios' ? RNFullWindowOverlay : React.Fragment;

function SelectContent({
  className,
  children,
  position = 'popper',
  portalHost,
  ...props
}: SelectPrimitive.ContentProps &
  React.RefAttributes<SelectPrimitive.ContentRef> & {
    className?: string;
    portalHost?: string;
  }) {
  return (
    <SelectPrimitive.Portal hostName={portalHost}>
      <FullWindowOverlay>
        <SelectPrimitive.Overlay style={Platform.select({ native: StyleSheet.absoluteFill })}>
          <TextClassContext.Provider value="text-popover-foreground">
            <View style={Platform.select({ native: { zIndex: 50 } })}>
              <NativeOnlyAnimatedView entering={FadeIn} exiting={FadeOut}>
                <SelectPrimitive.Content
                  className={cn(
                    'bg-popover border-border relative z-50 min-w-[8rem] rounded-md border shadow-md shadow-black/5',
                    Platform.select({
                      web: cn(
                        'animate-in fade-in-0 zoom-in-95 origin-(--radix-select-content-transform-origin) max-h-52 overflow-y-auto overflow-x-hidden',
                        props.side === 'bottom' && 'slide-in-from-top-2',
                        props.side === 'top' && 'slide-in-from-bottom-2'
                      ),
                      native: 'p-1',
                    }),
                    position === 'popper' &&
                      Platform.select({
                        web: cn(
                          props.side === 'bottom' && 'translate-y-1',
                          props.side === 'top' && '-translate-y-1'
                        ),
                      }),
                    className
                  )}
                  position={position}
                  {...props}>
                  <SelectScrollUpButton />
                  <SelectPrimitive.Viewport
                    className={cn(
                      'p-1',
                      position === 'popper' &&
                        cn(
                          'w-full',
                          Platform.select({
                            web: 'h-[var(--radix-select-trigger-height)] min-w-[var(--radix-select-trigger-width)]',
                          })
                        )
                    )}>
                    {children}
                  </SelectPrimitive.Viewport>
                  <SelectScrollDownButton />
                </SelectPrimitive.Content>
              </NativeOnlyAnimatedView>
            </View>
          </TextClassContext.Provider>
        </SelectPrimitive.Overlay>
      </FullWindowOverlay>
    </SelectPrimitive.Portal>
  );
}

/** @platform web only — returns null on native */
function SelectScrollUpButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollUpButton>) {
  if (Platform.OS !== 'web') return null;
  return (
    <SelectPrimitive.ScrollUpButton
      className={cn('flex cursor-default items-center justify-center py-1', className)}
      {...props}>
      <Icon as={ChevronUpIcon} className="size-4" />
    </SelectPrimitive.ScrollUpButton>
  );
}

/** @platform web only — returns null on native */
function SelectScrollDownButton({
  className,
  ...props
}: React.ComponentProps<typeof SelectPrimitive.ScrollDownButton>) {
  if (Platform.OS !== 'web') return null;
  return (
    <SelectPrimitive.ScrollDownButton
      className={cn('flex cursor-default items-center justify-center py-1', className)}
      {...props}>
      <Icon as={ChevronDownIcon} className="size-4" />
    </SelectPrimitive.ScrollDownButton>
  );
}

export { SelectContent, SelectScrollDownButton, SelectScrollUpButton };
