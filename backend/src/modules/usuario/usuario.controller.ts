import {
  Controller,
  Param,
  Post,
  Body,
  Get,
  Patch,
  Delete,
  Query,
  Req,
  ConflictException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import * as jwt from 'jsonwebtoken';
import type { Request } from 'express';
import { Public } from '../../common/guards/jwt-auth.guard';
import { UsuarioService } from './usuario.service';
import { PaginatedResponse } from '../produto/dto/paginated-response.dto';
import { IUsuarioOutput } from './interfaces/usuario.interface';
import { CreateUsuarioDto } from './dto/create-usuario.dto';
import { UpdateUsuarioDto } from './dto/update-usuario.dto';
import { ListUsuarioDto } from './dto/list-usuario.dto';
import { DeleteUsuarioDto } from './dto/delete-usuario.dto';
import { LoginUsuarioDto } from './dto/login-usuario.dto';

@Controller('usuario')
export class UsuarioController {
  constructor(private readonly usuarioService: UsuarioService) {}

  @Post()
  async create(
    @Body() createUsuarioDto: CreateUsuarioDto,
  ): Promise<IUsuarioOutput> {
    return await this.usuarioService.create(createUsuarioDto);
  }

  @Get()
  async findAll(
    @Query() listUsuarioDto: ListUsuarioDto,
  ): Promise<PaginatedResponse<IUsuarioOutput>> {
    return await this.usuarioService.findAll(listUsuarioDto);
  }

  @Get(':id')
  async findOne(@Param('id') id: number): Promise<IUsuarioOutput> {
    return await this.usuarioService.findOne(id);
  }

  @Get('usuario/:usuario')
  async findByUsuario(
    @Param('usuario') usuario: string,
  ): Promise<IUsuarioOutput> {
    return await this.usuarioService.findByUsuario(usuario);
  }

  @Get('perfil/:perfil')
  async findByPerfil(@Param('perfil') perfil: number): Promise<IUsuarioOutput> {
    return await this.usuarioService.findByPerfil(perfil);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  async login(@Body() loginDto: LoginUsuarioDto): Promise<{ token: string }> {
    const user = await this.usuarioService.login(
      loginDto.username,
      loginDto.password,
    );
    const secret = process.env.JWT_SECRET;
    if (!secret) {
      throw new Error('JWT_SECRET não configurado nas variáveis de ambiente');
    }
    const expiresIn = process.env.JWT_EXPIRES_IN || '2h';
    const token = jwt.sign({ id: user.id, perfil: user.perfil }, secret, {
      algorithm: 'HS256',
      expiresIn,
    } as jwt.SignOptions);
    return { token };
  }

  @Patch(':id')
  async update(
    @Param('id') id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
  ): Promise<IUsuarioOutput> {
    return await this.usuarioService.update(id, updateUsuarioDto);
  }

  @Delete(':id')
  async remove(
    @Param('id') id: number,
    @Req() request: Request,
  ): Promise<DeleteUsuarioDto> {
    const authHeader = request.headers.authorization;
    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      try {
        const secret = process.env.JWT_SECRET;
        if (!secret) {
          throw new Error(
            'JWT_SECRET não configurado nas variáveis de ambiente',
          );
        }
        const decoded = jwt.verify(token, secret, {
          algorithms: ['HS256'],
        }) as { id: number };
        if (decoded.id === id) {
          throw new ConflictException(
            'Você não pode excluir seu próprio usuário',
          );
        }
      } catch (error) {
        if (error instanceof ConflictException) {
          throw error;
        }
      }
    }
    return await this.usuarioService.remove(id);
  }
}
