export const colors = {
  background: '#FFF8F6',
  surface: '#FFFFFF',
  primary: '#C45C6A',
  primaryMuted: '#E8B4BB',
  text: '#2B1D1F',
  textSecondary: '#7A6467',
  muted: '#A08C8E',
  border: '#F0E4E5',
  tabBar: '#FFFFFF',
} as const;

export type ColorName = keyof typeof colors;
