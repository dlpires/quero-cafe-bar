import { validate } from 'class-validator';
import { DeleteUsuarioDto } from './delete-usuario.dto';

describe('DeleteUsuarioDto', () => {
  it('deve aceitar id válido', async () => {
    const dto = new DeleteUsuarioDto();
    dto.id = 1;
    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('deve rejeitar id não inteiro', async () => {
    const dto = new DeleteUsuarioDto();
    (dto as any).id = 'abc';
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('deve rejeitar id vazio', async () => {
    const dto = new DeleteUsuarioDto();
    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
