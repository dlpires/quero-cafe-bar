import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ProdutoService } from './produto.service';
import { Produto } from './entities/produto.entity';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { ListProdutoDto } from './dto/list-produto.dto';
import { NotFoundException } from '@nestjs/common';

describe('ProdutoService', () => {
  let service: ProdutoService;
  let mockRepository: jest.Mocked<Repository<Produto>>;

  const mockProdutoRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ProdutoService,
        {
          provide: getRepositoryToken(Produto),
          useValue: mockProdutoRepository,
        },
      ],
    }).compile();

    service = module.get<ProdutoService>(ProdutoService);
    mockRepository = module.get(getRepositoryToken(Produto));
    jest.clearAllMocks();
  });

  describe('Criação de Produto', () => {
    it('deve criar um produto com sucesso (Happy Path)', async () => {
      // Arrange
      const createProdutoDto: CreateProdutoDto = {
        dsc_produto: 'Café Expresso',
        valor_unit: 5.5,
        status: true,
      };

      const produtoCriado = {
        id: 1,
        ...createProdutoDto,
      } as unknown as Produto;
      mockProdutoRepository.create.mockReturnValue(produtoCriado);
      mockProdutoRepository.save.mockResolvedValue(produtoCriado);

      // Act
      const result = await service.create(createProdutoDto);

      // Assert
      expect(mockProdutoRepository.create).toHaveBeenCalledWith(
        createProdutoDto,
      );
      expect(mockProdutoRepository.save).toHaveBeenCalledWith(produtoCriado);
      expect(result).toEqual(produtoCriado);
      expect(result.dsc_produto).toBe('Café Expresso');
      expect((result as any).valor_unit).toBe(5.5);
    });
  });

  describe('Listagem de Produtos', () => {
    it('deve retornar todos os produtos (Happy Path)', async () => {
      // Arrange
      const produtosMock = [
        { id: 1, dsc_produto: 'Café', valor_unit: 5.0, status: true },
        { id: 2, dsc_produto: 'Pão', valor_unit: 3.5, status: true },
      ];

      const listProdutoDto: ListProdutoDto = {};
      mockProdutoRepository.find.mockResolvedValue(produtosMock);

      // Act
      const result = await service.findAll(listProdutoDto);

      // Assert
      expect(mockProdutoRepository.find).toHaveBeenCalledWith({
        where: listProdutoDto,
      });
      expect(result).toEqual(produtosMock);
      expect(result).toHaveLength(2);
    });

    it('deve filtrar produtos por id (Edge Case)', async () => {
      // Arrange
      const produtosFiltrados = [
        { id: 1, dsc_produto: 'Café', valor_unit: 5.0, status: true },
      ];

      const listProdutoDto: ListProdutoDto = { id: 1 };
      mockProdutoRepository.find.mockResolvedValue(produtosFiltrados);

      // Act
      const result = await service.findAll(listProdutoDto);

      // Assert
      expect(mockProdutoRepository.find).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toHaveLength(1);
    });
  });

  describe('Busca de Produto por ID', () => {
    it('deve retornar produto quando ID existe (Happy Path)', async () => {
      // Arrange
      const produtoMock = {
        id: 1,
        dsc_produto: 'Café Expresso',
        valor_unit: 5.5,
        status: true,
      } as unknown as Produto;

      mockProdutoRepository.findOne.mockResolvedValue(produtoMock);

      // Act
      const result = await service.findOne(1);

      // Assert
      expect(mockProdutoRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(result).toEqual(produtoMock);
    });

    it('deve lançar NotFoundException quando produto não encontrado (Edge Case)', async () => {
      // Arrange
      mockProdutoRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.findOne(999)).rejects.toThrow(
        new NotFoundException(`Produto com ID 999 não encontrado`),
      );
    });
  });

  describe('Atualização de Produto', () => {
    it('deve atualizar produto com sucesso (Happy Path)', async () => {
      // Arrange
      const produtoExistente = {
        id: 1,
        dsc_produto: 'Café',
        valor_unit: 5.0,
        status: true,
      };

      const updateProdutoDto = {
        id: 1,
        dsc_produto: 'Café Expresso Premium',
        valor_unit: 6.5,
      };

      const produtoAtualizado = { ...produtoExistente, ...updateProdutoDto };
      mockProdutoRepository.findOne.mockResolvedValue(produtoExistente);
      mockProdutoRepository.save.mockResolvedValue(produtoAtualizado);

      // Act
      const result = await service.update(1, updateProdutoDto);

      // Assert
      expect(mockProdutoRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockProdutoRepository.save).toHaveBeenCalledWith(
        expect.objectContaining(updateProdutoDto),
      );
      expect(result.dsc_produto).toBe('Café Expresso Premium');
      expect(result.valor_unit).toBe(6.5);
    });

    it('deve lançar NotFoundException ao atualizar produto inexistente (Edge Case)', async () => {
      // Arrange
      mockProdutoRepository.findOne.mockResolvedValue(null);

      const updateDto = { id: 999, dsc_produto: 'Teste' };

      // Act & Assert
      await expect(service.update(999, updateDto)).rejects.toThrow(
        new NotFoundException(`Produto com ID 999 não encontrado`),
      );
    });
  });

  describe('Remoção de Produto', () => {
    it('deve remover produto com sucesso (Happy Path)', async () => {
      // Arrange
      const produtoExistente = {
        id: 1,
        dsc_produto: 'Café',
      };

      mockProdutoRepository.findOne.mockResolvedValue(produtoExistente);
      mockProdutoRepository.delete.mockResolvedValue({ affected: 1 });

      // Act
      const result = await service.remove(1);

      // Assert
      expect(mockProdutoRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
      });
      expect(mockProdutoRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toEqual({ id: 1 });
    });

    it('deve lançar NotFoundException ao remover produto inexistente (Edge Case)', async () => {
      // Arrange
      mockProdutoRepository.findOne.mockResolvedValue(null);

      // Act & Assert
      await expect(service.remove(999)).rejects.toThrow(
        new NotFoundException(`Produto com ID 999 não encontrado`),
      );
    });
  });
});
