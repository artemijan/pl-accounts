import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Transaction, User } from './models.entity';
import CreateUserDto from './createUser.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Transaction)
    private transactionRepository: Repository<Transaction>,
  ) {}

  async getByUsername(username: string) {
    const user = await this.usersRepository.findOne({ where: { username } });
    if (user) {
      return user;
    }
    return null;
  }

  async getUserTransactions(
    user: User,
    page?: number,
    pageSize?: number,
  ): Promise<{ transactions: Transaction[]; total: number }> {
    const res = await this.transactionRepository.findAndCount({
      where: {
        user: { username: user.username },
      },
      skip: (page - 1) * pageSize, // Calculate how many records to skip
      take: pageSize,
      order: {
        id: 'ASC', // Order by date ascending (change to 'DESC' for descending)
      },
    });
    return { transactions: res[0], total: res[1] };
  }

  async getById(id: number) {
    const user = await this.usersRepository.findOne({ where: { id } });
    if (user) {
      return user;
    }
    return null;
  }

  async create(userData: CreateUserDto) {
    const newUser = await this.usersRepository.create(userData);
    await this.usersRepository.save(newUser);
    return newUser;
  }
}
