import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { getModelToken } from '@nestjs/mongoose';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { User } from './schemas/user.schema';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const bcryptMock = bcrypt as jest.Mocked<typeof bcrypt>;

const makeUserDoc = (override: Record<string, unknown> = {}) => ({
  _id: { toString: () => 'user-id-1' },
  email: 'user@example.com',
  password: 'hashed-password',
  createdAt: new Date(),
  updatedAt: new Date(),
  save: jest.fn().mockResolvedValue(undefined),
  ...override,
});

describe('AuthService', () => {
  let service: AuthService;
  let jwtService: jest.Mocked<JwtService>;

  const saveMock = jest.fn();
  const userModelMock: Record<string, jest.Mock> = {
    findOne: jest.fn(),
  };
  const UserModelConstructor = jest
    .fn()
    .mockImplementation(() => ({ save: saveMock }));
  Object.assign(UserModelConstructor, userModelMock);

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: getModelToken(User.name), useValue: UserModelConstructor },
        { provide: JwtService, useValue: { sign: jest.fn().mockReturnValue('signed-token') } },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jwtService = module.get(JwtService);
    jest.clearAllMocks();
    jwtService.sign.mockReturnValue('signed-token');
  });

  describe('register', () => {
    it('creates a user and returns a token', async () => {
      const doc = makeUserDoc();
      userModelMock.findOne.mockReturnValue({ exec: jest.fn().mockResolvedValue(null) });
      bcryptMock.hash.mockResolvedValue('hashed-pw' as never);
      saveMock.mockResolvedValue(doc);

      const result = await service.register({ email: 'user@example.com', password: 'password123' });

      expect(bcryptMock.hash).toHaveBeenCalledWith('password123', 10);
      expect(result.accessToken).toBe('signed-token');
      expect(result.user.email).toBe('user@example.com');
      expect(result.user).not.toHaveProperty('password');
    });

    it('throws ConflictException when email is already taken', async () => {
      userModelMock.findOne.mockReturnValue({
        exec: jest.fn().mockResolvedValue(makeUserDoc()),
      });

      await expect(
        service.register({ email: 'user@example.com', password: 'password123' }),
      ).rejects.toThrow(ConflictException);
      expect(bcryptMock.hash).not.toHaveBeenCalled();
    });
  });

  describe('login', () => {
    it('returns a token when credentials are valid', async () => {
      const doc = makeUserDoc();
      userModelMock.findOne.mockReturnValue({
        select: () => ({ exec: jest.fn().mockResolvedValue(doc) }),
      });
      bcryptMock.compare.mockResolvedValue(true as never);

      const result = await service.login({ email: 'user@example.com', password: 'password123' });

      expect(bcryptMock.compare).toHaveBeenCalledWith('password123', 'hashed-password');
      expect(result.accessToken).toBe('signed-token');
      expect(result.user.id).toBe('user-id-1');
    });

    it('throws UnauthorizedException when user is not found', async () => {
      userModelMock.findOne.mockReturnValue({
        select: () => ({ exec: jest.fn().mockResolvedValue(null) }),
      });

      await expect(
        service.login({ email: 'nobody@example.com', password: 'password123' }),
      ).rejects.toThrow(UnauthorizedException);
      expect(bcryptMock.compare).not.toHaveBeenCalled();
    });

    it('throws UnauthorizedException when password is wrong', async () => {
      const doc = makeUserDoc();
      userModelMock.findOne.mockReturnValue({
        select: () => ({ exec: jest.fn().mockResolvedValue(doc) }),
      });
      bcryptMock.compare.mockResolvedValue(false as never);

      await expect(
        service.login({ email: 'user@example.com', password: 'wrong-password' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('uses the same error message for unknown user and wrong password (no user enumeration)', async () => {
      userModelMock.findOne.mockReturnValue({
        select: () => ({ exec: jest.fn().mockResolvedValue(null) }),
      });

      let err1: Error | undefined;
      try {
        await service.login({ email: 'nobody@example.com', password: 'pw' });
      } catch (e) {
        err1 = e as Error;
      }

      const doc = makeUserDoc();
      userModelMock.findOne.mockReturnValue({
        select: () => ({ exec: jest.fn().mockResolvedValue(doc) }),
      });
      bcryptMock.compare.mockResolvedValue(false as never);

      let err2: Error | undefined;
      try {
        await service.login({ email: 'user@example.com', password: 'wrong' });
      } catch (e) {
        err2 = e as Error;
      }

      expect(err1?.message).toBe(err2?.message);
    });
  });
});
