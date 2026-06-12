import { ConflictException } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { PrismaService } from '../prisma/prisma.service';
import { UsersService } from './users.service';
import { Prisma } from '../../generated/prisma/client';
import { createPrismaUser } from '../test/factories/user.factory';

describe('UsersService', () => {
  let service: UsersService;

  const prismaMock = {
    client: {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    },
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        UsersService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
      ],
    }).compile();

    service = moduleRef.get(UsersService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should return a user when found by id', async () => {
    const user = createPrismaUser();

    prismaMock.client.user.findUnique.mockResolvedValue(user);

    const result = await service.findById('user-123');

    expect(prismaMock.client.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'user-123' },
    });

    expect(result).toEqual({
      id: 'user-123',
      email: 'test@test.com',
      name: 'Test User',
      role: 'USER',
      createdAt: user.createdAt.toISOString(),
      updatedAt: user.updatedAt.toISOString(),
    });
  });

  it('should return undefined when user is not found by id', async () => {
    prismaMock.client.user.findUnique.mockResolvedValue(null);

    const result = await service.findById('missing-id');

    expect(prismaMock.client.user.findUnique).toHaveBeenCalledWith({
      where: { id: 'missing-id' },
    });

    expect(result).toBeUndefined();
  });

  it('should create a user', async () => {
    const createdUser = {
      id: '123',
      email: 'test@test.com',
      name: 'Test User',
      passwordHash: null,
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.client.user.create.mockResolvedValue(createdUser);

    const result = await service.create({
      email: 'test@test.com',
      name: ' Test User ',
    });

    expect(prismaMock.client.user.create).toHaveBeenCalledWith({
      data: {
        email: 'test@test.com',
        name: 'Test User',
      },
    });

    expect(result).toEqual({
      id: createdUser.id,
      email: createdUser.email,
      name: createdUser.name,
      role: 'USER',
      createdAt: createdUser.createdAt.toISOString(),
      updatedAt: createdUser.updatedAt.toISOString(),
    });
  });

  it('should throw ConflictException when email already exists', async () => {
    const prismaError = new Prisma.PrismaClientKnownRequestError(
      'Unique constraint failed',
      {
        code: 'P2002',
        clientVersion: 'test',
      },
    );

    prismaMock.client.user.create.mockRejectedValue(prismaError);

    await expect(
      service.create({
        email: 'test@test.com',
        name: 'Test User',
      }),
    ).rejects.toThrow(ConflictException);
  });
});
