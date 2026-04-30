import { validate } from 'class-validator';
import { UpdateUsuarioDto } from './update-usuario.dto';

describe('UpdateUsuarioDto - Validação', () => {
  describe('Happy Path - Todos os campos opcionais', () => {
    it('deve aceitar atualização com id e nome (Happy Path)', async () => {
      const dto = new UpdateUsuarioDto();
      dto.id = 1;
      dto.nome = 'Nome Atualizado';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('deve aceitar atualização com id e senha (Happy Path)', async () => {
      const dto = new UpdateUsuarioDto();
      dto.id = 1;
      dto.senha = 'nova-senha-123';

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('deve aceitar atualização com id e perfil (Happy Path)', async () => {
      const dto = new UpdateUsuarioDto();
      dto.id = 1;
      dto.perfil = 1;

      const errors = await validate(dto);
      expect(errors).toHaveLength(0);
    });

    it('deve falhar sem o campo id obrigatório (Edge Case)', async () => {
      const dto = new UpdateUsuarioDto();
      dto.nome = 'Nome Atualizado';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('id');
    });
  });

  describe('Edge Cases - Validação de Tipos', () => {
    it('deve falhar se id não for int (Edge Case)', async () => {
      const dto = new UpdateUsuarioDto();
      (dto as any).id = 'um';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('deve falhar se nome não for string (Edge Case)', async () => {
      const dto = new UpdateUsuarioDto();
      dto.id = 1;
      (dto as any).nome = 123;

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });

    it('deve falhar se perfil não for int (Edge Case)', async () => {
      const dto = new UpdateUsuarioDto();
      dto.id = 1;
      (dto as any).perfil = 'admin';

      const errors = await validate(dto);
      expect(errors.length).toBeGreaterThan(0);
    });
  });
});
