import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
  ConflictException,
  ForbiddenException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import * as bcrypt from 'bcrypt';
import { Usuario } from './entities/usuario.entity';
import { Repository } from 'typeorm';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { ListUsuarioDto } from './dto/list-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { PaginatedResponse } from '../produto/dto/paginated-response.dto';
import { IUsuarioOutput } from './interfaces/usuario.interface';
import { AuditService } from '../audit/audit.service';

@Injectable()
export class UsuarioService {
  constructor(
    @InjectRepository(Usuario)
    private readonly usuarioRepository: Repository<Usuario>,
    private readonly auditService: AuditService,
  ) {}

  async create(
    createUsuarioDto: CreateUsuarioDto,
    authenticatedUser?: { id: number },
  ) {
    const existing = await this.usuarioRepository.findOne({
      where: { usuario: createUsuarioDto.usuario },
    });
    if (existing) {
      throw new ConflictException('Já existe um usuário com este login');
    }
    const salt = await bcrypt.genSalt(10);
    const hashedSenha = await bcrypt.hash(createUsuarioDto.senha, salt);
    const usuario = this.usuarioRepository.create({
      ...createUsuarioDto,
      senha: hashedSenha,
    });
    const result = await this.usuarioRepository.save(usuario);
    if (authenticatedUser) {
      await this.auditService.log(
        authenticatedUser.id,
        'CREATE',
        'usuario',
        result.id,
        { usuario: createUsuarioDto.usuario, perfil: createUsuarioDto.perfil },
      );
    }
    return result;
  }

  async findAll(
    listUsuarioDto: ListUsuarioDto,
  ): Promise<PaginatedResponse<IUsuarioOutput>> {
    const { skip, take, ...whereRaw } = listUsuarioDto;
    const where = Object.fromEntries(
      Object.entries(whereRaw).filter(([, v]) => v !== undefined),
    );
    const [data, total] = await this.usuarioRepository.findAndCount({
      where,
      skip,
      take,
    });
    return { data, total, skip: skip ?? 0, take: take ?? 20 };
  }

  async findOne(id: number) {
    const usuario = await this.usuarioRepository.findOne({ where: { id } });
    if (!usuario) {
      throw new NotFoundException(`Usuário com ID ${id} não encontrado`);
    }
    return usuario;
  }

  async findByUsuario(usuario: string) {
    const user = await this.usuarioRepository.findOne({ where: { usuario } });
    if (!user) {
      throw new NotFoundException(`Usuário ${usuario} não encontrado`);
    }
    return user;
  }

  async findByPerfil(perfil: number) {
    const user = await this.usuarioRepository.findOne({ where: { perfil } });
    if (!user) {
      throw new NotFoundException(
        `Usuário com perfil ${perfil} não encontrado`,
      );
    }
    return user;
  }

  async login(usuario: string, senha: string) {
    const user = await this.usuarioRepository.findOne({
      where: { usuario },
    });

    if (!user) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    const senhaValida = await bcrypt.compare(senha, user.senha);
    if (!senhaValida) {
      throw new UnauthorizedException('Usuário ou senha inválidos');
    }

    return user;
  }

  async update(
    id: number,
    updateUsuarioDto: UpdateUsuarioDto,
    authenticatedUser?: { id: number; perfil: number },
  ) {
    if (updateUsuarioDto.usuario) {
      const existing = await this.usuarioRepository.findOne({
        where: { usuario: updateUsuarioDto.usuario },
      });
      if (existing && existing.id !== id) {
        throw new ConflictException('Já existe um usuário com este login');
      }
    }
    if (
      authenticatedUser &&
      authenticatedUser.perfil !== 0 &&
      authenticatedUser.id === id &&
      updateUsuarioDto.perfil !== undefined
    ) {
      throw new ForbiddenException('Você não pode alterar seu próprio perfil');
    }
    const usuario = await this.findOne(id);
    const previousPerfil = usuario.perfil;

    if (updateUsuarioDto.senha) {
      const salt = await bcrypt.genSalt(10);
      updateUsuarioDto.senha = await bcrypt.hash(updateUsuarioDto.senha, salt);
    }

    const updatedUsuario = Object.assign(usuario, updateUsuarioDto);
    const result = await this.usuarioRepository.save(updatedUsuario);
    if (authenticatedUser) {
      const details: Record<string, unknown> = {};
      if (updateUsuarioDto.perfil !== undefined) {
        details.previousPerfil = previousPerfil;
        details.newPerfil = updateUsuarioDto.perfil;
      }
      await this.auditService.log(
        authenticatedUser.id,
        'UPDATE',
        'usuario',
        id,
        Object.keys(details).length > 0 ? details : undefined,
      );
    }
    return result;
  }

  async remove(id: number, authenticatedUser?: { id: number }) {
    if (authenticatedUser && authenticatedUser.id === id) {
      throw new ConflictException('Você não pode excluir seu próprio usuário');
    }
    const usuario = await this.findOne(id);
    await this.usuarioRepository.delete(id);
    if (authenticatedUser) {
      await this.auditService.log(
        authenticatedUser.id,
        'DELETE',
        'usuario',
        id,
        { usuario: usuario.usuario },
      );
    }
    return { id };
  }

  async seedAdminIfNeeded(): Promise<boolean> {
    const adminExists = await this.usuarioRepository.findOne({
      where: { perfil: 0 },
    });
    if (adminExists) return false;

    const salt = await bcrypt.genSalt(10);
    const hashedSenha = await bcrypt.hash('admin', salt);
    await this.usuarioRepository.save({
      usuario: 'admin',
      senha: hashedSenha,
      nome: 'Administrador',
      perfil: 0,
    });
    return true;
  }
}
