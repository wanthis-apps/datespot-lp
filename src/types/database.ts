export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type Database = {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          role: Database['public']['Enums']['user_role'];
          relationship_status: Database['public']['Enums']['relationship_status'];
          created_at: string;
        };
        Insert: {
          id: string;
          role?: Database['public']['Enums']['user_role'];
          relationship_status: Database['public']['Enums']['relationship_status'];
          created_at?: string;
        };
        Update: {
          id?: string;
          role?: Database['public']['Enums']['user_role'];
          relationship_status?: Database['public']['Enums']['relationship_status'];
          created_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'users_id_fkey';
            columns: ['id'];
            isOneToOne: true;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
        ];
      };
      spots: {
        Row: {
          id: string;
          name: string;
          lat: number;
          lng: number;
          category: Database['public']['Enums']['spot_category'];
          time_recommended: Database['public']['Enums']['time_recommended'];
          relationship_tags: Database['public']['Enums']['relationship_status'][];
          is_partner_store: boolean;
          image_url: string;
          area: string;
          description: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          lat: number;
          lng: number;
          category: Database['public']['Enums']['spot_category'];
          time_recommended: Database['public']['Enums']['time_recommended'];
          relationship_tags?: Database['public']['Enums']['relationship_status'][];
          is_partner_store?: boolean;
          image_url: string;
          area: string;
          description: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          lat?: number;
          lng?: number;
          category?: Database['public']['Enums']['spot_category'];
          time_recommended?: Database['public']['Enums']['time_recommended'];
          relationship_tags?: Database['public']['Enums']['relationship_status'][];
          is_partner_store?: boolean;
          image_url?: string;
          area?: string;
          description?: string;
          created_at?: string;
        };
        Relationships: [];
      };
      coupons: {
        Row: {
          id: string;
          spot_id: string;
          description: string;
          valid_until: string;
        };
        Insert: {
          id?: string;
          spot_id: string;
          description: string;
          valid_until: string;
        };
        Update: {
          id?: string;
          spot_id?: string;
          description?: string;
          valid_until?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'coupons_spot_id_fkey';
            columns: ['spot_id'];
            isOneToOne: false;
            referencedRelation: 'spots';
            referencedColumns: ['id'];
          },
        ];
      };
      user_coupons_history: {
        Row: {
          user_id: string;
          coupon_id: string;
          used_at: string;
        };
        Insert: {
          user_id: string;
          coupon_id: string;
          used_at?: string;
        };
        Update: {
          user_id?: string;
          coupon_id?: string;
          used_at?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'user_coupons_history_user_id_fkey';
            columns: ['user_id'];
            isOneToOne: false;
            referencedRelation: 'users';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'user_coupons_history_coupon_id_fkey';
            columns: ['coupon_id'];
            isOneToOne: false;
            referencedRelation: 'coupons';
            referencedColumns: ['id'];
          },
        ];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      user_role: 'free' | 'premium';
      relationship_status:
        | 'first_date'
        | 'new_couple'
        | 'long_term'
        | 'more_than_friends';
      time_recommended: 'day' | 'night' | 'both';
      spot_category:
        | 'cafe'
        | 'activity'
        | 'lunch'
        | 'dinner'
        | 'bar'
        | 'night_view';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
};

export type PublicSchema = Database['public'];

export type Tables<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Row'];

export type TablesInsert<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Insert'];

export type TablesUpdate<T extends keyof PublicSchema['Tables']> =
  PublicSchema['Tables'][T]['Update'];

export type Enums<T extends keyof PublicSchema['Enums']> =
  PublicSchema['Enums'][T];

export type UserRole = Enums<'user_role'>;
export type RelationshipStatus = Enums<'relationship_status'>;
export type TimeRecommended = Enums<'time_recommended'>;
export type SpotCategory = Enums<'spot_category'>;

export type SpotRow = Tables<'spots'>;
export type CouponRow = Tables<'coupons'>;
export type UserRow = Tables<'users'>;
export type UserCouponHistoryRow = Tables<'user_coupons_history'>;

export type SpotRowWithCoupons = SpotRow & {
  coupons: CouponRow[];
};

export const Constants = {
  public: {
    Enums: {
      user_role: ['free', 'premium'] as const,
      relationship_status: [
        'first_date',
        'new_couple',
        'long_term',
        'more_than_friends',
      ] as const,
      time_recommended: ['day', 'night', 'both'] as const,
      spot_category: [
        'cafe',
        'activity',
        'lunch',
        'dinner',
        'bar',
        'night_view',
      ] as const,
    },
  },
} as const;
