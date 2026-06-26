import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { AuditLog } from './entities/audit-log.entity';

@Injectable()
export class AuditService {
  constructor(
    @InjectRepository(AuditLog)
    private readonly auditLogRepository: Repository<AuditLog>,
  ) {}

  async log(
    userId: number,
    action: string,
    resource: string,
    resourceId?: number,
    details?: Record<string, unknown>,
  ): Promise<AuditLog> {
    const entry = this.auditLogRepository.create({
      userId,
      action,
      resource,
      resourceId,
      details,
    });
    return await this.auditLogRepository.save(entry);
  }

  async findAll(
    skip = 0,
    take = 50,
  ): Promise<{ data: AuditLog[]; total: number }> {
    const [data, total] = await this.auditLogRepository.findAndCount({
      skip,
      take,
      order: { createdAt: 'DESC' },
    });
    return { data, total };
  }
}
