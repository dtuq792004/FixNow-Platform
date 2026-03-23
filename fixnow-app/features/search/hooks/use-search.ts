import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { SERVICE_CATEGORIES } from '~/features/home/data/service-categories';
import { MOCK_PROVIDERS } from '../data/mock-providers';
import type { ProviderSearchResult, SearchSegment, ServiceSearchResult } from '../types';

const SPECIALTY_KEYWORDS: Record<string, string[]> = {
  electrical: ['điện', 'electric', 'đèn', 'ổ cắm', 'cầu dao', 'dây điện'],
  plumbing: ['nước', 'ống', 'vòi', 'bồn', 'tắc', 'rò', 'thủy'],
  hvac: ['lạnh', 'điều hòa', 'máy lạnh', 'quạt', 'nhiệt', 'ac', 'hvac'],
  appliance: ['thiết bị', 'tủ lạnh', 'máy giặt', 'lò vi sóng', 'bếp', 'appliance'],
  security: ['khóa', 'cửa', 'camera', 'bảo mật', 'an ninh', 'chìa'],
  painting: ['sơn', 'tường', 'nội thất', 'trần', 'paint'],
};

export const useSearch = () => {
  const [query, setQuery] = useState('');
  const [segment, setSegment] = useState<SearchSegment>('service');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Debounce 300ms
  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setDebouncedQuery(query.trim()), 300);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [query]);

  const normalize = (s: string) => s.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  const matchesQuery = useCallback(
    (texts: string[]) => {
      const q = normalize(debouncedQuery);
      return texts.some((t) => normalize(t).includes(q));
    },
    [debouncedQuery]
  );

  const serviceResults = useMemo((): ServiceSearchResult[] => {
    if (!debouncedQuery) return [];
    return SERVICE_CATEGORIES.filter((cat) => {
      const keywords = SPECIALTY_KEYWORDS[cat.type] ?? [];
      return matchesQuery([cat.label, cat.type, ...keywords]);
    }).map((cat) => ({
      type: 'service' as const,
      category: cat.type,
      label: cat.label,
      description: getServiceDescription(cat.type),
      icon: cat.icon,
      bgClass: cat.bgClass,
      iconColor: cat.iconColor,
    }));
  }, [debouncedQuery, matchesQuery]);

  const providerResults = useMemo((): ProviderSearchResult[] => {
    if (!debouncedQuery) return [];
    return MOCK_PROVIDERS.filter((p) => {
      const specialtyLabels = p.specialties.map(
        (s) => SERVICE_CATEGORIES.find((c) => c.type === s)?.label ?? s
      );
      const keywords = p.specialties.flatMap((s) => SPECIALTY_KEYWORDS[s] ?? []);
      return matchesQuery([p.name, p.location, ...specialtyLabels, ...keywords]);
    }).map((p) => ({ type: 'provider' as const, provider: p }));
  }, [debouncedQuery, matchesQuery]);

  const hasResults = serviceResults.length > 0 || providerResults.length > 0;
  const isSearching = debouncedQuery.length > 0;

  const clearQuery = () => { setQuery(''); setDebouncedQuery(''); };

  return {
    query, setQuery, clearQuery,
    segment, setSegment,
    serviceResults, providerResults,
    hasResults, isSearching,
  };
};

const SERVICE_DESCRIPTIONS: Record<string, string> = {
  electrical: 'Sửa điện, thay bóng, lắp ổ cắm, cầu dao',
  plumbing: 'Thông tắc, sửa vòi, thay ống nước',
  hvac: 'Vệ sinh, sửa chữa điều hoà, máy lạnh',
  appliance: 'Sửa tủ lạnh, máy giặt, thiết bị gia dụng',
  security: 'Thay khoá, sửa cửa, lắp camera',
  painting: 'Sơn tường, trần nhà, nội thất',
  other: 'Các dịch vụ sửa chữa khác',
};

const getServiceDescription = (type: string) =>
  SERVICE_DESCRIPTIONS[type] ?? SERVICE_DESCRIPTIONS.other;
