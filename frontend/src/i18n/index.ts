import en from './en.json';

export const translations: Record<string, string> = en as Record<string, string>;

export function t(key: string): string {
  return translations[key] ?? key;
}
