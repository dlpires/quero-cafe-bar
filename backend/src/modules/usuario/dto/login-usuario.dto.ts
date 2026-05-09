import { IsNotEmpty, IsString } from 'class-validator';

export class LoginUsuarioDto {
  @IsString()
  @IsNotEmpty()
  username: string;

  @IsString()
  @IsNotEmpty()
  password: string;
}
