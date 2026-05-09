import { Test, TestingModule } from '@nestjs/testing';
import { MesaController } from './mesa.controller';
import { MesaService } from './mesa.service';

describe('MesaController', () => {
  let controller: MesaController;
  let service: MesaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [MesaController],
      providers: [
        {
          provide: MesaService,
          useValue: {
            findOne: jest
              .fn()
              .mockResolvedValue({ id: 1, qtd_cadeiras: 4, status: true }),
            create: jest
              .fn()
              .mockResolvedValue({ id: 1, qtd_cadeiras: 4, status: true }),
            update: jest
              .fn()
              .mockResolvedValue({ id: 1, qtd_cadeiras: 6, status: true }),
            remove: jest.fn().mockResolvedValue({ id: 1 }),
            findAll: jest.fn().mockResolvedValue([]),
          },
        },
      ],
    }).compile();

    controller = module.get<MesaController>(MesaController);
    service = module.get<MesaService>(MesaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new mesa', async () => {
      const createMesaDto = {
        qtd_cadeiras: 4,
        status: true,
      };
      const result = { id: 1, ...createMesaDto };

      jest.spyOn(service, 'create').mockResolvedValue(result);

      expect(await controller.create(createMesaDto)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(createMesaDto);
    });
  });

  describe('findAll', () => {
    it('should return an array of mesas', async () => {
      const result = [{ id: 1, qtd_cadeiras: 4, status: true }];

      jest.spyOn(service, 'findAll').mockResolvedValue(result);

      expect(await controller.findAll({})).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith({});
    });
  });

  describe('findOne', () => {
    it('should return a single mesa', async () => {
      const result = { id: 1, qtd_cadeiras: 4, status: true };

      jest.spyOn(service, 'findOne').mockResolvedValue(result);

      expect(await controller.findOne(1)).toBe(result);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('update', () => {
    it('should update a mesa', async () => {
      const updateMesaDto = { id: 1, qtd_cadeiras: 6 };
      const result = { id: 1, qtd_cadeiras: 6, status: true };

      jest.spyOn(service, 'update').mockResolvedValue(result);

      expect(await controller.update(1, updateMesaDto)).toBe(result);
      expect(service.update).toHaveBeenCalledWith(1, updateMesaDto);
    });
  });

  describe('remove', () => {
    it('should remove a mesa', async () => {
      const result = { id: 1 };

      jest.spyOn(service, 'remove').mockResolvedValue(result);

      expect(await controller.remove(1)).toBe(result);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
