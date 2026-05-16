// ─── HarvestLink Shared TypeScript Types ─────────────────────────────────────

export type UserRole = 'consumer' | 'farmer' | 'admin';

export type DemandStatus = 'open' | 'partially_fulfilled' | 'fulfilled' | 'cancelled';

export type AllocationStatus = 'pending' | 'confirmed' | 'rejected' | 'cancelled';

export type SubscriptionFrequency = 'weekly' | 'biweekly' | 'monthly';

export type SubscriptionStatus = 'active' | 'paused' | 'cancelled';

export type HarvestStatus = 'growing' | 'ready' | 'harvested' | 'sold';

// ─── Database row types ───────────────────────────────────────────────────────

export interface Profile {
  id: string;
  full_name: string;
  role: UserRole;
  location: string | null;
  phone: string | null;
  bio: string | null;
  created_at: string;
  updated_at: string;
}

export interface Demand {
  id: string;
  consumer_id: string;
  crop_name: string;
  quantity_kg: number;
  needed_by: string | null;
  location: string | null;
  notes: string | null;
  status: DemandStatus;
  created_at: string;
  updated_at: string;
}

export interface DemandWithAllocations extends Demand {
  allocations?: Allocation[];
  profile?: Pick<Profile, 'full_name' | 'location'>;
}

export interface Allocation {
  id: string;
  demand_id: string;
  farmer_id: string;
  allocated_kg: number;
  price_per_kg: number;
  message: string | null;
  status: AllocationStatus;
  created_at: string;
  updated_at: string;
}

export interface Subscription {
  id: string;
  consumer_id: string;
  farmer_id: string;
  crop_name: string;
  quantity_kg: number;
  frequency: SubscriptionFrequency;
  status: SubscriptionStatus;
  created_at: string;
  updated_at: string;
}

export interface Harvest {
  id: string;
  farmer_id: string;
  crop_name: string;
  field_name: string | null;
  estimated_kg: number | null;
  actual_kg: number | null;
  harvest_date: string | null;
  notes: string | null;
  status: HarvestStatus;
  created_at: string;
  updated_at: string;
}

// ─── API Response wrapper ─────────────────────────────────────────────────────

export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
}

// ─── Authenticated request context ───────────────────────────────────────────

export interface AuthContext {
  userId: string;
  userRole: UserRole;
  accessToken: string;
}
