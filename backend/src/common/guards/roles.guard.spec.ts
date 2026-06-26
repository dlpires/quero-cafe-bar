import { ForbiddenException } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { RolesGuard } from './roles.guard';
import { ROLES_KEY } from '../decorators/roles.decorator';

describe('RolesGuard', () => {
  let guard: RolesGuard;
  let mockReflector: jest.Mocked<Reflector>;
  let mockContext: any;

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;

    guard = new RolesGuard(mockReflector);

    mockContext = {
      getHandler: jest.fn(),
      getClass: jest.fn(),
      switchToHttp: jest.fn(),
    };
  });

  it('deve permitir acesso quando nenhum roles é definido (público)', () => {
    mockReflector.getAllAndOverride.mockReturnValue(undefined);

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it('deve permitir acesso quando array de roles está vazio', () => {
    mockReflector.getAllAndOverride.mockReturnValue([]);

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it('deve permitir acesso quando perfil do usuário está incluído nos roles', () => {
    mockReflector.getAllAndOverride.mockReturnValue([0, 1]);
    const mockRequest = { user: { perfil: 1 } };
    mockContext.switchToHttp.mockReturnValue({
      getRequest: () => mockRequest,
    });

    const result = guard.canActivate(mockContext);

    expect(result).toBe(true);
  });

  it('deve lançar ForbiddenException quando perfil do usuário não está incluído nos roles', () => {
    mockReflector.getAllAndOverride.mockReturnValue([0]);
    const mockRequest = { user: { perfil: 1 } };
    mockContext.switchToHttp.mockReturnValue({
      getRequest: () => mockRequest,
    });

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('deve lançar ForbiddenException quando usuário não possui perfil', () => {
    mockReflector.getAllAndOverride.mockReturnValue([0]);
    const mockRequest = { user: {} };
    mockContext.switchToHttp.mockReturnValue({
      getRequest: () => mockRequest,
    });

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('deve lançar ForbiddenException quando usuário é undefined', () => {
    mockReflector.getAllAndOverride.mockReturnValue([0]);
    const mockRequest = {};
    mockContext.switchToHttp.mockReturnValue({
      getRequest: () => mockRequest,
    });

    expect(() => guard.canActivate(mockContext)).toThrow(ForbiddenException);
  });

  it('deve usar Reflector para obter metadata do handler e da classe', () => {
    mockReflector.getAllAndOverride.mockReturnValue([0]);
    const mockRequest = { user: { perfil: 0 } };
    mockContext.switchToHttp.mockReturnValue({
      getRequest: () => mockRequest,
    });

    guard.canActivate(mockContext);

    expect(mockReflector.getAllAndOverride).toHaveBeenCalledWith(ROLES_KEY, [
      mockContext.getHandler(),
      mockContext.getClass(),
    ]);
  });
});
