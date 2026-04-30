import { Test, TestingModule } from '@nestjs/testing';
import { ComandaItemController } from './comanda-item.controller';
import { ComandaItemService } from './comanda-item.service';

describe('ComandaItemController', () => {
  let controller: ComandaItemController;
  let service: ComandaItemService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComandaItemController],
      providers: [
        {
          provide: ComandaItemService,
          useValue: {
            findOne: jest.fn().mockResolvedValue({ id_comanda: 1, id_produto: 1, qtd_item: 2, valor_venda: 10.5, statusPg: false, statusEntrega: false }),
            create: jest.fn().mockResolvedValue({ id_comanda: 1, id_produto: 1, qtd_item: 2, valor_venda: 10.5, statusPg: false, statusEntrega: false }),
            update: jest.fn().mockResolvedValue({ id_comanda: 1, id_produto: 1, qtd_item: 2, valor_venda: 10.5, statusPg: false, statusEntrega: false }),
            remove: jest.fn().mockResolvedValue({ id_comanda: 1, id_produto: 1 }),
            findAll: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    controller = module.get<ComandaItemController>(ComandaItemController);
    service = module.get<ComandaItemService>(ComandaItemService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a comanda item', async () => {
      const dto = { id_comanda: 1, id_produto: 1, qtd_item: 2, valor_venda: 10.5 };
      const result = { ...dto, statusPg: false, statusEntrega: false };
      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(dto)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(dto);
    });
  });

  describe('findAll', () => {
    it('should return an array of comanda items', async () => {
      const result = [{ id_comanda: 1, id_produto: 1, qtd_item: 2, valor_venda: 10.5, statusPg: false, statusEntrega: false }];
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll({})).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a single comanda item', async () => {
      const result = { id_comanda: 1, id_produto: 1, qtd_item: 2, valor_venda: 10.5, statusPg: false, statusEntrega: false };
      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne(1, 1)).toBe(result);
      expect(service.findOne).toHaveBeenCalledWith(1, 1);
    });
  });

  describe('findByComanda', () => {
    it('should return items for a specific comanda', async () => {
      const result = [{ id_comanda: 1, id_produto: 1, qtd_item: 2, valor_venda: 10.5, statusPg: false, statusEntrega: false }];
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findByComanda(1)).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith({ id_comanda: 1 });
    });
  });

  describe('findByComandaPaga', () => {
    it('should return paid items for a specific comanda', async () => {
      const result = [{ id_comanda: 1, id_produto: 1, qtd_item: 2, valor_venda: 10.5, statusPg: true, statusEntrega: false }];
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findByComandaPaga(1, true)).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith({ id_comanda: 1, statusPg: true });
    });
  });

  describe('findByComandaEntrega', () => {
    it('should return delivery items for a specific comanda', async () => {
      const result = [{ id_comanda: 1, id_produto: 1, qtd_item: 2, valor_venda: 10.5, statusPg: false, statusEntrega: true }];
      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findByComandaEntrega(1, true)).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith({ id_comanda: 1, statusEntrega: true });
    });
  });

  describe('update', () => {
    it('should update a comanda item', async () => {
      const updateDto = { id_comanda: 1, id_produto: 1, qtd_item: 5 };
      const result = { id_comanda: 1, id_produto: 1, qtd_item: 5, valor_venda: 10.5, statusPg: false, statusEntrega: false };
      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(await controller.update(1, 1, updateDto)).toBe(result);
      expect(service.update).toHaveBeenCalledWith(1, 1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a comanda item', async () => {
      const result = { id_comanda: 1, id_produto: 1 };
      jest.spyOn(service, 'remove').mockResolvedValue(result);

      expect(await controller.remove(1, 1)).toBe(result);
      expect(service.remove).toHaveBeenCalledWith(1, 1);
    });
  });
});
