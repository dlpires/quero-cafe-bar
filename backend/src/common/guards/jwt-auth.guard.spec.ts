import { Reflector } from '@nestjs/core';
import { JwtAuthGuard } from './jwt-auth.guard';
import { UnauthorizedException } from '@nestjs/common';

jest.mock('jsonwebtoken', () => ({
  verify: jest.fn(),
}));

import * as jwt from 'jsonwebtoken';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;
  let mockReflector: jest.Mocked<Reflector>;
  let mockContext: any;

  beforeEach(() => {
    mockReflector = {
      getAllAndOverride: jest.fn(),
    } as unknown as jest.Mocked<Reflector>;
    guard = new JwtAuthGuard(mockReflector);
    process.env.JWT_SECRET = 'test-secret';
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('deve permitir acesso quando rota é pública (isPublic = true)', () => {
    mockReflector.getAllAndOverride.mockReturnValue(true);
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    };
    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
  });

  it('deve lançar UnauthorizedException quando token não é fornecido', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    };
    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });

  it('deve autenticar via header Authorization (Happy Path)', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1, perfil: 0 });
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer token-valido' },
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    };
    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
    expect(jwt.verify).toHaveBeenCalledWith('token-valido', 'test-secret', {
      algorithms: ['HS256'],
    });
  });

  it('deve autenticar via cookie quando não há header (Happy Path)', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1, perfil: 0 });
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: {},
          cookies: { token: 'token-do-cookie' },
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    };
    const result = guard.canActivate(mockContext);
    expect(result).toBe(true);
    expect(jwt.verify).toHaveBeenCalledWith('token-do-cookie', 'test-secret', {
      algorithms: ['HS256'],
    });
  });

  it('deve lançar UnauthorizedException quando token é inválido/expirado', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    (jwt.verify as jest.Mock).mockImplementation(() => {
      throw new Error('jwt malformed');
    });
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer token-invalido' },
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    };
    expect(() => guard.canActivate(mockContext)).toThrow(UnauthorizedException);
  });

  it('deve usar header como prioridade sobre cookie', () => {
    mockReflector.getAllAndOverride.mockReturnValue(false);
    (jwt.verify as jest.Mock).mockReturnValue({ id: 1 });
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer token-header' },
          cookies: { token: 'token-cookie' },
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    };
    guard.canActivate(mockContext);
    expect(jwt.verify).toHaveBeenCalledWith(
      'token-header',
      expect.any(String),
      expect.any(Object),
    );
  });

  it('deve lançar erro quando JWT_SECRET não está configurado', () => {
    delete process.env.JWT_SECRET;
    mockReflector.getAllAndOverride.mockReturnValue(false);
    mockContext = {
      switchToHttp: () => ({
        getRequest: () => ({
          headers: { authorization: 'Bearer token' },
        }),
      }),
      getHandler: jest.fn(),
      getClass: jest.fn(),
    };
    expect(() => guard.canActivate(mockContext)).toThrow(
      'JWT_SECRET não configurado nas variáveis de ambiente',
    );
  });
});
