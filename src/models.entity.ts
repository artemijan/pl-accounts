import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { Exclude } from 'class-transformer';

@Entity()
export class PlAccount {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  originalName: string;

  @Column()
  bestPracticeName: string;
}

@Entity()
export class Transaction {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  date: string;

  @Column()
  plAccount: string;

  @Column('decimal')
  amount: number;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  counterparty: string;
}

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ unique: true })
  public username: string;

  @Column()
  @Exclude()
  public password: string;
}
