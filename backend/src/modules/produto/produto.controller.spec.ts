import { Test, TestingModule } from '@nestjs/testing';
import { ProdutoController } from './produto.controller';
import { ProdutoService } from './produto.service';

describe('ProdutoController', () => {
  let controller: ProdutoController;
  let service: ProdutoService;

  const mockRequest = { user: { id: 1 } } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ProdutoController],
      providers: [
        {
          provide: ProdutoService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({
              id: 1,
              dsc_produto: 'Café',
              valor_unit: 5.0,
              status: true,
            }),
            create: jest.fn().mockResolvedValue({
              id: 1,
              dsc_produto: 'Café',
              valor_unit: 5.0,
              status: true,
            }),
            update: jest.fn().mockResolvedValue({
              id: 1,
              dsc_produto: 'Café Alterado',
              valor_unit: 5.0,
              status: true,
            }),
            remove: jest.fn().mockResolvedValue({ id: 1 }),
            findAll: jest
              .fn()
              .mockResolvedValue({ data: [], total: 0, skip: 0, take: 20 }),
          },
        },
      ],
    }).compile();

    controller = module.get<ProdutoController>(ProdutoController);
    service = module.get<ProdutoService>(ProdutoService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new produto', async () => {
      const createProdutoDto = {
        dsc_produto: 'Café Expresso',
        valor_unit: 5.5,
        status: true,
      };
      const result = { id: 1, ...createProdutoDto };

      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(createProdutoDto, mockRequest)).toBe(
        result,
      );
      expect(service.create).toHaveBeenCalledWith(createProdutoDto, { id: 1 });
    });
  });

  describe('findAll', () => {
    it('should return a paginated response of produtos', async () => {
      const result = {
        data: [{ id: 1, dsc_produto: 'Café', valor_unit: 5.0, status: true }],
        total: 1,
        skip: 0,
        take: 20,
      };

      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll({})).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a single produto', async () => {
      const result = {
        id: 1,
        dsc_produto: 'Café',
        valor_unit: 5.0,
        status: true,
      };

      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne(1)).toBe(result);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a produto', async () => {
      const updateProdutoDto = { dsc_produto: 'Café Alterado' };
      const result = {
        id: 1,
        dsc_produto: 'Café Alterado',
        valor_unit: 5.0,
        status: true,
      };

      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(await controller.update(1, updateProdutoDto, mockRequest)).toBe(
        result,
      );
      expect(service.update).toHaveBeenCalledWith(1, updateProdutoDto, {
        id: 1,
      });
    });
  });

  describe('remove', () => {
    it('should remove a produto', async () => {
      const result = { id: 1 };

      jest.spyOn(service, 'remove').mockResolvedValue(result);

      expect(await controller.remove(1, mockRequest)).toBe(result);
      expect(service.remove).toHaveBeenCalledWith(1, { id: 1 });
    });
  });
});
