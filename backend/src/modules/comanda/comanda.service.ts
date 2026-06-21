import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comanda } from './entities/comanda.entity';
import { CreateComandaDto } from './dto/create-comanda.dto';
import { ListComandaDto } from './dto/list-comanda.dto';
import { UpdateComandaDto } from './dto/update-comanda.dto';
import { DeleteComandaDto } from './dto/delete-comanda.dto';
import { PaginatedResponse } from '../produto/dto/paginated-response.dto';
import { IComandaOutput } from './interfaces/comanda.interface';
import { NotFoundException } from '@nestjs/common';

@Injectable()
export class ComandaService {
  constructor(
    @InjectRepository(Comanda)
    private readonly comandaRepository: Repository<Comanda>,
  ) {}

  async create(createComandaDto: CreateComandaDto): Promise<IComandaOutput> {
    const comanda = this.comandaRepository.create(createComandaDto);
    return await this.comandaRepository.save(comanda);
  }

  async findAll(
    listComandaDto: ListComandaDto,
  ): Promise<PaginatedResponse<IComandaOutput>> {
    const { skip, take, ...whereRaw } = listComandaDto;
    const where = Object.fromEntries(
      Object.entries(whereRaw).filter(([, v]) => v !== undefined),
    );
    const [data, total] = await this.comandaRepository.findAndCount({
      where,
      relations: ['mesa', 'itens', 'itens.produto'],
      skip,
      take,
    });
    return { data, total, skip: skip ?? 0, take: take ?? 20 };
  }

  async findOne(id: number): Promise<IComandaOutput> {
    const comanda = await this.comandaRepository.findOne({ where: { id } });
    if (!comanda) {
      throw new NotFoundException(`Comanda com ID ${id} não encontrada`);
    }
    return comanda;
  }

  async findOneByMesaId(id_mesa: number): Promise<IComandaOutput> {
    const comanda = await this.comandaRepository.findOne({
      where: { id_mesa },
    });
    if (!comanda) {
      throw new NotFoundException(
        `Comanda da Mesa com ID ${id_mesa} não encontrada`,
      );
    }
    return comanda;
  }

  async update(
    id: number,
    updateComandaDto: UpdateComandaDto,
  ): Promise<IComandaOutput> {
    const comanda = await this.findOne(id);
    const updatedComanda = Object.assign(comanda, updateComandaDto);
    return await this.comandaRepository.save(updatedComanda);
  }

  async remove(id: number): Promise<DeleteComandaDto> {
    await this.findOne(id);
    await this.comandaRepository.delete(id);
    return { id };
  }
}
