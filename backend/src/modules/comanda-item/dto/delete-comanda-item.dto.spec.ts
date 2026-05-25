import { validate } from 'class-validator';
import { DeleteComandaItemDto } from './delete-comanda-item.dto';

describe('DeleteComandaItemDto', () => {
  it('deve aceitar id_comanda e id_produto válidos', async () => {
    const dto = new DeleteComandaItemDto();
    dto.id_comanda = 1;
    dto.id_produto = 2;
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve rejeitar id_comanda não inteiro', async () => {
    const dto = new DeleteComandaItemDto();
    (dto as any).id_comanda = 'abc';
    dto.id_produto = 1;
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('deve rejeitar id_produto não inteiro', async () => {
    const dto = new DeleteComandaItemDto();
    dto.id_comanda = 1;
    (dto as any).id_produto = 'xyz';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('deve rejeitar quando campos são vazios', async () => {
    const dto = new DeleteComandaItemDto();
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
