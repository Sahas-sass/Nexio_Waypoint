export type UserRole = "dispatcher" | "loader" | "store_manager" | "driver" | "admin" | string;

export interface UserActivity {
  title: string;
  meta: string;
  time: string;
  type: "check" | "bag" | "truck" | string;
}

export interface UserProfile {
  id: string;
  email: string;
  fullName: string;
  role: UserRole;
  roleTitle: string;
  avatarUrl: string | null;
  initials: string;
  phone?: string | null;
  department?: string | null;
  employeeId?: string | null;
  outlet?: string | null;
  assignedBay?: string | null;
  station?: string | null;
  shift?: string | null;
  storeId?: string | null;
  activities?: UserActivity[];
  isVerified?: boolean;
  status?: string;
  assignedMeta?: string | null;
  createdAt?: string;
  lastSignInAt?: string | null;
}

export type LoaderProfile = UserProfile;
