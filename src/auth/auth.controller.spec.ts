import { Test } from '@nestjs/testing';

import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;

  const authServiceMock = {
    register: jest.fn(),
    login: jest.fn(),
  };

  beforeEach(async () => {
    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: authServiceMock,
        },
      ],
    }).compile();

    controller = moduleRef.get(AuthController);

    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('should call AuthService.login and return the result', async () => {
    authServiceMock.login.mockResolvedValue({
      token: 'jwt-token',
    });

    const dto = {
      email: 'test@test.com',
      password: 'password123',
    };

    const result = await controller.login(dto);

    expect(authServiceMock.login).toHaveBeenCalledWith(dto);

    expect(result).toEqual({
      token: 'jwt-token',
    });
  });

  it('should call AuthService.register and return the result', async () => {
    authServiceMock.register.mockResolvedValue({
      token: 'jwt-token',
    });

    const dto = {
      email: 'test@test.com',
      name: 'Test User',
      password: 'password123',
    };

    const result = await controller.register(dto);

    expect(authServiceMock.register).toHaveBeenCalledWith(dto);

    expect(result).toEqual({
      token: 'jwt-token',
    });
  });
});
