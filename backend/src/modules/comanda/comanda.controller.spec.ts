import { Test, TestingModule } from '@nestjs/testing';
import { ComandaController } from './comanda.controller';
import { ComandaService } from './comanda.service';

describe('ComandaController', () => {
  let controller: ComandaController;
  let service: ComandaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ComandaController],
      providers: [
        {
          provide: ComandaService,
          useValue: {
            // Defina aqui os métodos que o controller chama
            findOne: jest.fn().mockResolvedValue({
              id: 1,
              id_mesa: 1,
              obs_comanda: 'Teste',
              status: 'aberta',
            }),
            findOneByMesaId: jest.fn().mockResolvedValue({
              id: 1,
              id_mesa: 1,
              obs_comanda: 'Teste',
              status: 'aberta',
            }),
            create: jest.fn().mockResolvedValue({
              id: 1,
              id_mesa: 1,
              obs_comanda: 'Teste',
              status: 'aberta',
            }),
            update: jest.fn().mockResolvedValue({
              id: 1,
              id_mesa: 1,
              obs_comanda: 'Teste',
              status: 'aberta',
            }),
            remove: jest.fn().mockResolvedValue({ id: 1 }),
            findAll: jest.fn(),
          },
        },
      ],
    }).compile();

    controller = module.get<ComandaController>(ComandaController);
    service = module.get<ComandaService>(ComandaService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new comanda', async () => {
      const createDto = { id_mesa: 1, obs_comanda: 'Teste' };
      const result = {
        id: 1,
        id_mesa: 1,
        obs_comanda: 'Teste',
        status: 'aberta',
      };
      jest.spyOn(service, 'create').mockImplementation(async () => result);

      expect(await controller.create(createDto)).toBe(result);
      expect(service.create).toHaveBeenCalledWith(createDto);
    });
  });

  describe('findAll', () => {
    it('should return a paginated response of comandas', async () => {
      const result = {
        data: [{ id: 1, id_mesa: 1, obs_comanda: 'Teste', status: 'aberta' }],
        total: 1,
        skip: 0,
        take: 20,
      };
      const query = { id_mesa: 1 };
      jest.spyOn(service, 'findAll').mockImplementation(async () => result);

      expect(await controller.findAll(query)).toBe(result);
      expect(service.findAll).toHaveBeenCalledWith(query);
    });
  });

  describe('findOne', () => {
    it('should return a single comanda by id', async () => {
      const result = {
        id: 1,
        id_mesa: 1,
        obs_comanda: 'Teste',
        status: 'aberta',
      };
      jest.spyOn(service, 'findOne').mockImplementation(async () => result);

      expect(await controller.findOne(1)).toBe(result);
      expect(service.findOne).toHaveBeenCalledWith(1);
    });
  });

  describe('findOneByMesaId', () => {
    it('should return a comanda by mesa id', async () => {
      const result = {
        id: 1,
        id_mesa: 5,
        obs_comanda: 'Teste',
        status: 'aberta',
      };
      jest
        .spyOn(service, 'findOneByMesaId')
        .mockImplementation(async () => result);

      expect(await controller.findOneByMesaId(5)).toBe(result);
      expect(service.findOneByMesaId).toHaveBeenCalledWith(5);
    });
  });

  describe('update', () => {
    it('should update a comanda', async () => {
      const updateDto = { id_mesa: 1, obs_comanda: 'Teste' };
      const result = {
        id: 1,
        id_mesa: 1,
        obs_comanda: 'Teste',
        status: 'aberta',
      };
      jest.spyOn(service, 'update').mockImplementation(async () => result);

      expect(await controller.update(1, updateDto)).toBe(result);
      expect(service.update).toHaveBeenCalledWith(1, updateDto);
    });
  });

  describe('remove', () => {
    it('should remove a comanda', async () => {
      const result = { id: 1 };
      jest.spyOn(service, 'remove').mockImplementation(async () => result);

      expect(await controller.remove(1)).toBe(result);
      expect(service.remove).toHaveBeenCalledWith(1);
    });
  });
});
