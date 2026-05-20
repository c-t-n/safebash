import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthResponseDto } from './dto/auth-response.dto';

const mockResponse: AuthResponseDto = {
  accessToken: 'signed-token',
  user: { id: 'user-id-1', email: 'user@example.com' },
};

describe('AuthController', () => {
  let controller: AuthController;
  let authService: jest.Mocked<AuthService>;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: { register: jest.fn(), login: jest.fn() },
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get(AuthService);
  });

  describe('register', () => {
    it('returns an access token and user on success', async () => {
      authService.register.mockResolvedValue(mockResponse);

      const result = await controller.register({
        email: 'user@example.com',
        password: 'password123',
      });

      expect(result).toBe(mockResponse);
      expect(authService.register).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });

    it('propagates ConflictException when email is taken', async () => {
      authService.register.mockRejectedValue(new ConflictException());

      await expect(
        controller.register({ email: 'taken@example.com', password: 'password123' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('returns an access token and user on success', async () => {
      authService.login.mockResolvedValue(mockResponse);

      const result = await controller.login({
        email: 'user@example.com',
        password: 'password123',
      });

      expect(result).toBe(mockResponse);
      expect(authService.login).toHaveBeenCalledWith({
        email: 'user@example.com',
        password: 'password123',
      });
    });

    it('propagates UnauthorizedException on bad credentials', async () => {
      authService.login.mockRejectedValue(new UnauthorizedException());

      await expect(
        controller.login({ email: 'user@example.com', password: 'wrong' }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });
});
