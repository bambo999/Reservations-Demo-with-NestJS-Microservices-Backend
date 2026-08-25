import { ExecutionContext } from '@nestjs/common';
import { JwtAuthGuard } from './jwt-auth.guard';
import { ClientProxy } from '@nestjs/microservices';
import { of, throwError, firstValueFrom } from 'rxjs';
import { UserDto } from '../dto';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let authClient: ClientProxy;

  const mockUser: UserDto = {
    _id: 'user_123',
    email: 'test@example.com',
    password: 'password',
  };

  beforeEach(() => {
    authClient = {
      send: jest.fn(),
    } as unknown as ClientProxy;
    guard = new JwtAuthGuard(authClient);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('should return false if no Authentication cookie is present in request', () => {
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          cookies: {},
        }),
      }),
    } as unknown as ExecutionContext;

    const result = guard.canActivate(mockContext);
    expect(result).toBe(false);
    expect(authClient.send).not.toHaveBeenCalled();
  });

  it('should authenticate user and attach to request if token is valid', async () => {
    const mockRequest: any = {
      cookies: { Authentication: 'valid_jwt_token' },
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    (authClient.send as jest.Mock).mockReturnValue(of(mockUser));

    const resultObservable: any = guard.canActivate(mockContext);
    const result = await firstValueFrom(resultObservable);

    expect(authClient.send).toHaveBeenCalledWith('authenticate', {
      Authentication: 'valid_jwt_token',
    });
    expect(mockRequest.user).toEqual(mockUser);
    expect(result).toBe(true);
  });

  it('should return false if authClient returns an error', async () => {
    const mockRequest: any = {
      cookies: { Authentication: 'invalid_jwt_token' },
    };
    const mockContext = {
      switchToHttp: () => ({
        getRequest: () => mockRequest,
      }),
    } as unknown as ExecutionContext;

    (authClient.send as jest.Mock).mockReturnValue(
      throwError(() => new Error('Unauthorized')),
    );

    const resultObservable: any = guard.canActivate(mockContext);
    const result = await firstValueFrom(resultObservable);

    expect(result).toBe(false);
  });
});
