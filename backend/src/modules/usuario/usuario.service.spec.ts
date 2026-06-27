import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { UsuarioService } from './usuario.service';
import { Usuario } from './entities/usuario.entity';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ListUsuarioDto } from './dto/list-usuario.dto';
import { AuditService } from '../audit/audit.service';
import { ConflictException, ForbiddenException } from '@nestjs/common';

jest.mock('bcrypt');

describe('UsuarioService', () => {
  let service: UsuarioService;

  // Mock do repositório TypeORM
  const mockUsuarioRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    findAndCount: jest.fn(),
  };

  const mockAuditService = {
    log: jest.fn(),
    findAll: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UsuarioService,
        {
          provide: getRepositoryToken(Usuario),
          useValue: mockUsuarioRepository,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<UsuarioService>(UsuarioService);

    // Limpa todos os mocks antes de cada teste
    jest.clearAllMocks();

    // Mock bcrypt
    (bcrypt.genSalt as jest.Mock).mockResolvedValue('salt');
    (bcrypt.hash as jest.Mock).mockResolvedValue('hashed_password');
    (bcrypt.compare as jest.Mock).mockImplementation(
      (plain: string, hash: string) => Promise.resolve(plain === hash),
    );
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

      mockUsuarioRepository.findOne.mockResolvedValue(null);
      mockUsuarioRepository.create.mockReturnValue(usuarioCriado);
      mockUsuarioRepository.save.mockResolvedValue(usuarioCriado);

      // Act
      const result = await service.create(createUsuarioDto);

      // Assert
      expect(mockUsuarioRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'João Silva',
          usuario: 'joao.silva',
          perfil: 1,
        }),
      );
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

      mockUsuarioRepository.findOne.mockResolvedValue(null);
      mockUsuarioRepository.create.mockReturnValue(usuarioCriado);
      mockUsuarioRepository.save.mockResolvedValue(usuarioCriado);

      // Act
      const result = await service.create(createUsuarioDto);

      // Assert
      expect(mockUsuarioRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          nome: 'Maria Santos',
          usuario: 'maria.santos',
        }),
      );
      expect(result.perfil).toBe(0);
    });
  });

  describe('Listagem de Usuários', () => {
    it('deve retornar todos os usuários paginados quando não há filtros (Happy Path)', async () => {
      // Arrange
      const usuariosMock: Usuario[] = [
        {
          id: 1,
          nome: 'Admin',
          usuario: 'admin',
          senha: '123',
          perfil: 0,
        } as Usuario,
        {
          id: 2,
          nome: 'Garçom',
          usuario: 'garcom',
          senha: '456',
          perfil: 1,
        } as Usuario,
      ];

      const listUsuarioDto: ListUsuarioDto = {};
      mockUsuarioRepository.findAndCount.mockResolvedValue([usuariosMock, 2]);

      // Act
      const result = await service.findAll(listUsuarioDto);

      // Assert
      expect(mockUsuarioRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        skip: undefined,
        take: undefined,
      });
      expect(result.data).toEqual(usuariosMock);
      expect(result.total).toBe(2);
    });

    it('deve filtrar usuários por perfil', async () => {
      // Arrange
      const usuariosMock: Usuario[] = [
        {
          id: 2,
          nome: 'Garçom',
          usuario: 'garcom',
          senha: '456',
          perfil: 1,
        } as Usuario,
      ];

      const listUsuarioDto: ListUsuarioDto = { perfil: 1 };
      mockUsuarioRepository.findAndCount.mockResolvedValue([usuariosMock, 1]);

      // Act
      const result = await service.findAll(listUsuarioDto);

      // Assert
      expect(mockUsuarioRepository.findAndCount).toHaveBeenCalledWith({
        where: { perfil: 1 },
        skip: undefined,
        take: undefined,
      });
      expect(result.data).toHaveLength(1);
      expect(result.data[0].perfil).toBe(1);
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
    it('deve retornar usuário quando credenciais estão corretas (Happy Path)', async () => {
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
        where: { usuario: 'admin' },
      });
      expect(result).toEqual(usuarioMock);
    });

    it('deve lançar erro quando usuário não existe (Edge Case)', async () => {
      // Arrange
      mockUsuarioRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.login('usuario_inexistente', 'senha'),
      ).rejects.toThrow('Usuário ou senha inválidos');
    });

    it('deve lançar erro quando senha está incorreta (Edge Case)', async () => {
      // Arrange
      const usuarioMock: Usuario = {
        id: 1,
        nome: 'Admin',
        usuario: 'admin',
        senha: 'senha_correta',
        perfil: 0,
      } as Usuario;

      mockUsuarioRepository.findOne.mockResolvedValue(usuarioMock);

      // Act & Assert
      await expect(service.login('admin', 'senha_errada')).rejects.toThrow(
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

  describe('Auditoria e Permissões', () => {
    describe('create() com auditoria', () => {
      it('deve registrar log de auditoria ao criar usuário com authenticatedUser', async () => {
        mockUsuarioRepository.findOne.mockResolvedValue(null);
        mockUsuarioRepository.save.mockResolvedValue({
          id: 1,
          usuario: 'novo',
          perfil: 1,
        } as Usuario);

        const result = await service.create(
          { usuario: 'novo', senha: '123', perfil: 1 } as any,
          { id: 99 },
        );

        expect(mockAuditService.log).toHaveBeenCalledWith(
          99,
          'CREATE',
          'usuario',
          1,
          { usuario: 'novo', perfil: 1 },
        );
        expect(result.id).toBe(1);
      });

      it('deve criar sem auditoria quando não há authenticatedUser', async () => {
        mockUsuarioRepository.findOne.mockResolvedValue(null);
        mockUsuarioRepository.save.mockResolvedValue({
          id: 2,
          usuario: 'anon',
          perfil: 0,
        } as Usuario);

        const result = await service.create({
          usuario: 'anon',
          senha: '123',
          perfil: 0,
        } as any);

        expect(mockAuditService.log).not.toHaveBeenCalled();
        expect(result.id).toBe(2);
      });
    });

    describe('update() com auto-proteção de perfil', () => {
      it('deve lançar ForbiddenException quando usuário não-admin tenta alterar próprio perfil', async () => {
        const updateDto = { perfil: 0 };
        await expect(
          service.update(1, updateDto as any, { id: 1, perfil: 1 }),
        ).rejects.toThrow(ForbiddenException);
      });

      it('deve permitir alteração de perfil quando admin altera outro usuário', async () => {
        mockUsuarioRepository.findOne.mockResolvedValue({
          id: 2,
          usuario: 'outro',
          perfil: 1,
          senha: 'hash',
        } as Usuario);
        mockUsuarioRepository.save.mockResolvedValue({
          id: 2,
          usuario: 'outro',
          perfil: 0,
          senha: 'hash',
        } as Usuario);

        await service.update(2, { perfil: 0 } as any, {
          id: 1,
          perfil: 0,
        });

        expect(mockUsuarioRepository.save).toHaveBeenCalled();
        expect(mockAuditService.log).toHaveBeenCalledWith(
          1,
          'UPDATE',
          'usuario',
          2,
          { previousPerfil: 1, newPerfil: 0 },
        );
      });

      it('deve atualizar senha com bcrypt quando fornecida', async () => {
        mockUsuarioRepository.findOne.mockResolvedValue({
          id: 1,
          usuario: 'user',
          senha: 'hash-antigo',
        } as Usuario);
        mockUsuarioRepository.save.mockResolvedValue({
          id: 1,
          usuario: 'user',
          senha: 'hashed-senha',
        } as Usuario);

        await service.update(1, { senha: 'nova-senha' } as any, {
          id: 99,
          perfil: 0,
        });

        expect(bcrypt.hash).toHaveBeenCalledWith('nova-senha', 'salt');
      });
    });

    describe('remove() com auto-exclusão', () => {
      it('deve lançar ConflictException ao tentar excluir próprio usuário', async () => {
        await expect(service.remove(1, { id: 1 })).rejects.toThrow(
          ConflictException,
        );
      });

      it('deve registrar auditoria ao excluir outro usuário', async () => {
        mockUsuarioRepository.findOne.mockResolvedValue({
          id: 2,
          usuario: 'outro',
        } as Usuario);
        mockUsuarioRepository.delete.mockResolvedValue({ affected: 1 });

        const result = await service.remove(2, { id: 1 });

        expect(mockAuditService.log).toHaveBeenCalledWith(
          1,
          'DELETE',
          'usuario',
          2,
          {
            usuario: 'outro',
          },
        );
        expect(result).toEqual({ id: 2 });
      });
    });
  });
});
