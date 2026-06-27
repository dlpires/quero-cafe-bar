import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Mesa } from './entities/mesa.entity';
import { Comanda } from '../comanda/entities/comanda.entity';
import { CreateMesaDto } from './dto/create-mesa.dto';
import { ListMesaDto } from './dto/list-mesa.dto';
import { UpdateMesaDto } from './dto/update-mesa.dto';
import { DeleteMesaDto } from './dto/delete-mesa.dto';
import { PaginatedResponse } from '../produto/dto/paginated-response.dto';
import { IMesaOutput } from './interfaces/mesa.interface';
import { NotFoundException } from '@nestjs/common';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class MesaService {
  constructor(
    @InjectRepository(Mesa)
    private readonly mesaRepository: Repository<Mesa>,
    private readonly auditService: AuditService,
  ) {}

  async create(
    createMesaDto: CreateMesaDto,
    authenticatedUser?: { id: number },
  ): Promise<IMesaOutput> {
    const mesa = this.mesaRepository.create(createMesaDto);
    const result = await this.mesaRepository.save(mesa);
    if (authenticatedUser) {
      await this.auditService.log(
        authenticatedUser.id,
        'CREATE',
        'mesa',
        result.id,
        { qtd_cadeiras: createMesaDto.qtd_cadeiras },
      );
    }
    return result;
  }

  async findAll(
    listMesaDto: ListMesaDto,
  ): Promise<PaginatedResponse<IMesaOutput>> {
    const { skip, take, ...whereRaw } = listMesaDto;
    const where = Object.fromEntries(
      Object.entries(whereRaw).filter(([, v]) => v !== undefined),
    );
    const [data, total] = await this.mesaRepository.findAndCount({
      where,
      skip,
      take,
    });

    if (data.length === 0) {
      return { data: [], total, skip: skip ?? 0, take: take ?? 20 };
    }

    const mesaIds = data.map((m) => m.id);
    const activeComandas = await this.mesaRepository.manager
      .getRepository(Comanda)
      .createQueryBuilder('c')
      .select('DISTINCT c.id_mesa')
      .where('c.id_mesa IN (:...mesaIds)', { mesaIds })
      .andWhere("c.status = 'aberta'")
      .getRawMany();

    const activeMesaIdSet = new Set(
      activeComandas.map((r) => Number(r.id_mesa)),
    );

    const result = data.map((mesa) => ({
      ...mesa,
      hasActiveComanda: activeMesaIdSet.has(mesa.id),
    }));

    return { data: result, total, skip: skip ?? 0, take: take ?? 20 };
  }

  async findOne(id: number): Promise<IMesaOutput> {
    const mesa = await this.mesaRepository.findOne({ where: { id } });
    if (!mesa) {
      throw new NotFoundException(`Mesa com ID ${id} não encontrada`);
    }
    return mesa;
  }

  async update(
    id: number,
    updateMesaDto: UpdateMesaDto,
    authenticatedUser?: { id: number },
  ): Promise<IMesaOutput> {
    const mesa = await this.findOne(id);
    const updatedMesa = Object.assign(mesa, updateMesaDto);
    const result = await this.mesaRepository.save(updatedMesa);
    if (authenticatedUser) {
      const details: Record<string, unknown> = {};
      if (updateMesaDto.qtd_cadeiras !== undefined)
        details.qtd_cadeiras = updateMesaDto.qtd_cadeiras;
      if (updateMesaDto.status !== undefined)
        details.status = updateMesaDto.status;
      await this.auditService.log(
        authenticatedUser.id,
        'UPDATE',
        'mesa',
        id,
        Object.keys(details).length > 0 ? details : undefined,
      );
    }
    return result;
  }

  async remove(
    id: number,
    authenticatedUser?: { id: number },
  ): Promise<DeleteMesaDto> {
    const mesa = await this.findOne(id);
    await this.mesaRepository.delete(id);
    if (authenticatedUser) {
      await this.auditService.log(authenticatedUser.id, 'DELETE', 'mesa', id, {
        qtd_cadeiras: mesa.qtd_cadeiras,
      });
    }
    return { id };
  }
}
