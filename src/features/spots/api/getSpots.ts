import type { Spot } from '@/types';
import { MOCK_SPOTS } from '../data/mockData';

export function getSpots(): Spot[] {
  return MOCK_SPOTS;
}
