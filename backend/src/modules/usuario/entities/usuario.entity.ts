import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('usuarios')
export class Usuario {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  nome: string;

  @Column()
  usuario: string;

  @Column()
  senha: string;

  @Column({ default: 0 })
  perfil: number;
}
