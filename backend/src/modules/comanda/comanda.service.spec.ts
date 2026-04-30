import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComandaService } from './comanda.service';
import { Comanda } from './entities/comanda.entity';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { UpdateComandaDto } from './dto/update-comanda.dto';
import { ListComandaDto } from './dto/list-comanda.dto';
import { NotFoundException } from '@nestjs/common';

describe('ComandaService', () => {
  let service: ComandaService;
  let mockRepository: jest.Mocked<Repository<Comanda>>;

  const mockComandaRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComandaService,
        {
          provide: getRepositoryToken(Comanda),
          useValue: mockComandaRepository,
        },
      ],
    }).compile();

    service = module.get<ComandaService>(ComandaService);
    mockRepository = module.get(getRepositoryToken(Comanda)) as jest.Mocked<Repository<Comanda>>;
    jest.clearAllMocks();
  });

  describe('Criação de Comanda', () => {
    it('deve criar uma comanda com sucesso (Happy Path)', async () => {
      // Arrange
      const createComandaDto: CreateComandaDto = {
        id_mesa: 1,
      };

      const comandaCriada = {
        id: 1,
        id_mesa: 1,
        dt_abertura: new Date(),
        dt_fechamento: null,
      };

      mockComandaRepository.create.mockReturnValue(comandaCriada);
      mockComandaRepository.save.mockResolvedValue(comandaCriada);

      // Act
      const result = await service.create(createComandaDto);

      // Assert
      expect(mockComandaRepository.create).toHaveBeenCalledWith(createComandaDto);
      expect(mockComandaRepository.save).toHaveBeenCalledWith(comandaCriada);
      expect(result).toEqual(comandaCriada);
      expect(result.id_mesa).toBe(1);
    });
  });

  describe('Listagem de Comandas', () => {
    it('deve retornar todas as comandas com relacionamentos (Happy Path)', async () => {
      // Arrange
      const comandasMock = [
        {
          id: 1,
          id_mesa: 1,
          mesa: { id: 1, status: true },
          itens: [{ id: 1, produto: { dsc_produto: 'Café' } }],
        },
        {
          id: 2,
          id_mesa: 2,
          mesa: { id: 2, status: true },
          itens: [],
        },
      ];

      mockComandaRepository.find.mockResolvedValue(comandasMock);

      // Act
      const result = await service.findAll({});

      // Assert
      expect(mockComandaRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: ['mesa', 'itens', 'itens.produto'],
      });
      expect(result).toEqual(comandasMock);
      expect(result).toHaveLength(2);
    });
  });

  describe('Busca de Comanda por ID', () => {
    it('deve retornar comanda quando ID existe (Happy Path)', async () => {
      // Arrange
      const comandaMock = {
        id: 1,
        id_mesa: 1,
        mesa: { id: 1 },
      };

      mockComandaRepository.findOne.mockResolvedValue(comandaMock);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(mockComandaRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(comandaMock);
    });

    it('deve lançar NotFoundException quando comanda não encontrada (Edge Case)', async () => {
      // Arrange
      mockComandaRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException(`Comanda com ID 999 não encontrada`),
      );
    });
  });

  describe('Busca de Comanda por ID da Mesa', () => {
    it('deve retornar comanda quando mesa tem comanda aberta (Happy Path)', async () => {
      // Arrange
      const comandaMock = {
        id: 1,
        id_mesa: 5,
        mesa: { id: 5 },
      };

      mockComandaRepository.findOne.mockResolvedValue(comandaMock);

      // Act
      const result = await service.findOneByMesaId(5);

      // Assert
      expect(mockComandaRepository.findOne).toHaveBeenCalledWith({
        where: { id_mesa: 5 },
      });
      expect(result).toEqual(comandaMock);
    });

    it('deve lançar NotFoundException quando mesa não tem comanda (Edge Case)', async () => {
      // Arrange
      mockComandaRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOneByMesaId(999)).rejects.toThrow(
        new NotFoundException(`Comanda da Mesa com ID 999 não encontrada`),
      );
    });
  });

  describe('Atualização de Comanda', () => {
    it('deve atualizar comanda com sucesso (Happy Path)', async () => {
      // Arrange
      const comandaExistente = {
        id: 1,
        id_mesa: 1,
        dt_fechamento: null,
      };

      const updateComandaDto = {
        id: 1,
        dt_fechamento: new Date(),
      };

      const comandaAtualizada = { ...comandaExistente, ...updateComandaDto };
      mockComandaRepository.findOne.mockResolvedValue(comandaExistente);
      mockComandaRepository.save.mockResolvedValue(comandaAtualizada);

      // Act
      const result = await service.update(1, updateComandaDto);

      // Assert
      expect(mockComandaRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockComandaRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateComandaDto),
      );
      expect((result as any).dt_fechamento).toBeDefined();
    });

    it('deve lançar NotFoundException ao atualizar comanda inexistente (Edge Case)', async () => {
      // Arrange
      mockComandaRepository.findOne.mockResolvedValue(null);

      const updateDto = { id: 999, dt_fechamento: new Date() };

      // Act & Assert
      await expect(
        service.update(999, updateDto),
      ).rejects.toThrow(
        new NotFoundException(`Comanda com ID 999 não encontrada`),
      );
    });
  });

  describe('Remoção de Comanda', () => {
    it('deve remover comanda com sucesso (Happy Path)', async () => {
      // Arrange
      const comandaExistente = { id: 1, id_mesa: 1 };
      mockComandaRepository.findOne.mockResolvedValue(comandaExistente);
      mockComandaRepository.delete.mockResolvedValue({ affected: 1 });

      // Act
      const result = await service.remove(1);

      // Assert
      expect(mockComandaRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockComandaRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1 });
    });

    it('deve lançar NotFoundException ao remover comanda inexistente (Edge Case)', async () => {
      // Arrange
      mockComandaRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow(
        new NotFoundException(`Comanda com ID 999 não encontrada`),
      );
    });
  });
});
