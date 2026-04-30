import { Test, TestingModule } from '@nestjs/testing';
import { UsuarioController } from './usuario.controller';
import { UsuarioService } from './usuario.service';
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
      ],
    }).compile();

    controller = module.get<UsuarioController>(UsuarioController);
    service = module.get(UsuarioService) as jest.Mocked<UsuarioService>;

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

      const usuarioCriado = { id: 1, nome: 'Novo Usuário', usuario: 'novo.usuario', senha: 'senha123', perfil: 1 };
      service.create.mockResolvedValue(usuarioCriado);

      // Act
      const result = await controller.create(createUsuarioDto);

      // Assert
      expect(service.create).toHaveBeenCalledWith(createUsuarioDto);
      expect(result).toEqual(usuarioCriado);
    });
  });

  describe('GET /usuario - Listar Usuários', () => {
    it('deve listar todos os usuários (Happy Path)', async () => {
      // Arrange
      const usuariosMock = [
        { id: 1, nome: 'Admin', usuario: 'admin', senha: '123', perfil: 0 },
        { id: 2, nome: 'Garçom', usuario: 'garcom', senha: '456', perfil: 1 },
      ];

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
      const usuariosMock = [
        { id: 2, nome: 'Garçom', usuario: 'garcom', senha: '456', perfil: 1 },
      ];

      const listUsuarioDto: ListUsuarioDto = { perfil: 1 };
      service.findAll.mockResolvedValue(usuariosMock);

      // Act
      const result = await controller.findAll(listUsuarioDto);

      // Assert
      expect(service.findAll).toHaveBeenCalledWith({ perfil: 1 });
      expect(result).toHaveLength(1);
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

  describe('POST /usuario/login - Login', () => {
    it('deve realizar login com sucesso (Happy Path)', async () => {
      // Arrange
      const usuarioMock = {
        id: 1,
        nome: 'Admin',
        usuario: 'admin',
        senha: 'senha123',
        perfil: 0,
        token: 'jwt-token-mock',
      };

      service.login.mockResolvedValue(usuarioMock);

      // Act
      const result = await controller.login('admin', 'senha123');

      // Assert
      expect(service.login).toHaveBeenCalledWith('admin', 'senha123');
      expect(result).toEqual(usuarioMock);
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
      const result = await controller.update(1, updateUsuarioDto);

      // Assert
      expect(service.update).toHaveBeenCalledWith(1, updateUsuarioDto);
      expect(result).toEqual(usuarioAtualizado);
    });
  });

  describe('DELETE /usuario/:id - Remover Usuário', () => {
    it('deve remover usuário com sucesso (Happy Path)', async () => {
      // Arrange
      const deleteResult: DeleteUsuarioDto = { id: 1 };
      service.remove.mockResolvedValue(deleteResult);

      // Act
      const result = await controller.remove(1);

      // Assert
      expect(service.remove).toHaveBeenCalledWith(1);
      expect(result).toEqual(deleteResult);
    });
  });
});
