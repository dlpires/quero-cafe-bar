import { validate } from 'class-validator';
import { DeleteMesaDto } from './delete-mesa.dto';

describe('DeleteMesaDto', () => {
  it('deve aceitar id válido', async () => {
    const dto = new DeleteMesaDto();
    dto.id = 1;
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve rejeitar id não inteiro', async () => {
    const dto = new DeleteMesaDto();
    (dto as any).id = 'abc';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('deve rejeitar id vazio', async () => {
    const dto = new DeleteMesaDto();
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
