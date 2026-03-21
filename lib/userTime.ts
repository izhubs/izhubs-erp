// =============================================================
// izhubs ERP — User Time Utility
// Single source of truth for user-aware date/time formatting.
// Always use these functions instead of raw Date() + toLocaleString()
// so the user's timezone preference is respected everywhere.
// =============================================================

export const COMMON_TIMEZONES = [
  { value: 'Asia/Ho_Chi_Minh', label: 'UTC+7 — Ho Chi Minh City (Vietnam)' },
  { value: 'Asia/Bangkok',     label: 'UTC+7 — Bangkok (Thailand)' },
  { value: 'Asia/Singapore',   label: 'UTC+8 — Singapore' },
  { value: 'Asia/Tokyo',       label: 'UTC+9 — Tokyo (Japan)' },
  { value: 'Asia/Seoul',       label: 'UTC+9 — Seoul (Korea)' },
  { value: 'Asia/Shanghai',    label: 'UTC+8 — Shanghai / Beijing' },
  { value: 'Asia/Kolkata',     label: 'UTC+5:30 — Mumbai / New Delhi' },
  { value: 'Asia/Dubai',       label: 'UTC+4 — Dubai (UAE)' },
  { value: 'Europe/London',    label: 'UTC+0/+1 — London (UK)' },
  { value: 'Europe/Paris',     label: 'UTC+1/+2 — Paris (France)' },
  { value: 'America/New_York', label: 'UTC-5/-4 — New York (US Eastern)' },
  { value: 'America/Chicago',  label: 'UTC-6/-5 — Chicago (US Central)' },
  { value: 'America/Denver',   label: 'UTC-7/-6 — Denver (US Mountain)' },
  { value: 'America/Los_Angeles', label: 'UTC-8/-7 — Los Angeles (US Pacific)' },
  { value: 'UTC',              label: 'UTC+0 — Coordinated Universal Time' },
] as const;

export type Timezone = typeof COMMON_TIMEZONES[number]['value'] | string;

export const CURRENCIES = [
  { value: 'VND', symbol: '₫', label: 'VND — Vietnamese Dong', locale: 'vi-VN' },
  { value: 'USD', symbol: '$', label: 'USD — US Dollar',        locale: 'en-US' },
  { value: 'EUR', symbol: '€', label: 'EUR — Euro',             locale: 'de-DE' },
  { value: 'SGD', symbol: 'S$', label: 'SGD — Singapore Dollar', locale: 'en-SG' },
  { value: 'THB', symbol: '฿', label: 'THB — Thai Baht',        locale: 'th-TH' },
  { value: 'JPY', symbol: '¥', label: 'JPY — Japanese Yen',     locale: 'ja-JP' },
] as const;

export type Currency = typeof CURRENCIES[number]['value'] | string;

// ---- Preference storage ----

export function getUserTimezone(): Timezone {
  if (typeof window === 'undefined') return 'Asia/Ho_Chi_Minh';
  return localStorage.getItem('hz_timezone') || 'Asia/Ho_Chi_Minh';
}

export function setUserTimezone(tz: Timezone) {
  localStorage.setItem('hz_timezone', tz);
  window.dispatchEvent(new Event('hz_timezone_changed'));
}

export function getUserCurrency(): Currency {
  if (typeof window === 'undefined') return 'VND';
  return localStorage.getItem('hz_currency') || 'VND';
}

export function setUserCurrency(currency: Currency) {
  localStorage.setItem('hz_currency', currency);
  window.dispatchEvent(new Event('hz_currency_changed'));
}

// ---- Date/time helpers — always respects user timezone ----

/**
 * Format a date into a readable date string in the user's timezone.
 * @example formatDate(new Date()) → "21 Mar 2026"
 */
export function formatDate(date: Date | string | null | undefined, tz?: Timezone): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleDateString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    timeZone: tz ?? getUserTimezone(),
  });
}

/**
 * Format a date-time into a readable string in the user's timezone.
 * @example formatDateTime(new Date()) → "21 Mar 2026, 20:05"
 */
export function formatDateTime(date: Date | string | null | undefined, tz?: Timezone): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleString('en-GB', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit',
    timeZone: tz ?? getUserTimezone(),
  });
}

/**
 * Format a time only string in the user's timezone.
 * @example formatTime(new Date()) → "20:05"
 */
export function formatTime(date: Date | string | null | undefined, tz?: Timezone): string {
  if (!date) return '—';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (isNaN(d.getTime())) return '—';
  return d.toLocaleTimeString('en-GB', {
    hour: '2-digit', minute: '2-digit',
    timeZone: tz ?? getUserTimezone(),
  });
}

/**
 * Get the UTC offset label for a timezone.
 * @example getTimezoneOffset('Asia/Ho_Chi_Minh') → "UTC+7"
 */
export function getTimezoneOffset(tz: Timezone): string {
  const date = new Date();
  const utcDate = new Date(date.toLocaleString('en-US', { timeZone: 'UTC' }));
  const tzDate  = new Date(date.toLocaleString('en-US', { timeZone: tz }));
  const diffHours = (tzDate.getTime() - utcDate.getTime()) / (1000 * 60 * 60);
  const sign = diffHours >= 0 ? '+' : '-';
  const abs = Math.abs(diffHours);
  const h = Math.floor(abs);
  const m = Math.round((abs - h) * 60);
  return m > 0 ? `UTC${sign}${h}:${String(m).padStart(2, '0')}` : `UTC${sign}${h}`;
}

/**
 * Format a money amount in the user's preferred currency.
 * @example formatMoney(1500000) → "1.500.000 ₫"
 */
export function formatMoney(
  amount: number | string | null | undefined,
  currency?: Currency,
): string {
  const n = Number(amount);
  if (isNaN(n)) return '—';
  const cur = currency ?? getUserCurrency();
  const meta = CURRENCIES.find(c => c.value === cur);
  return new Intl.NumberFormat(meta?.locale ?? 'vi-VN', {
    style: 'currency',
    currency: cur,
    maximumFractionDigits: cur === 'VND' || cur === 'JPY' ? 0 : 2,
  }).format(n);
}
