import { validate } from 'class-validator';
import { CreateMesaDto } from './create-mesa.dto';

describe('CreateMesaDto - Validação', () => {
  describe('Happy Path', () => {
    it('deve validar com qtd_cadeiras e status true (Happy Path)', async () => {
      const dto = new CreateMesaDto();
      dto.qtd_cadeiras = 4;
      dto.status = true;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('deve validar com qtd_cadeiras e status false (Happy Path)', async () => {
      const dto = new CreateMesaDto();
      dto.qtd_cadeiras = 6;
      dto.status = false;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('deve validar apenas com qtd_cadeiras (status opcional) (Happy Path)', async () => {
      const dto = new CreateMesaDto();
      dto.qtd_cadeiras = 2;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Edge Cases', () => {
    it('deve falhar se qtd_cadeiras não for fornecido (Edge Case)', async () => {
      const dto = new CreateMesaDto();

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('qtd_cadeiras');
    });

    it('deve falhar se qtd_cadeiras for menor que 1 (Edge Case)', async () => {
      const dto = new CreateMesaDto();
      dto.qtd_cadeiras = 0;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('deve falhar se qtd_cadeiras não for int (Edge Case)', async () => {
      const dto = new CreateMesaDto();
      (dto as any).qtd_cadeiras = 'quatro';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('deve falhar se status não for boolean (Edge Case)', async () => {
      const dto = new CreateMesaDto();
      dto.qtd_cadeiras = 4;
      (dto as any).status = 'true';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
