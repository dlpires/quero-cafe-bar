import { Injectable, BadRequestException } from '@nestjs/common';
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
    const comanda = await this.comandaRepository.findOne({
      where: { id },
      relations: ['mesa', 'itens', 'itens.produto'],
    });
    if (!comanda) {
      throw new NotFoundException(`Comanda com ID ${id} não encontrada`);
    }
    return comanda;
  }

  async findOneByMesaId(id_mesa: number): Promise<IComandaOutput> {
    const comanda = await this.comandaRepository.findOne({
      where: { id_mesa, status: 'aberta' },
      relations: ['mesa', 'itens', 'itens.produto'],
      order: { id: 'DESC' },
    });
    if (!comanda) {
      throw new NotFoundException(
        `Nenhuma comanda ativa encontrada para a Mesa ${id_mesa}`,
      );
    }
    return comanda;
  }

  async update(
    id: number,
    updateComandaDto: UpdateComandaDto,
  ): Promise<IComandaOutput> {
    const comanda = await this.findOne(id);

    if (comanda.status === 'fechada') {
      throw new BadRequestException('Comanda já está fechada');
    }

    if (updateComandaDto.status === 'aberta' && comanda.status === 'fechada') {
      throw new BadRequestException(
        'Não é possível reabrir uma comanda fechada',
      );
    }

    if (updateComandaDto.status === 'fechada') {
      Object.assign(comanda, { status: 'fechada' });
      return await this.comandaRepository.save(comanda);
    }

    const updatedComanda = Object.assign(comanda, updateComandaDto);
    return await this.comandaRepository.save(updatedComanda);
  }

  async remove(id: number): Promise<DeleteComandaDto> {
    await this.findOne(id);
    await this.comandaRepository.delete(id);
    return { id };
  }
}
