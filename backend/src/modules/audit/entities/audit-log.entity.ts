import {
  Column,
  Entity,
  PrimaryGeneratedColumn,
  CreateDateColumn,
} from 'typeorm';

@Entity('audit_logs')
export class AuditLog {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'user_id' })
  userId: number;

  @Column({ length: 50 })
  action: string;

  @Column({ length: 50 })
  resource: string;

  @Column({ name: 'resource_id', nullable: true })
  resourceId: number;

  @Column({ type: 'json', nullable: true })
  details: Record<string, unknown>;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;
}
