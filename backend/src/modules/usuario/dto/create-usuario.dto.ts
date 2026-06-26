import { IsIn, IsInt, IsNotEmpty, IsOptional, IsString } from 'class-validator';

export class CreateUsuarioDto {
  @IsString()
  @IsNotEmpty()
  nome: string;

  @IsString()
  @IsNotEmpty()
  usuario: string;

  @IsString()
  @IsNotEmpty()
  senha: string;

  @IsInt()
  @IsOptional()
  @IsIn([0, 1, 2], {
    message: 'Perfil deve ser 0 (Administrador), 1 (Atendente) ou 2 (Cozinha)',
  })
  perfil?: number;
}
