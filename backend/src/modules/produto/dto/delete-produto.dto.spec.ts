import { validate } from 'class-validator';
import { DeleteProdutoDto } from './delete-produto.dto';

describe('DeleteProdutoDto', () => {
  it('deve aceitar id válido', async () => {
    const dto = new DeleteProdutoDto();
    dto.id = 1;
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve rejeitar id não inteiro', async () => {
    const dto = new DeleteProdutoDto();
    (dto as any).id = 'abc';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('deve rejeitar id vazio', async () => {
    const dto = new DeleteProdutoDto();
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
