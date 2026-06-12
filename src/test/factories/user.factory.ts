type PrismaUser = {
  id: string;
  email: string;
  name: string;
  passwordHash: string | null;
  role: 'USER' | 'ADMIN';
  createdAt: Date;
  updatedAt: Date;
};

export function createPrismaUser(
  overrides: Partial<PrismaUser> = {},
): PrismaUser {
  return {
    id: 'user-123',
    email: 'test@test.com',
    name: 'Test User',
    passwordHash: null,
    role: 'USER',
    createdAt: new Date('2026-01-01'),
    updatedAt: new Date('2026-01-01'),
    ...overrides,
  };
}
