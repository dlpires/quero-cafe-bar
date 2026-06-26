import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  Patch,
  Post,
  Query,
  Req,
} from '@nestjs/common';
import type { Request } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { ProdutoService } from './produto.service';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { ListProdutoDto } from './dto/list-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { DeleteProdutoDto } from './dto/delete-produto.dto';
import { PaginatedResponse } from './dto/paginated-response.dto';
import { IProdutoOutput } from './interfaces/produto.interface';

@Controller('produto')
export class ProdutoController {
  constructor(private readonly produtoService: ProdutoService) {}

  @Post()
  @Roles(0)
  async create(
    @Body() createProdutoDto: CreateProdutoDto,
    @Req() request: Request,
  ): Promise<IProdutoOutput> {
    const decoded = (request as unknown as Record<string, unknown>).user as
      | { id: number }
      | undefined;
    return await this.produtoService.create(createProdutoDto, decoded);
  }

  @Get()
  @Roles(0, 1)
  async findAll(
    @Query() listProdutoDto: ListProdutoDto,
  ): Promise<PaginatedResponse<IProdutoOutput>> {
    return await this.produtoService.findAll(listProdutoDto);
  }

  @Get(':id')
  @Roles(0, 1)
  async findOne(@Param('id') id: number): Promise<IProdutoOutput> {
    return await this.produtoService.findOne(id);
  }

  @Patch(':id')
  @Roles(0)
  async update(
    @Param('id') id: number,
    @Body() updateProdutoDto: UpdateProdutoDto,
    @Req() request: Request,
  ): Promise<IProdutoOutput> {
    const decoded = (request as unknown as Record<string, unknown>).user as
      | { id: number }
      | undefined;
    return await this.produtoService.update(id, updateProdutoDto, decoded);
  }

  @Delete(':id')
  @Roles(0)
  async remove(
    @Param('id') id: number,
    @Req() request: Request,
  ): Promise<DeleteProdutoDto> {
    const decoded = (request as unknown as Record<string, unknown>).user as
      | { id: number }
      | undefined;
    return await this.produtoService.remove(id, decoded);
  }
}
