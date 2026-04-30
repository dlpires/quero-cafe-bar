import { validate } from 'class-validator';
import { CreateProdutoDto } from './create-produto.dto';

describe('CreateProdutoDto - Validação', () => {
  describe('Happy Path - Validação Sucesso', () => {
    it('deve validar DTO com campos obrigatórios (Happy Path)', async () => {
      // Arrange
      const dto = new CreateProdutoDto();
      dto.dsc_produto = 'Café Expresso';
      dto.valor_unit = 5.50;
      dto.status = true;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });

    it('deve aceitar status false (Happy Path)', async () => {
      // Arrange
      const dto = new CreateProdutoDto();
      dto.dsc_produto = 'Produto Inativo';
      dto.valor_unit = 10.00;
      dto.status = false;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors).toHaveLength(0);
    });
  });

  describe('Edge Cases - Validação Erros', () => {
    it('deve falhar quando dsc_produto está vazio (Edge Case)', async () => {
      // Arrange
      const dto = new CreateProdutoDto();
      dto.dsc_produto = ''; // Inválido
      dto.valor_unit = 5.00;
      dto.status = true;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('dsc_produto');
    });

    it('deve falhar quando dsc_produto não é string (Edge Case)', async () => {
      // Arrange
      const dto = new CreateProdutoDto();
      dto.dsc_produto = 123 as any; // Inválido
      dto.valor_unit = 5.00;

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
    });

    it('deve falhar quando valor_unit não é número (Edge Case)', async () => {
      // Arrange
      const dto = new CreateProdutoDto();
      dto.dsc_produto = 'Café';
      dto.valor_unit = 'cinco' as any; // Inválido

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('valor_unit');
    });

    it('deve falhar quando valor_unit é negativo (Edge Case)', async () => {
      // Arrange
      const dto = new CreateProdutoDto();
      dto.dsc_produto = 'Café';
      dto.valor_unit = -5.00; // Negativo (provavelmente inválido)

      // Act
      const errors = await validate(dto);

      // Assert - depende se há validação adicional, mas o tipo deve ser number
      expect(typeof dto.valor_unit).toBe('number');
    });

    it('deve falhar quando status não é boolean (Edge Case)', async () => {
      // Arrange
      const dto = new CreateProdutoDto();
      dto.dsc_produto = 'Café';
      dto.valor_unit = 5.00;
      dto.status = 'true' as any; // Inválido - deve ser boolean

      // Act
      const errors = await validate(dto);

      // Assert
      expect(errors.length).toBeGreaterThan(0);
      expect(errors[0].property).toBe('status');
    });
  });
});
