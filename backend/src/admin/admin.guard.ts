import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Request } from 'express';

@Injectable()
export class AdminGuard implements CanActivate {
  constructor(private readonly config: ConfigService) {}

  canActivate(ctx: ExecutionContext): boolean {
    const req = ctx.switchToHttp().getRequest<Request>();
    const secret = this.config.get<string>('ADMIN_SECRET');

    if (!secret) {
      throw new UnauthorizedException(
        'ADMIN_SECRET is not configured. Set it in your .env file.',
      );
    }

    const provided =
      req.headers['x-admin-secret'] ||
      req.query['secret'];

    if (!provided || provided !== secret) {
      throw new UnauthorizedException('Invalid admin secret.');
    }

    return true;
  }
}
