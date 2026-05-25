import { PartialType } from '@nestjs/mapped-types';
import { CreateProdutoDto } from './create-produto.dto';
import { IUpdateProdutoInput } from '../interfaces/produto.interface';

export class UpdateProdutoDto
  extends PartialType(CreateProdutoDto)
  implements IUpdateProdutoInput {}
