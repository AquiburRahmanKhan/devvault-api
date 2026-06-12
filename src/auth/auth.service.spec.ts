import { ConflictException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { Test } from '@nestjs/testing';
import * as bcrypt from 'bcrypt';
import { UnauthorizedException } from '@nestjs/common';

import { PrismaService } from '../prisma/prisma.service';
import { AuthService } from './auth.service';
import { createPrismaUser } from '../test/factories/user.factory';

jest.mock('bcrypt');

describe('AuthService', () => {
  let service: AuthService;

  const prismaMock = {
    client: {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    },
  };

  const jwtMock = {
    signAsync: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: prismaMock,
        },
        {
          provide: JwtService,
          useValue: jwtMock,
        },
      ],
    }).compile();

    service = moduleRef.get(AuthService);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should register a new user and return a token', async () => {
    prismaMock.client.user.findUnique.mockResolvedValue(null);

    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed-password');

    const createdUser = {
      id: 'user-123',
      email: 'test@test.com',
      name: 'Test User',
      passwordHash: 'hashed-password',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.client.user.create.mockResolvedValue(createdUser);

    jwtMock.signAsync.mockResolvedValue('jwt-token');

    const result = await service.register({
      email: 'test@test.com',
      name: 'Test User',
      password: 'password123',
    });

    expect(prismaMock.client.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: 'test@test.com',
      },
    });

    expect(bcrypt.hash).toHaveBeenCalledWith('password123', 10);

    expect(prismaMock.client.user.create).toHaveBeenCalledWith({
      data: {
        email: 'test@test.com',
        name: 'Test User',
        passwordHash: 'hashed-password',
        role: 'USER',
      },
    });

    expect(jwtMock.signAsync).toHaveBeenCalledWith({
      sub: 'user-123',
      email: 'test@test.com',
      role: 'USER',
    });

    expect(result).toEqual({
      token: 'jwt-token',
    });
  });

  it('should throw ConflictException when email already exists', async () => {
    const existingUser = {
      id: 'user-123',
      email: 'test@test.com',
      name: 'Test User',
      passwordHash: 'hashed-password',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.client.user.findUnique.mockResolvedValue(existingUser);

    await expect(
      service.register({
        email: 'test@test.com',
        name: 'Test User',
        password: 'password123',
      }),
    ).rejects.toThrow(ConflictException);

    expect(prismaMock.client.user.create).not.toHaveBeenCalled();
    expect(jwtMock.signAsync).not.toHaveBeenCalled();
  });

  it('should login and return a token', async () => {
    const user = {
      id: 'user-123',
      email: 'test@test.com',
      name: 'Test User',
      passwordHash: 'hashed-password',
      role: 'USER',
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    prismaMock.client.user.findUnique.mockResolvedValue(user);

    (bcrypt.compare as jest.Mock).mockResolvedValue(true);

    jwtMock.signAsync.mockResolvedValue('jwt-token');

    const result = await service.login({
      email: 'test@test.com',
      password: 'password123',
    });

    expect(prismaMock.client.user.findUnique).toHaveBeenCalledWith({
      where: {
        email: 'test@test.com',
      },
    });

    expect(bcrypt.compare).toHaveBeenCalledWith(
      'password123',
      'hashed-password',
    );

    expect(jwtMock.signAsync).toHaveBeenCalledWith({
      sub: 'user-123',
      email: 'test@test.com',
      role: 'USER',
    });

    expect(result).toEqual({
      token: 'jwt-token',
    });
  });

  it('should throw UnauthorizedException when user is not found', async () => {
    prismaMock.client.user.findUnique.mockResolvedValue(null);

    await expect(
      service.login({
        email: 'missing@test.com',
        password: 'password123',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(bcrypt.compare).not.toHaveBeenCalled();
    expect(jwtMock.signAsync).not.toHaveBeenCalled();
  });

  it('should throw UnauthorizedException when password is wrong', async () => {
    const user = createPrismaUser({
      email: 'test@test.com',
      passwordHash: 'hashed-password',
    });

    prismaMock.client.user.findUnique.mockResolvedValue(user);
    (bcrypt.compare as jest.Mock).mockResolvedValue(false);

    await expect(
      service.login({
        email: 'test@test.com',
        password: 'wrong-password',
      }),
    ).rejects.toThrow(UnauthorizedException);

    expect(jwtMock.signAsync).not.toHaveBeenCalled();
  });
});
