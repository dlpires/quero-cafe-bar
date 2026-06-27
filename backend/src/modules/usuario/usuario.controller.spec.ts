import { Test, TestingModule } from '@nestjs/testing';
import * as jwt from 'jsonwebtoken';
import { Reflector, APP_GUARD } from '@nestjs/core';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
import { JwtAuthGuard } from '../../common/guards/jwt-auth.guard';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ListUsuarioDto } from './dto/list-usuario.dto';
import { DeleteUsuarioDto } from './dto/delete-usuario.dto';

describe('UsuarioController', () => {
  let controller: UsuarioController;
  let service: jest.Mocked<UsuarioService>;

  // Mock do serviço
  const mockUsuarioService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findOne: jest.fn(),
    findByUsuario: jest.fn(),
    findByPerfil: jest.fn(),
    login: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsuarioController],
      providers: [
        {
          provide: UsuarioService,
          useValue: mockUsuarioService,
        },
        {
          provide: APP_GUARD,
          useClass: JwtAuthGuard,
        },
        Reflector,
      ],
    }).compile();

    controller = module.get<UsuarioController>(UsuarioController);
    service = module.get(UsuarioService);

    jest.clearAllMocks();
  });

  describe('POST /usuario - Criar Usuário', () => {
    it('deve criar um usuário com sucesso (Happy Path)', async () => {
      // Arrange
      const createUsuarioDto: CreateUsuarioDto = {
        nome: 'Novo Usuário',
        usuario: 'novo.usuario',
        senha: 'senha123',
        perfil: 1,
      };

      const usuarioCriado = {
        id: 1,
        nome: 'Novo Usuário',
        usuario: 'novo.usuario',
        senha: 'senha123',
        perfil: 1,
      };
      service.create.mockResolvedValue(usuarioCriado);

      // Act
      const mockRequest = { user: { id: 1 } } as any;
      const result = await controller.create(createUsuarioDto, mockRequest);

      // Assert
      expect(service.create).toHaveBeenCalledWith(createUsuarioDto, { id: 1 });
      expect(result).toEqual(usuarioCriado);
    });
  });

  describe('GET /usuario - Listar Usuários', () => {
    it('deve listar todos os usuários paginados (Happy Path)', async () => {
      // Arrange
      const usuariosMock = {
        data: [
          { id: 1, nome: 'Admin', usuario: 'admin', senha: '123', perfil: 0 },
          { id: 2, nome: 'Garçom', usuario: 'garcom', senha: '456', perfil: 1 },
        ],
        total: 2,
        skip: 0,
        take: 20,
      };

      const listUsuarioDto: ListUsuarioDto = {};
      service.findAll.mockResolvedValue(usuariosMock);

      // Act
      const result = await controller.findAll(listUsuarioDto);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith(listUsuarioDto);
      expect(result).toEqual(usuariosMock);
    });

    it('deve filtrar usuários por perfil', async () => {
      // Arrange
      const usuariosMock = {
        data: [
          { id: 2, nome: 'Garçom', usuario: 'garcom', senha: '456', perfil: 1 },
        ],
        total: 1,
        skip: 0,
        take: 20,
      };

      const listUsuarioDto: ListUsuarioDto = { perfil: 1 };
      service.findAll.mockResolvedValue(usuariosMock);

      // Act
      const result = await controller.findAll(listUsuarioDto);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith({ perfil: 1 });
      expect(result.data).toHaveLength(1);
    });
  });

  describe('GET /usuario/:id - Buscar por ID', () => {
    it('deve retornar usuário quando ID existe (Happy Path)', async () => {
      // Arrange
      const usuarioMock = {
        id: 1,
        nome: 'Admin',
        usuario: 'admin',
        senha: '123',
        perfil: 0,
      };

      service.findOne.mockResolvedValue(usuarioMock);

      // Act
      const result = await controller.findOne(1);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual(usuarioMock);
    });
  });

  describe('GET /usuario/usuario/:usuario - Buscar por Nome de Usuário', () => {
    it('deve retornar usuário quando encontrado (Happy Path)', async () => {
      // Arrange
      const usuarioMock = {
        id: 1,
        nome: 'Admin',
        usuario: 'admin',
        senha: '123',
        perfil: 0,
      };

      service.findByUsuario.mockResolvedValue(usuarioMock);

      // Act
      const result = await controller.findByUsuario('admin');

      // Assert
      expect(service.findByUsuario).toHaveBeenCalledWith('admin');
      expect(result).toEqual(usuarioMock);
    });
  });

  describe('GET /usuario/perfil/:perfil - Buscar por Perfil', () => {
    it('deve retornar usuário quando encontrado (Happy Path)', async () => {
      // Arrange
      const usuarioMock = {
        id: 2,
        nome: 'Garçom',
        usuario: 'garcom',
        senha: '456',
        perfil: 1,
      };

      service.findByPerfil.mockResolvedValue(usuarioMock);

      // Act
      const result = await controller.findByPerfil(1);

      // Assert
      expect(service.findByPerfil).toHaveBeenCalledWith(1);
      expect(result).toEqual(usuarioMock);
    });
  });

  describe('GET /usuario/me - Perfil do Usuário Autenticado', () => {
    it('deve retornar dados do usuário autenticado (Happy Path)', async () => {
      // Arrange
      const usuarioMock = {
        id: 1,
        nome: 'Admin',
        usuario: 'admin',
        senha: '123',
        perfil: 0,
      };

      service.findOne.mockResolvedValue(usuarioMock);

      const mockRequest = { user: { id: 1 } } as any;

      // Act
      const result = await controller.getMe(mockRequest);

      // Assert
      expect(service.findOne).toHaveBeenCalledWith(1);
      expect(result).toEqual({
        id: 1,
        usuario: 'admin',
        perfil: 0,
      });
      expect(result).not.toHaveProperty('senha');
    });
  });

  describe('POST /usuario/login - Login', () => {
    it('deve realizar login com sucesso e retornar JWT válido (Happy Path)', async () => {
      // Arrange
      const usuarioMock = {
        id: 1,
        nome: 'Admin',
        usuario: 'admin',
        senha: 'senha123',
        perfil: 0,
      };

      process.env.JWT_SECRET = 'test-secret';
      process.env.JWT_EXPIRES_IN = '1h';
      service.login.mockResolvedValue(usuarioMock);

      const mockResponse = {
        cookie: jest.fn(),
      } as any;

      // Act
      const result = await controller.login(
        { username: 'admin', password: 'senha123' },
        mockResponse,
      );

      // Assert
      expect(service.login).toHaveBeenCalledWith('admin', 'senha123');
      expect(result).toHaveProperty('token');
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'token',
        expect.any(String),
        expect.objectContaining({
          httpOnly: true,
          sameSite: 'strict',
        }),
      );

      const decoded = jwt.verify(result.token, 'test-secret', {
        algorithms: ['HS256'],
      }) as any;
      expect(decoded.id).toBe(1);
      expect(decoded.perfil).toBe(0);
      expect(decoded.exp).toBeDefined();
    });
  });

  describe('POST /usuario/logout - Logout', () => {
    it('deve limpar o cookie e retornar mensagem de sucesso (Happy Path)', async () => {
      // Arrange
      const mockResponse = {
        cookie: jest.fn(),
      } as any;

      // Act
      const result = await controller.logout(mockResponse);

      // Assert
      expect(mockResponse.cookie).toHaveBeenCalledWith(
        'token',
        '',
        expect.objectContaining({ maxAge: 0 }),
      );
      expect(result).toEqual({ message: 'Logout realizado com sucesso' });
    });
  });

  describe('PATCH /usuario/:id - Atualizar Usuário', () => {
    it('deve atualizar usuário com sucesso (Happy Path)', async () => {
      // Arrange
      const updateUsuarioDto: UpdateUsuarioDto = {
        id: 1,
        nome: 'Admin Atualizado',
        perfil: 1,
      } as UpdateUsuarioDto;

      const usuarioAtualizado = {
        id: 1,
        nome: 'Admin Atualizado',
        usuario: 'admin',
        senha: '123',
        perfil: 1,
      };

      service.update.mockResolvedValue(usuarioAtualizado);

      // Act
      const mockUpdateRequest = { user: { id: 1, perfil: 0 } } as any;
      const result = await controller.update(
        1,
        updateUsuarioDto,
        mockUpdateRequest,
      );

      // Assert
      expect(service.update).toHaveBeenCalledWith(1, updateUsuarioDto, {
        id: 1,
        perfil: 0,
      });
      expect(result).toEqual(usuarioAtualizado);
    });
  });

  describe('DELETE /usuario/:id - Remover Usuário', () => {
    it('deve remover usuário com sucesso (Happy Path)', async () => {
      // Arrange
      const deleteResult: DeleteUsuarioDto = { id: 1 };
      service.remove.mockResolvedValue(deleteResult);

      // Act
      const mockRemoveRequest = { user: { id: 2 } } as any;
      const result = await controller.remove(1, mockRemoveRequest);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(1, { id: 2 });
      expect(result).toEqual(deleteResult);
    });
  });
});
