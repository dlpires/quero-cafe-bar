import { validate } from 'class-validator';
import { DeleteComandaDto } from './delete-comanda.dto';

describe('DeleteComandaDto', () => {
  it('deve aceitar id válido', async () => {
    const dto = new DeleteComandaDto();
    dto.id = 1;
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve rejeitar id não inteiro', async () => {
    const dto = new DeleteComandaDto();
    (dto as any).id = 'abc';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('deve rejeitar id vazio', async () => {
    const dto = new DeleteComandaDto();
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
