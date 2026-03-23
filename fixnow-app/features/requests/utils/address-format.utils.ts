import type { SavedAddress } from '~/features/profile/types';

/** Formats a SavedAddress into a single display string */
export const formatSavedAddress = (a: SavedAddress): string =>
  [a.addressLine, a.ward, a.district, a.city].filter(Boolean).join(', ');
