import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Produto } from './entities/produto.entity';
import { CreateProdutoDto } from './dto/create-produto.dto';
import { ListProdutoDto } from './dto/list-produto.dto';
import { UpdateProdutoDto } from './dto/update-produto.dto';
import { DeleteProdutoDto } from './dto/delete-produto.dto';
import { PaginatedResponse } from './dto/paginated-response.dto';
import { IProdutoOutput } from './interfaces/produto.interface';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class ProdutoService {
  constructor(
    @InjectRepository(Produto)
    private readonly produtoRepository: Repository<Produto>,
    private readonly auditService: AuditService,
  ) {}

  async create(
    createProdutoDto: CreateProdutoDto,
    authenticatedUser?: { id: number },
  ): Promise<IProdutoOutput> {
    const existing = await this.produtoRepository.findOne({
      where: { dsc_produto: createProdutoDto.dsc_produto },
    });
    if (existing) {
      throw new ConflictException('Já existe um produto com esta descrição');
    }
    const produto = this.produtoRepository.create(createProdutoDto);
    const result = await this.produtoRepository.save(produto);
    if (authenticatedUser) {
      await this.auditService.log(
        authenticatedUser.id,
        'CREATE',
        'produto',
        result.id,
        {
          dsc_produto: createProdutoDto.dsc_produto,
          valor_unit: createProdutoDto.valor_unit,
        },
      );
    }
    return result;
  }

  async findAll(
    listProdutoDto: ListProdutoDto,
  ): Promise<PaginatedResponse<IProdutoOutput>> {
    const { skip, take, ...whereRaw } = listProdutoDto;
    const where = Object.fromEntries(
      Object.entries(whereRaw).filter(([, v]) => v !== undefined),
    );
    const [data, total] = await this.produtoRepository.findAndCount({
      where,
      skip,
      take,
    });
    return { data, total, skip: skip ?? 0, take: take ?? 20 };
  }

  async findOne(id: number): Promise<IProdutoOutput> {
    const produto = await this.produtoRepository.findOne({ where: { id } });
    if (!produto) {
      throw new NotFoundException(`Produto com ID ${id} não encontrado`);
    }
    return produto;
  }

  async update(
    id: number,
    updateProdutoDto: UpdateProdutoDto,
    authenticatedUser?: { id: number },
  ): Promise<IProdutoOutput> {
    if (updateProdutoDto.dsc_produto) {
      const existing = await this.produtoRepository.findOne({
        where: { dsc_produto: updateProdutoDto.dsc_produto },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Já existe um produto com esta descrição');
      }
    }
    const produto = await this.findOne(id);
    const updatedProduto = Object.assign(produto, updateProdutoDto);
    const result = await this.produtoRepository.save(updatedProduto);
    if (authenticatedUser) {
      const details: Record<string, unknown> = {};
      if (updateProdutoDto.dsc_produto)
        details.dsc_produto = updateProdutoDto.dsc_produto;
      if (updateProdutoDto.valor_unit !== undefined)
        details.valor_unit = updateProdutoDto.valor_unit;
      if (updateProdutoDto.status !== undefined)
        details.status = updateProdutoDto.status;
      await this.auditService.log(
        authenticatedUser.id,
        'UPDATE',
        'produto',
        id,
        Object.keys(details).length > 0 ? details : undefined,
      );
    }
    return result;
  }

  async remove(
    id: number,
    authenticatedUser?: { id: number },
  ): Promise<DeleteProdutoDto> {
    const produto = await this.findOne(id);
    await this.produtoRepository.delete(id);
    if (authenticatedUser) {
      await this.auditService.log(
        authenticatedUser.id,
        'DELETE',
        'produto',
        id,
        { dsc_produto: produto.dsc_produto },
      );
    }
    return { id };
  }
}
