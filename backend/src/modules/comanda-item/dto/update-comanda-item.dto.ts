import { PartialType } from '@nestjs/mapped-types';
import { CreateComandaItemDto } from './create-comanda-item.dto';

export class UpdateComandaItemDto extends PartialType(CreateComandaItemDto) {}
