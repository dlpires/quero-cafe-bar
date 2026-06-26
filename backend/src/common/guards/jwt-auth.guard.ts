import {
  Injectable,
  CanActivate,
  ExecutionContext,
  UnauthorizedException,
  SetMetadata,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import * as jwt from 'jsonwebtoken';
import type { Request } from 'express';

export const IS_PUBLIC_KEY = 'isPublic';
export const Public = () => SetMetadata(IS_PUBLIC_KEY, true);

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);
    if (isPublic) {
      return true;
    }

    const request = context.switchToHttp().getRequest<Request>();
    const authHeader: string | undefined =
      request.headers.authorization?.toString();
    const cookieToken: string | undefined = (
      request as unknown as { cookies?: { token?: string } }
    ).cookies?.token;
    const token = authHeader?.replace('Bearer ', '') || cookieToken;
    if (!token) {
      throw new UnauthorizedException('Token não fornecido');
    }
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET não configurado nas variáveis de ambiente');
    }

    try {
      const decoded: string | jwt.JwtPayload = jwt.verify(token, secret, {
        algorithms: ['HS256'],
      });
      (request as unknown as Record<string, unknown>).user = decoded;
      return true;
    } catch {
      throw new UnauthorizedException('Token inválido ou expirado');
    }
  }
}
