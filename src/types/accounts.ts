export type Permission = {
  id: string;
  code: string;
  name: string;
  description: string | null;
  isSystem: boolean;
  createdAt: string;
  updatedAt: string;
};
export type Role = Permission & { permissions: Permission[] };
export type User = {
  id: string;
  username: string | null;
  email: string | null;
  name: string | null;
  roleId: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  mustChangePassword: boolean;
  imageKey: string | null;
  imageUrl: string | null;
  createdAt: string;
  updatedAt: string;
};
export type UserPage = {
  items: User[];
  total: number;
  page: number;
  limit: number;
};
export type Session = {
  id: string;
  createdAt: string;
  lastUsedAt: string;
  expiresAt: string;
  isCurrent: boolean;
  userAgent?: string | null;
};
export type Health = { status: string; connection?: string };
