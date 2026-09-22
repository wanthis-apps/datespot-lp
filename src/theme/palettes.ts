import type { TimeOfDay } from '@/types';

export type Palette = {
  background: string;
  surface: string;
  primary: string;
  primaryMuted: string;
  text: string;
  textSecondary: string;
  muted: string;
  border: string;
  overlay: string;
  coupon: string;
  couponText: string;
  danger: string;
};

export const palettes: Record<TimeOfDay, Palette> = {
  day: {
    background: '#FFF8F6',
    surface: '#FFFFFF',
    primary: '#C45C6A',
    primaryMuted: '#F4D6DA',
    text: '#2B1D1F',
    textSecondary: '#7A6467',
    muted: '#A08C8E',
    border: '#F0E4E5',
    overlay: 'rgba(43, 29, 31, 0.45)',
    coupon: '#F3E2C5',
    couponText: '#8A5A12',
    danger: '#B42318',
  },
  night: {
    background: '#161214',
    surface: '#241E20',
    primary: '#E07A86',
    primaryMuted: '#4A2E34',
    text: '#FFF6F4',
    textSecondary: '#C4B4B6',
    muted: '#8E7C7E',
    border: '#3A3032',
    overlay: 'rgba(0, 0, 0, 0.5)',
    coupon: '#4A3A20',
    couponText: '#F3D7A0',
    danger: '#F97066',
  },
};
