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
  Res,
  HttpCode,
  HttpStatus,
  UseGuards,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import * as jwt from 'jsonwebtoken';
import type { Request, Response } from 'express';
import { Roles } from '../../common/decorators/roles.decorator';
import { JwtAuthGuard, Public } from '../../common/guards/jwt-auth.guard';
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
  @Roles(0)
  async create(
    @Body() createUsuarioDto: CreateUsuarioDto,
    @Req() request: Request,
  ): Promise<IUsuarioOutput> {
    const decoded = (request as unknown as Record<string, unknown>).user as
      | { id: number }
      | undefined;
    return await this.usuarioService.create(createUsuarioDto, decoded);
  }

  @Get()
  @Roles(0)
  async findAll(
    @Query() listUsuarioDto: ListUsuarioDto,
  ): Promise<PaginatedResponse<IUsuarioOutput>> {
    return await this.usuarioService.findAll(listUsuarioDto);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  async getMe(@Req() request: Request) {
    const decoded = (request as unknown as Record<string, unknown>).user as
      | { id: number }
      | undefined;
    if (!decoded || decoded.id == null) {
      throw new UnauthorizedException(
        'Token inválido: ID de usuário não encontrado',
      );
    }
    const user = await this.usuarioService.findOne(decoded.id);
    return { id: user.id, usuario: user.usuario, perfil: user.perfil };
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  logout(@Res({ passthrough: true }) response: Response) {
    response.cookie('token', '', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 0,
      path: '/',
    });
    return { message: 'Logout realizado com sucesso' };
  }

  @Get(':id')
  @Roles(0)
  async findOne(@Param('id') id: number): Promise<IUsuarioOutput> {
    return await this.usuarioService.findOne(id);
  }

  @Get('usuario/:usuario')
  @Roles(0)
  async findByUsuario(
    @Param('usuario') usuario: string,
  ): Promise<IUsuarioOutput> {
    return await this.usuarioService.findByUsuario(usuario);
  }

  @Get('perfil/:perfil')
  @Roles(0)
  async findByPerfil(@Param('perfil') perfil: number): Promise<IUsuarioOutput> {
    return await this.usuarioService.findByPerfil(perfil);
  }

  @Public()
  @Throttle({ default: { limit: 10, ttl: 60000 } })
  @Post('login')
  @HttpCode(HttpStatus.CREATED)
  async login(
    @Body() loginDto: LoginUsuarioDto,
    @Res({ passthrough: true }) response: Response,
  ): Promise<{ token: string }> {
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

    response.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 2 * 60 * 60 * 1000,
      path: '/',
    });

    return { token };
  }

  @Patch(':id')
  @Roles(0)
  async update(
    @Param('id') id: number,
    @Body() updateUsuarioDto: UpdateUsuarioDto,
    @Req() request: Request,
  ): Promise<IUsuarioOutput> {
    const decoded = (request as unknown as Record<string, unknown>).user as
      | { id: number; perfil: number }
      | undefined;
    return await this.usuarioService.update(id, updateUsuarioDto, decoded);
  }

  @Delete(':id')
  @Roles(0)
  async remove(
    @Param('id') id: number,
    @Req() request: Request,
  ): Promise<DeleteUsuarioDto> {
    const decoded = (request as unknown as Record<string, unknown>).user as
      | { id: number }
      | undefined;
    if (decoded && decoded.id === id) {
      throw new ConflictException('Você não pode excluir seu próprio usuário');
    }
    return await this.usuarioService.remove(id, decoded);
  }
}
