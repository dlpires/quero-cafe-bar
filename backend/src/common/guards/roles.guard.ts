import {
  Injectable,
  CanActivate,
  ExecutionContext,
  ForbiddenException,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { ROLES_KEY } from '../decorators/roles.decorator';

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<number[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    if (!requiredRoles || requiredRoles.length === 0) {
      return true;
    }

    const request = context
      .switchToHttp()
      .getRequest<Record<string, unknown>>();
    const user = request.user as { perfil?: number } | undefined;

    if (!user || user.perfil === undefined || user.perfil === null) {
      throw new ForbiddenException(
        'Acesso negado: perfil de usuário não definido',
      );
    }

    if (!requiredRoles.includes(user.perfil)) {
      throw new ForbiddenException(
        `Acesso negado: perfil ${user.perfil} não tem permissão para esta ação`,
      );
    }

    return true;
  }
}
