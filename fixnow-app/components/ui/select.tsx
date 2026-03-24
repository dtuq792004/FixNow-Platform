/**
 * Select — barrel re-export.
 * Components are split into focused modules:
 *   select-trigger.tsx   — SelectTrigger, SelectValue
 *   select-content.tsx   — SelectContent, SelectScrollUpButton, SelectScrollDownButton
 *   select-items.tsx     — SelectItem, SelectLabel, SelectSeparator
 */
import * as SelectPrimitive from '@rn-primitives/select';

export type Option = SelectPrimitive.Option;

export const Select = SelectPrimitive.Root;
export const SelectGroup = SelectPrimitive.Group;

export { SelectTrigger, SelectValue } from '~/components/ui/select-trigger';
export { SelectContent, SelectScrollDownButton, SelectScrollUpButton } from '~/components/ui/select-content';
export { SelectItem, SelectLabel, SelectSeparator } from '~/components/ui/select-items';
