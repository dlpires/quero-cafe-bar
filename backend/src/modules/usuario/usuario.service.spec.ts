import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { UsuarioService } from './usuario.service';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ListUsuarioDto } from './dto/list-usuario.dto';

describe('UsuarioService', () => {
  let service: UsuarioService;
  let mockRepository: jest.Mocked<Repository<Usuario>>;

  // Mock do repositório TypeORM
  const mockUsuarioRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockUsuarioRepository,
        },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);
    mockRepository = module.get(getRepositoryToken(Usuario)) as jest.Mocked<Repository<Usuario>>;

    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();
  });

  describe('Criação de Usuário', () => {
    it('deve criar um novo usuário com sucesso (Happy Path)', async () => {
      // Arrange
      const createUsuarioDto: CreateUsuarioDto = {
        nome: 'João Silva',
        usuario: 'joao.silva',
        senha: 'senha123',
        perfil: 1,
      };

      const usuarioCriado: Usuario = {
        id: 1,
        ...createUsuarioDto,
      } as Usuario;

      mockUsuarioRepository.create.mockReturnValue(usuarioCriado);
      mockUsuarioRepository.save.mockResolvedValue(usuarioCriado);

      // Act
      const result = await service.create(createUsuarioDto);

      // Assert
      expect(mockUsuarioRepository.create).toHaveBeenCalledWith(createUsuarioDto);
      expect(mockUsuarioRepository.save).toHaveBeenCalledWith(usuarioCriado);
      expect(result).toEqual(usuarioCriado);
    });

    it('deve criar usuário com perfil padrão 0 quando não informado', async () => {
      // Arrange
      const createUsuarioDto: CreateUsuarioDto = {
        nome: 'Maria Santos',
        usuario: 'maria.santos',
        senha: 'senha456',
      };

      const usuarioCriado: Usuario = {
        id: 2,
        ...createUsuarioDto,
        perfil: 0,
      } as Usuario;

      mockUsuarioRepository.create.mockReturnValue(usuarioCriado);
      mockUsuarioRepository.save.mockResolvedValue(usuarioCriado);

      // Act
      const result = await service.create(createUsuarioDto);

      // Assert
      expect(result.perfil).toBe(0);
    });
  });

  describe('Listagem de Usuários', () => {
    it('deve retornar todos os usuários quando não há filtros (Happy Path)', async () => {
      // Arrange
      const usuariosMock: Usuario[] = [
        { id: 1, nome: 'Admin', usuario: 'admin', senha: '123', perfil: 0 } as Usuario,
        { id: 2, nome: 'Garçom', usuario: 'garcom', senha: '456', perfil: 1 } as Usuario,
      ];

      const listUsuarioDto: ListUsuarioDto = {};
      mockUsuarioRepository.find.mockResolvedValue(usuariosMock);

      // Act
      const result = await service.findAll(listUsuarioDto);

      // Assert
      expect(mockUsuarioRepository.find).toHaveBeenCalledWith({
        where: listUsuarioDto,
      });
      expect(result).toEqual(usuariosMock);
    });

    it('deve filtrar usuários por perfil', async () => {
      // Arrange
      const usuariosMock: Usuario[] = [
        { id: 2, nome: 'Garçom', usuario: 'garcom', senha: '456', perfil: 1 } as Usuario,
      ];

      const listUsuarioDto: ListUsuarioDto = { perfil: 1 };
      mockUsuarioRepository.find.mockResolvedValue(usuariosMock);

      // Act
      const result = await service.findAll(listUsuarioDto);

      // Assert
      expect(mockUsuarioRepository.find).toHaveBeenCalledWith({
        where: { perfil: 1 },
      });
      expect(result).toHaveLength(1);
      expect(result[0].perfil).toBe(1);
    });
  });

  describe('Busca de Usuário por ID', () => {
    it('deve retornar um usuário quando ID existe (Happy Path)', async () => {
      // Arrange
      const usuarioMock: Usuario = {
        id: 1,
        nome: 'Admin',
        usuario: 'admin',
        senha: '123',
        perfil: 0,
      } as Usuario;

      mockUsuarioRepository.findOne.mockResolvedValue(usuarioMock);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(mockUsuarioRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(usuarioMock);
    });

    it('deve lançar erro quando usuário não encontrado (Edge Case)', async () => {
      // Arrange
      mockUsuarioRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(
        'Usuário com ID 999 não encontrado',
      );
    });
  });

  describe('Busca de Usuário por Nome de Usuário', () => {
    it('deve retornar usuário quando encontrado (Happy Path)', async () => {
      // Arrange
      const usuarioMock: Usuario = {
        id: 1,
        nome: 'Admin',
        usuario: 'admin',
        senha: '123',
        perfil: 0,
      } as Usuario;

      mockUsuarioRepository.findOne.mockResolvedValue(usuarioMock);

      // Act
      const result = await service.findByUsuario('admin');

      // Assert
      expect(mockUsuarioRepository.findOne).toHaveBeenCalledWith({
        where: { usuario: 'admin' },
      });
      expect(result).toEqual(usuarioMock);
    });

    it('deve lançar erro quando usuário não encontrado (Edge Case)', async () => {
      // Arrange
      mockUsuarioRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByUsuario('inexistente')).rejects.toThrow(
        'Usuário inexistente não encontrado',
      );
    });
  });

  describe('Busca de Usuário por Perfil', () => {
    it('deve retornar usuário quando encontrado (Happy Path)', async () => {
      // Arrange
      const usuarioMock: Usuario = {
        id: 2,
        nome: 'Garçom',
        usuario: 'garcom',
        senha: '456',
        perfil: 1,
      } as Usuario;

      mockUsuarioRepository.findOne.mockResolvedValue(usuarioMock);

      // Act
      const result = await service.findByPerfil(1);

      // Assert
      expect(mockUsuarioRepository.findOne).toHaveBeenCalledWith({
        where: { perfil: 1 },
      });
      expect(result).toEqual(usuarioMock);
    });

    it('deve lançar erro quando nenhum usuário com perfil encontrado (Edge Case)', async () => {
      // Arrange
      mockUsuarioRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findByPerfil(99)).rejects.toThrow(
        'Usuário com perfil 99 não encontrado',
      );
    });
  });

  describe('Login', () => {
    it('deve retornar usuário quando credenciais está corretas (Happy Path)', async () => {
      // Arrange
      const usuarioMock: Usuario = {
        id: 1,
        nome: 'Admin',
        usuario: 'admin',
        senha: 'senha123',
        perfil: 0,
      } as Usuario;

      mockUsuarioRepository.findOne.mockResolvedValue(usuarioMock);

      // Act
      const result = await service.login('admin', 'senha123');

      // Assert
      expect(mockUsuarioRepository.findOne).toHaveBeenCalledWith({
        where: { usuario: 'admin', senha: 'senha123' },
      });
      expect(result).toEqual(usuarioMock);
    });

    it('deve lançar erro quando usuário ou senha estão incorretos (Edge Case)', async () => {
      // Arrange
      mockUsuarioRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login('admin', 'senha_errada')).rejects.toThrow(
        'Usuário ou senha inválidos',
      );
    });

    it('deve lançar erro quando usuário não existe (Edge Case)', async () => {
      // Arrange
      mockUsuarioRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.login('usuario_inexistente', 'senha')).rejects.toThrow(
        'Usuário ou senha inválidos',
      );
    });
  });

  describe('Atualização de Usuário', () => {
    it('deve atualizar usuário com sucesso (Happy Path)', async () => {
      // Arrange
      const usuarioExistente: Usuario = {
        id: 1,
        nome: 'Admin',
        usuario: 'admin',
        senha: 'senha123',
        perfil: 0,
      } as Usuario;

      const updateUsuarioDto: UpdateUsuarioDto = {
        id: 1,
        nome: 'Admin Atualizado',
        perfil: 1,
      } as UpdateUsuarioDto;

      const usuarioAtualizado: Usuario = {
        ...usuarioExistente,
        ...updateUsuarioDto,
      } as Usuario;

      mockUsuarioRepository.findOne.mockResolvedValue(usuarioExistente);
      mockUsuarioRepository.save.mockResolvedValue(usuarioAtualizado);

      // Act
      const result = await service.update(1, updateUsuarioDto);

      // Assert
      expect(mockUsuarioRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockUsuarioRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateUsuarioDto),
      );
      expect(result.nome).toBe('Admin Atualizado');
      expect(result.perfil).toBe(1);
    });

    it('deve lançar erro ao tentar atualizar usuário inexistente (Edge Case)', async () => {
      // Arrange
      mockUsuarioRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update(999, { id: 999, nome: 'Teste' } as UpdateUsuarioDto),
      ).rejects.toThrow('Usuário com ID 999 não encontrado');
    });
  });

  describe('Remoção de Usuário', () => {
    it('deve remover usuário com sucesso (Happy Path)', async () => {
      // Arrange
      const usuarioExistente: Usuario = {
        id: 1,
        nome: 'Admin',
        usuario: 'admin',
        senha: '123',
        perfil: 0,
      } as Usuario;

      mockUsuarioRepository.findOne.mockResolvedValue(usuarioExistente);
      mockUsuarioRepository.delete.mockResolvedValue({ affected: 1 });

      // Act
      const result = await service.remove(1);

      // Assert
      expect(mockUsuarioRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockUsuarioRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1 });
    });

    it('deve lançar erro ao tentar remover usuário inexistente (Edge Case)', async () => {
      // Arrange
      mockUsuarioRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow(
        'Usuário com ID 999 não encontrado',
      );
    });
  });
});
