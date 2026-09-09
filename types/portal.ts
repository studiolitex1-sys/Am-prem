export type ThemeMode = 'emerald' | 'cyan' | 'purple' | 'amber' | 'crimson';

export interface ThemeConfig {
  id: ThemeMode;
  name: string;
  primary: string;
  primaryHex: string;
  glow: string;
  border: string;
  badge: string;
  bgLight: string;
}

export interface ActivationHistory {
  id: string;
  email: string;
  type: 'send_link' | 'verified';
  timestamp: number;
  status: 'pending' | 'success' | 'failed';
  magicLinkSnippet?: string;
  message?: string;
}

export interface AdItem {
  id: string;
  title: string;
  sponsor: string;
  category: string;
  description: string;
  badge: string;
  cta: string;
  timerSeconds: number;
  bannerImage: string;
  redirectUrl: string;
}
