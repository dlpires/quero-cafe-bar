import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { AuditService } from './audit.service';
import { AuditLog } from './entities/audit-log.entity';

describe('AuditService', () => {
  let service: AuditService;
  const mockLogRepository = {
    create: jest.fn(),
    save: jest.fn(),
    findAndCount: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuditService,
        {
          provide: getRepositoryToken(AuditLog),
          useValue: mockLogRepository,
        },
      ],
    }).compile();

    service = module.get<AuditService>(AuditService);
    jest.clearAllMocks();
  });

  it('deve ser definido', () => {
    expect(service).toBeDefined();
  });

  describe('log()', () => {
    it('deve criar e salvar um log de auditoria com todos os campos', async () => {
      const mockEntry = {
        id: 1,
        userId: 1,
        action: 'usuario.create',
        resource: 'usuario',
        resourceId: 1,
        details: null,
      };
      mockLogRepository.create.mockReturnValue(mockEntry);
      mockLogRepository.save.mockResolvedValue(mockEntry);

      const result = await service.log(1, 'usuario.create', 'usuario', 1);

      expect(mockLogRepository.create).toHaveBeenCalledWith({
        userId: 1,
        action: 'usuario.create',
        resource: 'usuario',
        resourceId: 1,
        details: undefined,
      });
      expect(mockLogRepository.save).toHaveBeenCalledWith(mockEntry);
      expect(result).toEqual(mockEntry);
    });

    it('deve criar log sem resourceId', async () => {
      const mockEntry = {
        id: 2,
        userId: 2,
        action: 'usuario.delete',
        resource: 'usuario',
        resourceId: null,
        details: null,
      };
      mockLogRepository.create.mockReturnValue(mockEntry);
      mockLogRepository.save.mockResolvedValue(mockEntry);

      const result = await service.log(2, 'usuario.delete', 'usuario');

      expect(mockLogRepository.create).toHaveBeenCalledWith({
        userId: 2,
        action: 'usuario.delete',
        resource: 'usuario',
        resourceId: undefined,
        details: undefined,
      });
      expect(result).toEqual(mockEntry);
    });

    it('deve criar log com detalhes adicionais', async () => {
      const details = { oldPerfil: 1, newPerfil: 2 };
      const mockEntry = {
        id: 3,
        userId: 1,
        action: 'usuario.update.perfil',
        resource: 'usuario',
        resourceId: 5,
        details,
      };
      mockLogRepository.create.mockReturnValue(mockEntry);
      mockLogRepository.save.mockResolvedValue(mockEntry);

      const result = await service.log(
        1,
        'usuario.update.perfil',
        'usuario',
        5,
        details,
      );

      expect(mockLogRepository.create).toHaveBeenCalledWith({
        userId: 1,
        action: 'usuario.update.perfil',
        resource: 'usuario',
        resourceId: 5,
        details,
      });
      expect(result).toEqual(mockEntry);
    });
  });

  describe('findAll()', () => {
    it('deve retornar logs paginados ordenados por data decrescente', async () => {
      const mockData = [
        { id: 2, userId: 1, action: 'create', resource: 'usuario' },
        { id: 1, userId: 1, action: 'create', resource: 'produto' },
      ];
      mockLogRepository.findAndCount.mockResolvedValue([mockData, 2]);

      const result = await service.findAll(0, 50);

      expect(mockLogRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 50,
        order: { createdAt: 'DESC' },
      });
      expect(result.data).toEqual(mockData);
      expect(result.total).toBe(2);
    });

    it('deve usar valores padrão (skip=0, take=50) quando nenhum parâmetro é passado', async () => {
      mockLogRepository.findAndCount.mockResolvedValue([[], 0]);

      await service.findAll();

      expect(mockLogRepository.findAndCount).toHaveBeenCalledWith({
        skip: 0,
        take: 50,
        order: { createdAt: 'DESC' },
      });
    });

    it('deve aceitar parâmetros explícitos personalizados', async () => {
      const mockData = [
        { id: 3, userId: 2, action: 'delete', resource: 'usuario' },
      ];
      mockLogRepository.findAndCount.mockResolvedValue([mockData, 1]);

      const result = await service.findAll(10, 5);

      expect(mockLogRepository.findAndCount).toHaveBeenCalledWith({
        skip: 10,
        take: 5,
        order: { createdAt: 'DESC' },
      });
      expect(result.data).toHaveLength(1);
      expect(result.total).toBe(1);
    });

    it('deve retornar lista vazia quando não há logs', async () => {
      mockLogRepository.findAndCount.mockResolvedValue([[], 0]);

      const result = await service.findAll();

      expect(result).toEqual({ data: [], total: 0 });
    });
  });
});
