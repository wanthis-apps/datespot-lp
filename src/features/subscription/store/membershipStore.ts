import { create } from 'zustand';
import type { UserRole } from '@/types';

type MembershipState = {
  role: UserRole;
  setRole: (role: UserRole) => void;
};

export const useMembershipStore = create<MembershipState>((set) => ({
  role: 'free',
  setRole: (role) => set({ role }),
}));
