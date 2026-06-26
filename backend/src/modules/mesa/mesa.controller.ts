import { Controller, ConflictException, Req } from '@nestjs/common';
import type { Request } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { MesaService } from './mesa.service';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { ListMesaDto } from './dto/list-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';
import { DeleteMesaDto } from './dto/delete-mesa.dto';
import { PaginatedResponse } from '../produto/dto/paginated-response.dto';
import { IMesaOutput } from './interfaces/mesa.interface';
import { Body, Get, Param, Patch, Post, Query, Delete } from '@nestjs/common';

@Controller('mesa')
export class MesaController {
  constructor(private readonly mesaService: MesaService) {}

  @Post()
  @Roles(0)
  async create(
    @Body() createMesaDto: CreateMesaDto,
    @Req() request: Request,
  ): Promise<IMesaOutput> {
    const decoded = (request as unknown as Record<string, unknown>).user as
      | { id: number }
      | undefined;
    return await this.mesaService.create(createMesaDto, decoded);
  }

  @Get()
  @Roles(0, 1)
  async findAll(
    @Query() listMesaDto: ListMesaDto,
  ): Promise<PaginatedResponse<IMesaOutput>> {
    return await this.mesaService.findAll(listMesaDto);
  }

  @Get(':id')
  @Roles(0, 1)
  async findOne(@Param('id') id: number): Promise<IMesaOutput> {
    return await this.mesaService.findOne(id);
  }

  @Patch(':id')
  @Roles(0)
  async update(
    @Param('id') id: number,
    @Body() updateMesaDto: UpdateMesaDto,
    @Req() request: Request,
  ): Promise<IMesaOutput> {
    const decoded = (request as unknown as Record<string, unknown>).user as
      | { id: number }
      | undefined;
    return await this.mesaService.update(id, updateMesaDto, decoded);
  }

  @Delete(':id')
  @Roles(0)
  async remove(
    @Param('id') id: number,
    @Req() request: Request,
  ): Promise<DeleteMesaDto> {
    const decoded = (request as unknown as Record<string, unknown>).user as
      | { id: number }
      | undefined;
    try {
      return await this.mesaService.remove(id, decoded);
    } catch (error: unknown) {
      if (
        typeof error === 'object' &&
        error !== null &&
        'code' in error &&
        (error as Record<string, unknown>).code === 'ER_ROW_IS_REFERENCED_2'
      ) {
        throw new ConflictException(
          'Não é possível excluir a mesa pois existem comandas vinculadas a ela',
        );
      }
      throw error;
    }
  }
}
