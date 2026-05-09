import { validate } from 'class-validator';
import { UpdateUsuarioDto } from './update-usuario.dto';

describe('UpdateUsuarioDto - Validação', () => {
  describe('Happy Path - Todos os campos opcionais', () => {
    it('deve aceitar atualização com nome (Happy Path)', async () => {
      const dto = new UpdateUsuarioDto();
      dto.nome = 'Nome Atualizado';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('deve aceitar atualização com senha (Happy Path)', async () => {
      const dto = new UpdateUsuarioDto();
      dto.senha = 'nova-senha-123';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('deve aceitar atualização com perfil (Happy Path)', async () => {
      const dto = new UpdateUsuarioDto();
      dto.perfil = 1;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('deve aceitar DTO vazio (todos opcionais via PartialType)', async () => {
      const dto = new UpdateUsuarioDto();

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });
  });

  describe('Edge Cases - Validação de Tipos', () => {
    it('deve falhar se nome não for string (Edge Case)', async () => {
      const dto = new UpdateUsuarioDto();
      (dto as any).nome = 123;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('deve falhar se perfil não for int (Edge Case)', async () => {
      const dto = new UpdateUsuarioDto();
      (dto as any).perfil = 'admin';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('deve falhar se senha não for string (Edge Case)', async () => {
      const dto = new UpdateUsuarioDto();
      (dto as any).senha = 12345;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
