import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComandaItemService } from './comanda-item.service';
import { ComandaItem } from './entities/comanda-item.entity';
import { CreateComandaItemDto } from './dto/create-comanda-item.dto';
import { UpdateComandaItemDto } from './dto/update-comanda-item.dto';
import { ListComandaItemDto } from './dto/list-comanda-item.dto';
import { NotFoundException } from '@nestjs/common';

describe('ComandaItemService', () => {
  let service: ComandaItemService;
  let mockRepository: jest.Mocked<Repository<ComandaItem>>;

  const mockComandaItemRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ComandaItemService,
        {
          provide: getRepositoryToken(ComandaItem),
          useValue: mockComandaItemRepository,
        },
      ],
    }).compile();

    service = module.get<ComandaItemService>(ComandaItemService);
    mockRepository = module.get(getRepositoryToken(ComandaItem));
    jest.clearAllMocks();
  });

  describe('Criação de Item de Comanda', () => {
    it('deve criar um item de comanda com sucesso (Happy Path)', async () => {
      // Arrange
      const createComandaItemDto: CreateComandaItemDto = {
        id_comanda: 1,
        id_produto: 10,
        qtd_item: 2,
        valor_venda: 5.5,
        statusPg: false,
        statusEntrega: false,
      };

      const itemCriado = {
        id_comanda: 1,
        id_produto: 10,
        qtd_item: 2,
        valor_venda: 5.5,
        statusPg: false,
        statusEntrega: false,
        produto: { dsc_produto: 'Café' },
      } as unknown as ComandaItem;

      mockComandaItemRepository.create.mockReturnValue(itemCriado);
      mockComandaItemRepository.save.mockResolvedValue(itemCriado);

      // Act
      const result = await service.create(createComandaItemDto);

      // Assert
      expect(mockComandaItemRepository.create).toHaveBeenCalledWith(
        createComandaItemDto,
      );
      expect(mockComandaItemRepository.save).toHaveBeenCalledWith(itemCriado);
      expect(result).toEqual(itemCriado);
      expect(result.qtd_item).toBe(2);
      expect(result.statusEntrega).toBe(false);
    });
  });

  describe('Listagem de Itens de Comanda', () => {
    it('deve retornar todos os itens com relacionamento produto (Happy Path)', async () => {
      // Arrange
      const itensMock = [
        {
          id_comanda: 1,
          id_produto: 10,
          qtd_item: 2,
          produto: { dsc_produto: 'Café', vlr_produto: 5.0 },
        },
        {
          id_comanda: 1,
          id_produto: 11,
          qtd_item: 1,
          produto: { dsc_produto: 'Pão', vlr_produto: 3.5 },
        },
      ];

      mockComandaItemRepository.find.mockResolvedValue(itensMock);

      // Act
      const result = await service.findAll({});

      // Assert
      expect(mockComandaItemRepository.find).toHaveBeenCalledWith({
        where: {},
        relations: ['produto'],
      });
      expect(result).toEqual(itensMock);
      expect(result).toHaveLength(2);
    });

    it('deve filtrar itens por id_comanda (Edge Case)', async () => {
      // Arrange
      const itensMock = [
        {
          id_comanda: 1,
          id_produto: 10,
          qtd_item: 2,
        },
      ];

      mockComandaItemRepository.find.mockResolvedValue(itensMock);

      // Act
      const result = await service.findAll({ id_comanda: 1 });

      // Assert
      expect(mockComandaItemRepository.find).toHaveBeenCalledWith({
        where: { id_comanda: 1 },
        relations: ['produto'],
      });
      expect(result[0].id_comanda).toBe(1);
    });
  });

  describe('Busca de Item de Comanda por ID Composto', () => {
    it('deve retornar item quando encontrado (Happy Path)', async () => {
      // Arrange
      const itemMock = {
        id_comanda: 1,
        id_produto: 10,
        qtd_item: 2,
        produto: { dsc_produto: 'Café' },
      };

      mockComandaItemRepository.findOne.mockResolvedValue(itemMock);

      // Act
      const result = await service.findOne(1, 10);

      // Assert
      expect(mockComandaItemRepository.findOne).toHaveBeenCalledWith({
        where: { id_comanda: 1, id_produto: 10 },
      });
      expect(result).toEqual(itemMock);
    });

    it('deve lançar NotFoundException quando item não encontrado (Edge Case)', async () => {
      // Arrange
      mockComandaItemRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999, 888)).rejects.toThrow(
        new NotFoundException(
          `Item da comanda 999 e produto 888 não encontrado`,
        ),
      );
    });
  });

  describe('Atualização de Item de Comanda', () => {
    it('deve atualizar item com sucesso (Happy Path)', async () => {
      // Arrange
      const itemExistente: ComandaItem = {
        id_comanda: 1,
        id_produto: 10,
        qtd_item: 2,
        valor_venda: 5.5,
        statusPg: false,
        statusEntrega: false,
      } as unknown as ComandaItem;

      const updateComandaItemDto: UpdateComandaItemDto = {
        id_comanda: 1,
        id_produto: 10,
        qtd_item: 3,
        statusEntrega: true,
      };

      const itemAtualizado: ComandaItem = {
        ...itemExistente,
        ...updateComandaItemDto,
      } as unknown as ComandaItem;

      mockComandaItemRepository.findOne.mockResolvedValue(itemExistente);
      mockComandaItemRepository.save.mockResolvedValue(itemAtualizado);

      // Act
      const result = await service.update(1, 10, updateComandaItemDto);

      // Assert
      expect(mockComandaItemRepository.findOne).toHaveBeenCalledWith({
        where: { id_comanda: 1, id_produto: 10 },
      });
      expect(mockComandaItemRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateComandaItemDto),
      );
      expect(result.qtd_item).toBe(3);
      expect(result.statusEntrega).toBe(true);
    });

    it('deve lançar NotFoundException ao atualizar item inexistente (Edge Case)', async () => {
      // Arrange
      mockComandaItemRepository.findOne.mockResolvedValue(null);

      const updateDto = {
        id_comanda: 999,
        id_produto: 888,
        statusEntrega: true,
      };

      // Act & Assert
      await expect(service.update(999, 888, updateDto)).rejects.toThrow(
        new NotFoundException(
          `Item da comanda 999 e produto 888 não encontrado`,
        ),
      );
    });
  });

  describe('Remoção de Item de Comanda', () => {
    it('deve remover item com sucesso (Happy Path)', async () => {
      // Arrange
      const itemExistente: ComandaItem = {
        id_comanda: 1,
        id_produto: 10,
        qtd_item: 2,
        valor_venda: 5.5,
        statusPg: false,
        statusEntrega: false,
      } as unknown as ComandaItem;

      mockComandaItemRepository.findOne.mockResolvedValue(itemExistente);
      mockComandaItemRepository.delete.mockResolvedValue({ affected: 1 });

      // Act
      const result = await service.remove(1, 10);

      // Assert
      expect(mockComandaItemRepository.findOne).toHaveBeenCalledWith({
        where: { id_comanda: 1, id_produto: 10 },
      });
      expect(mockComandaItemRepository.delete).toHaveBeenCalledWith({
        id_comanda: 1,
        id_produto: 10,
      });
      expect(result).toEqual({ id_comanda: 1, id_produto: 10 });
    });

    it('deve lançar NotFoundException ao remover item inexistente (Edge Case)', async () => {
      // Arrange
      mockComandaItemRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(999, 888)).rejects.toThrow(
        new NotFoundException(
          `Item da comanda 999 e produto 888 não encontrado`,
        ),
      );
    });
  });
});
