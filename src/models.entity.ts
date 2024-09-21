import {
  Column,
  Entity,
  ManyToOne,
  OneToMany,
  PrimaryGeneratedColumn,
} from 'typeorm';
import { Exclude } from 'class-transformer';

declare module 'express-serve-static-core' {
  interface Request {
    user?: User; // Extend the Request interface to include user
  }
}

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
export class User {
  @PrimaryGeneratedColumn()
  public id?: number;

  @Column({ unique: true })
  public username: string;

  @Column()
  @Exclude()
  public password: string;

  @OneToMany(() => Transaction, (transaction) => transaction.user) // Set up the relation
  transactions: Transaction[];

  constructor(id: number, username: string) {
    this.id = id;
    this.username = username;
  }
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

  @ManyToOne(() => User, (user) => user.transactions)
  user: User;
}
