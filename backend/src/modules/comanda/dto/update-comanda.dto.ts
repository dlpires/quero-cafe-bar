import { PartialType } from '@nestjs/mapped-types';
import { IsIn, IsOptional, IsString } from 'class-validator';
import { CreateComandaDto } from './create-comanda.dto';

export class UpdateComandaDto extends PartialType(CreateComandaDto) {
  @IsString()
  @IsOptional()
  @IsIn(['aberta', 'fechada'])
  status?: string;
}
