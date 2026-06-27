import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ComandaItem } from './entities/comanda-item.entity';
import { CreateComandaItemDto } from './dto/create-comanda-item.dto';
import { ListComandaItemDto } from './dto/list-comanda-item.dto';
import { UpdateComandaItemDto } from './dto/update-comanda-item.dto';
import { DeleteComandaItemDto } from './dto/delete-comanda-item.dto';
import { IComandaItemOutput } from './interfaces/comanda-item.interface';
import { Comanda } from '../comanda/entities/comanda.entity';

@Injectable()
export class ComandaItemService {
  constructor(
    @InjectRepository(ComandaItem)
    private readonly comandaItemRepository: Repository<ComandaItem>,
    @InjectRepository(Comanda)
    private readonly comandaRepository: Repository<Comanda>,
  ) {}

  async checkComandaOpen(id_comanda: number): Promise<void> {
    const comanda = await this.comandaRepository.findOne({
      where: { id: id_comanda },
    });
    if (!comanda) {
      throw new NotFoundException(
        `Comanda com ID ${id_comanda} não encontrada`,
      );
    }
    if (comanda.status === 'fechada') {
      throw new BadRequestException('Comanda já está fechada');
    }
  }

  async create(
    createComandaItemDto: CreateComandaItemDto,
  ): Promise<IComandaItemOutput> {
    await this.checkComandaOpen(createComandaItemDto.id_comanda);
    const comandaItem = this.comandaItemRepository.create(createComandaItemDto);
    return await this.comandaItemRepository.save(comandaItem);
  }

  async findAll(
    listComandaItemDto: ListComandaItemDto,
  ): Promise<IComandaItemOutput[]> {
    return await this.comandaItemRepository.find({
      where: listComandaItemDto,
      relations: ['produto'],
    });
  }

  async findOne(
    id_comanda: number,
    id_produto: number,
  ): Promise<IComandaItemOutput> {
    const comandaItem = await this.comandaItemRepository.findOne({
      where: { id_comanda, id_produto },
    });
    if (!comandaItem) {
      throw new NotFoundException(
        `Item da comanda ${id_comanda} e produto ${id_produto} não encontrado`,
      );
    }
    return comandaItem;
  }

  async update(
    id_comanda: number,
    id_produto: number,
    updateComandaItemDto: UpdateComandaItemDto,
  ): Promise<IComandaItemOutput> {
    await this.checkComandaOpen(id_comanda);
    const comandaItem = await this.findOne(id_comanda, id_produto);
    const updatedComandaItem = Object.assign(comandaItem, updateComandaItemDto);
    return await this.comandaItemRepository.save(updatedComandaItem);
  }

  async remove(
    id_comanda: number,
    id_produto: number,
  ): Promise<DeleteComandaItemDto> {
    await this.checkComandaOpen(id_comanda);
    await this.findOne(id_comanda, id_produto);
    await this.comandaItemRepository.delete({ id_comanda, id_produto });
    return { id_comanda, id_produto };
  }
}
