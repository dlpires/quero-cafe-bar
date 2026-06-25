import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ComandaItemController } from './comanda-item.controller';
import { ComandaItemService } from './comanda-item.service';
import { ComandaItem } from './entities/comanda-item.entity';
import { ComandaModule } from '../comanda/comanda.module';

@Module({
  imports: [TypeOrmModule.forFeature([ComandaItem]), ComandaModule],
  controllers: [ComandaItemController],
  providers: [ComandaItemService],
  exports: [ComandaItemService],
})
export class ComandaItemModule {}
