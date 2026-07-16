import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { getApps, initializeApp } from 'firebase-admin/app';
import { getAuth } from 'firebase-admin/auth';
import type { Request } from 'express';

@Injectable()
export class FirebaseAuthGuard implements CanActivate {
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request & { user?: any }>();
    
    // Development bypass option
    const bypassAllowed = process.env.NODE_ENV !== 'production' && process.env.BYPASS_FIREBASE_AUTH === 'true';
    if (bypassAllowed) {
      const devUid = request.headers['x-user-id'] as string;
      if (devUid) {
        request.user = { uid: devUid, email: 'dev@local.mock', name: 'Dev Local' };
        return true;
      }
    }

    const authHeader = request.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('Authorization token is required (Bearer <token>)');
    }

    const token = authHeader.split('Bearer ')[1];
    try {
      // Initialize admin SDK if not already initialized
      if (getApps().length === 0) {
        initializeApp({
          projectId: process.env.FIREBASE_PROJECT_ID || 'devagent-c0aaf',
        });
      }
      
      const decodedToken = await getAuth().verifyIdToken(token);
      request.user = decodedToken;
      return true;
    } catch (error: any) {
      throw new UnauthorizedException(`Invalid or expired authentication token: ${error.message}`);
    }
  }
}
