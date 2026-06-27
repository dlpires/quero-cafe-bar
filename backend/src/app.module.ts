import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComandaModule } from './modules/comanda/comanda.module';
import { MesaModule } from './modules/mesa/mesa.module';
import { ProdutoModule } from './modules/produto/produto.module';
import { ComandaItemModule } from './modules/comanda-item/comanda-item.module';
import { UsuarioModule } from './modules/usuario/usuario.module';
import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { RolesGuard } from './common/guards/roles.guard';
import { AuditModule } from './modules/audit/audit.module';
import { SeedService } from './common/seed/seed.service';
import ormConfig from './config/orm.config';

@Module({
  imports: [
    ThrottlerModule.forRoot([
      {
        ttl: 60000,
        limit: 120,
      },
    ]),
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRoot({
      ...ormConfig,
      autoLoadEntities: true,
    }),
    ComandaModule,
    MesaModule,
    ProdutoModule,
    ComandaItemModule,
    UsuarioModule,
    AuditModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    SeedService,
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
    {
      provide: APP_GUARD,
      useClass: JwtAuthGuard,
    },
    {
      provide: APP_GUARD,
      useClass: RolesGuard,
    },
  ],
})
export class AppModule {}
