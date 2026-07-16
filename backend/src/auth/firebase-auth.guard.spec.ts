import { ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { FirebaseAuthGuard } from './firebase-auth.guard';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';

// Mock firebase-admin/app
const mockApps: any[] = [];
jest.mock('firebase-admin/app', () => {
  return {
    getApps: jest.fn().mockImplementation(() => mockApps),
    initializeApp: jest.fn(),
  };
});

// Mock firebase-admin/auth
jest.mock('firebase-admin/auth', () => {
  const verifyIdTokenMock = jest.fn().mockImplementation((token: string) => {
    if (token === 'valid-token') {
      return Promise.resolve({ uid: 'firebase-uid-123', email: 'user@firebase.com' });
    }
    return Promise.reject(new Error('Invalid signature'));
  });

  return {
    getAuth: jest.fn().mockReturnValue({
      verifyIdToken: verifyIdTokenMock,
    }),
  };
});

describe('FirebaseAuthGuard', () => {
  let guard: FirebaseAuthGuard;

  beforeEach(() => {
    jest.clearAllMocks();
    guard = new FirebaseAuthGuard();
    // Ensure NODE_ENV is set to test/production defaults
    process.env.NODE_ENV = 'production';
    delete process.env.BYPASS_FIREBASE_AUTH;
    // Reset mock apps array
    mockApps.length = 0;
  });

  function mockExecutionContext(authHeader?: string, headers: Record<string, string> = {}): ExecutionContext {
    const request = {
      headers: {
        authorization: authHeader,
        ...headers,
      },
      user: undefined,
    };

    return {
      switchToHttp: () => ({
        getRequest: () => request,
      }),
    } as unknown as ExecutionContext;
  }

  it('should throw UnauthorizedException if Authorization header is missing', async () => {
    const context = mockExecutionContext();
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Authorization token is required (Bearer <token>)'),
    );
  });

  it('should throw UnauthorizedException if token does not start with Bearer', async () => {
    const context = mockExecutionContext('token-without-bearer');
    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Authorization token is required (Bearer <token>)'),
    );
  });

  it('should verify token successfully and attach decoded user to request', async () => {
    const context = mockExecutionContext('Bearer valid-token');
    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    const req = context.switchToHttp().getRequest();
    expect(req.user).toEqual({ uid: 'firebase-uid-123', email: 'user@firebase.com' });
    expect(initializeApp).toHaveBeenCalledWith({ projectId: 'devagent-c0aaf' });
  });

  it('should throw UnauthorizedException if token verification fails', async () => {
    const context = mockExecutionContext('Bearer invalid-token');
    await expect(guard.canActivate(context)).rejects.toThrow(
      /Invalid or expired authentication token/,
    );
  });

  describe('Development Bypass', () => {
    beforeEach(() => {
      process.env.NODE_ENV = 'development';
      process.env.BYPASS_FIREBASE_AUTH = 'true';
    });

    it('should bypass auth verification if bypass is enabled and x-user-id is supplied', async () => {
      const context = mockExecutionContext(undefined, { 'x-user-id': 'dev-user-456' });
      const result = await guard.canActivate(context);

      expect(result).toBe(true);
      const req = context.switchToHttp().getRequest();
      expect(req.user).toEqual({ uid: 'dev-user-456', email: 'dev@local.mock', name: 'Dev Local' });
      expect(getAuth).not.toHaveBeenCalled();
    });

    it('should NOT bypass auth verification if bypass is enabled but x-user-id is missing', async () => {
      const context = mockExecutionContext();
      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('Authorization token is required (Bearer <token>)'),
      );
    });

    it('should NOT bypass auth verification if NODE_ENV is production even if bypass is true', async () => {
      process.env.NODE_ENV = 'production';
      const context = mockExecutionContext(undefined, { 'x-user-id': 'dev-user-456' });
      await expect(guard.canActivate(context)).rejects.toThrow(
        new UnauthorizedException('Authorization token is required (Bearer <token>)'),
      );
    });
  });
});
