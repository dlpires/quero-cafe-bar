import { Controller, ConflictException } from '@nestjs/common';
import { Roles } from '../../common/decorators/roles.decorator';
import { ComandaService } from './comanda.service';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { ListComandaDto } from './dto/list-comanda.dto';
import { UpdateComandaDto } from './dto/update-comanda.dto';
import { DeleteComandaDto } from './dto/delete-comanda.dto';
import { PaginatedResponse } from '../produto/dto/paginated-response.dto';
import { IComandaOutput } from './interfaces/comanda.interface';
import { Body, Delete, Get, Param, Patch, Post, Query } from '@nestjs/common';

@Controller('comanda')
export class ComandaController {
  constructor(private readonly comandaService: ComandaService) {}

  @Post()
  @Roles(0, 1)
  async create(
    @Body() createComandaDto: CreateComandaDto,
  ): Promise<IComandaOutput> {
    return await this.comandaService.create(createComandaDto);
  }

  @Get()
  @Roles(0, 1, 2)
  async findAll(
    @Query() listComandaDto: ListComandaDto,
  ): Promise<PaginatedResponse<IComandaOutput>> {
    return await this.comandaService.findAll(listComandaDto);
  }

  @Get(':id')
  @Roles(0, 1, 2)
  async findOne(@Param('id') id: number): Promise<IComandaOutput> {
    return await this.comandaService.findOne(id);
  }

  @Get('mesa/:id_mesa')
  @Roles(0, 1, 2)
  async findOneByMesaId(
    @Param('id_mesa') id_mesa: number,
  ): Promise<IComandaOutput> {
    return await this.comandaService.findOneByMesaId(id_mesa);
  }

  @Patch(':id')
  @Roles(0, 1)
  async update(
    @Param('id') id: number,
    @Body() updateComandaDto: UpdateComandaDto,
  ): Promise<IComandaOutput> {
    return await this.comandaService.update(id, updateComandaDto);
  }

  @Delete(':id')
  @Roles(0)
  async remove(@Param('id') id: number): Promise<DeleteComandaDto> {
    try {
      return await this.comandaService.remove(id);
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as Record<string, unknown>).code === 'ER_ROW_IS_REFERENCED_2'
      ) {
        throw new ConflictException(
          'Não é possível excluir a comanda pois existem itens vinculados a ela',
        );
      }
      throw error;
    }
  }
}
