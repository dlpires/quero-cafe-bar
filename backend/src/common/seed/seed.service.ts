import { Injectable, Logger } from '@nestjs/common';
import { UsuarioService } from '../../modules/usuario/usuario.service';

@Injectable()
export class SeedService {
  private readonly logger = new Logger(SeedService.name);

  constructor(private readonly usuarioService: UsuarioService) {}

  async seed(): Promise<void> {
    if (process.env.SEED_ADMIN !== 'true') return;

    const created = await this.usuarioService.seedAdminIfNeeded();
    if (created) {
      this.logger.log('Administrador padrão criado (admin / admin)');
    }
  }
}
