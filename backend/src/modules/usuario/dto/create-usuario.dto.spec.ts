import { validate } from 'class-validator';
import { CreateUsuarioDto } from './create-usuario.dto';

describe('CreateUsuarioDto - Validação', () => {
  describe('Happy Path - Validação Sucesso', () => {
    it('deve validar DTO com todos os campos obrigatórios (Happy Path)', async () => {
      // Arrange
      const dto = new CreateUsuarioDto();
      dto.nome = 'João Silva';
      dto.usuario = 'joao.silva';
      dto.senha = 'senha123';
      dto.perfil = 1;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('deve aceitar perfil opcional (Happy Path)', async () => {
      // Arrange
      const dto = new CreateUsuarioDto();
      dto.nome = 'Maria Santos';
      dto.usuario = 'maria.santos';
      dto.senha = 'senha456';
      // perfil é opcional

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('deve aceitar perfil 0 (Admin) (Happy Path)', async () => {
      // Arrange
      const dto = new CreateUsuarioDto();
      dto.nome = 'Admin';
      dto.usuario = 'admin';
      dto.senha = 'admin123';
      dto.perfil = 0;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });
  });

  describe('Edge Cases - Validação Erros', () => {
    it('deve falhar quando nome está vazio (Edge Case)', async () => {
      // Arrange
      const dto = new CreateUsuarioDto();
      dto.nome = ''; // Inválido
      dto.usuario = 'joao';
      dto.senha = 'senha123';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('nome');
    });

    it('deve falhar quando nome não é string (Edge Case)', async () => {
      // Arrange
      const dto = new CreateUsuarioDto();
      dto.nome = 123 as any; // Inválido
      dto.usuario = 'joao';
      dto.senha = 'senha123';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].constraints).toHaveProperty('isString');
    });

    it('deve falhar quando usuário não é fornecido (Edge Case)', async () => {
      // Arrange
      const dto = new CreateUsuarioDto();
      dto.nome = 'João';
      dto.usuario = ''; // Inválido
      dto.senha = 'senha123';

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('usuario');
    });

    it('deve falhar quando senha não é fornecida (Edge Case)', async () => {
      // Arrange
      const dto = new CreateUsuarioDto();
      dto.nome = 'João';
      dto.usuario = 'joao';
      dto.senha = ''; // Inválido

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('senha');
    });

    it('deve falhar quando perfil não é inteiro (Edge Case)', async () => {
      // Arrange
      const dto = new CreateUsuarioDto();
      dto.nome = 'João';
      dto.usuario = 'joao';
      dto.senha = 'senha123';
      dto.perfil = 'admin' as any; // Inválido - deve ser int

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('perfil');
    });
  });
});
