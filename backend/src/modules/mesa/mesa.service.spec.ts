import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MesaService } from './mesa.service';
import { Mesa } from './entities/mesa.entity';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';
import { ListMesaDto } from './dto/list-mesa.dto';
import { NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';

describe('MesaService', () => {
  let service: MesaService;
  let mockRepository: jest.Mocked<Repository<Mesa>>;

  const mockQueryBuilder = {
    select: jest.fn().mockReturnThis(),
    where: jest.fn().mockReturnThis(),
    andWhere: jest.fn().mockReturnThis(),
    getRawMany: jest.fn().mockResolvedValue([]),
  };

  const mockManager = {
    getRepository: jest.fn().mockReturnValue({
      createQueryBuilder: jest.fn().mockReturnValue(mockQueryBuilder),
    }),
  };

  const mockMesaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
    findAndCount: jest.fn(),
    manager: mockManager,
  };

  const mockAuditService = {
    log: jest.fn().mockResolvedValue(undefined),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MesaService,
        {
          provide: getRepositoryToken(Mesa),
          useValue: mockMesaRepository,
        },
        {
          provide: AuditService,
          useValue: mockAuditService,
        },
      ],
    }).compile();

    service = module.get<MesaService>(MesaService);
    mockRepository = module.get(getRepositoryToken(Mesa));
    jest.clearAllMocks();
  });

  describe('Criação de Mesa', () => {
    it('deve criar uma mesa com sucesso (Happy Path)', async () => {
      // Arrange
      const createMesaDto: CreateMesaDto = {
        qtd_cadeiras: 4,
        status: true,
      } as unknown as CreateMesaDto;

      const mesaCriada = { id: 1, ...createMesaDto } as unknown as Mesa;
      mockMesaRepository.create.mockReturnValue(mesaCriada);
      mockMesaRepository.save.mockResolvedValue(mesaCriada);

      // Act
      const result = await service.create(createMesaDto);

      // Assert
      expect(mockMesaRepository.create).toHaveBeenCalledWith(createMesaDto);
      expect(mockMesaRepository.save).toHaveBeenCalledWith(mesaCriada);
      expect(result).toEqual(mesaCriada);
      expect(result.status).toBe(true);
    });
  });

  describe('Listagem de Mesas', () => {
    it('deve retornar todas as mesas paginadas (Happy Path)', async () => {
      // Arrange
      const mesasMock: Mesa[] = [
        { id: 1, qtd_cadeiras: 4, status: true } as unknown as Mesa,
        { id: 2, qtd_cadeiras: 6, status: true } as unknown as Mesa,
        { id: 3, qtd_cadeiras: 2, status: false } as unknown as Mesa,
      ];

      const listMesaDto: ListMesaDto = {};
      mockMesaRepository.findAndCount.mockResolvedValue([mesasMock, 3]);

      // Act
      const result = await service.findAll(listMesaDto);

      // Assert
      expect(mockMesaRepository.findAndCount).toHaveBeenCalledWith({
        where: {},
        skip: undefined,
        take: undefined,
      });
      expect(result.data).toEqual(
        mesasMock.map((m) => ({ ...m, hasActiveComanda: false })),
      );
      expect(result.total).toBe(3);
      expect(result.data).toHaveLength(3);
    });

    it('deve filtrar mesas por status (Edge Case)', async () => {
      // Arrange
      const mesasAtivas: Mesa[] = [
        { id: 1, qtd_cadeiras: 4, status: true } as unknown as Mesa,
        { id: 2, qtd_cadeiras: 6, status: true } as unknown as Mesa,
      ];

      const listMesaDto: ListMesaDto = {
        status: true,
      } as unknown as ListMesaDto;
      mockMesaRepository.findAndCount.mockResolvedValue([mesasAtivas, 2]);

      // Act
      const result = await service.findAll(listMesaDto);

      // Assert
      expect(mockMesaRepository.findAndCount).toHaveBeenCalledWith({
        where: { status: true },
        skip: undefined,
        take: undefined,
      });
      expect(result.data).toHaveLength(2);
      expect(result.data[0].status).toBe(true);
    });
  });

  describe('Busca de Mesa por ID', () => {
    it('deve retornar mesa quando ID existe (Happy Path)', async () => {
      // Arrange
      const mesaMock: Mesa = {
        id: 1,
        qtd_cadeiras: 4,
        status: true,
      } as unknown as Mesa;

      mockMesaRepository.findOne.mockResolvedValue(mesaMock);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(mockMesaRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(mesaMock);
    });

    it('deve lançar NotFoundException quando mesa não encontrada (Edge Case)', async () => {
      // Arrange
      mockMesaRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException(`Mesa com ID 999 não encontrada`),
      );
    });
  });

  describe('Atualização de Mesa', () => {
    it('deve atualizar mesa com sucesso (Happy Path)', async () => {
      // Arrange
      const mesaExistente: Mesa = {
        id: 1,
        qtd_cadeiras: 4,
        status: true,
      } as unknown as Mesa;
      const updateMesaDto: UpdateMesaDto = {
        id: 1,
        status: false,
      } as unknown as UpdateMesaDto;
      const mesaAtualizada = {
        ...mesaExistente,
        ...updateMesaDto,
      } as unknown as Mesa;

      mockMesaRepository.findOne.mockResolvedValue(mesaExistente);
      mockMesaRepository.save.mockResolvedValue(mesaAtualizada);

      // Act
      const result = await service.update(1, updateMesaDto);

      // Assert
      expect(mockMesaRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockMesaRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({ status: false }),
      );
      expect(result.status).toBe(false);
    });

    it('deve lançar NotFoundException ao atualizar mesa inexistente (Edge Case)', async () => {
      // Arrange
      mockMesaRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(
        service.update(999, { id: 999, status: false } as UpdateMesaDto),
      ).rejects.toThrow(
        new NotFoundException(`Mesa com ID 999 não encontrada`),
      );
    });
  });

  describe('Remoção de Mesa', () => {
    it('deve remover mesa com sucesso (Happy Path)', async () => {
      // Arrange
      const mesaExistente: Mesa = {
        id: 1,
        qtd_cadeiras: 4,
        status: true,
      } as unknown as Mesa;
      mockMesaRepository.findOne.mockResolvedValue(mesaExistente);
      mockMesaRepository.delete.mockResolvedValue({ affected: 1 });

      // Act
      const result = await service.remove(1);

      // Assert
      expect(mockMesaRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockMesaRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1 });
    });

    it('deve lançar NotFoundException ao remover mesa inexistente (Edge Case)', async () => {
      // Arrange
      mockMesaRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow(
        new NotFoundException(`Mesa com ID 999 não encontrada`),
      );
    });
  });
});
