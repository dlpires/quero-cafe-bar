import { validate } from 'class-validator';
import { CreateComandaDto } from './create-comanda.dto';

describe('CreateComandaDto - Validação', () => {
  describe('Happy Path', () => {
    it('deve validar com id_mesa (Happy Path)', async () => {
      const dto = new CreateComandaDto();
      dto.id_mesa = 1;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('deve falhar se id_mesa não for fornecido (Edge Case)', async () => {
      const dto = new CreateComandaDto();

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('id_mesa');
    });

    it('deve falhar se id_mesa não for number (Edge Case)', async () => {
      const dto = new CreateComandaDto();
      (dto as any).id_mesa = 'um';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
