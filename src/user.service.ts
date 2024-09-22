import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { IsNull, Not, Repository } from 'typeorm';
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

  async getMonthlyReport() {
    const transactions = await this.transactionRepository.find({
      where: { plAccount: Not(IsNull()) },
      relations: ['plAccount'], // Fetch related PL accounts
    });

    const report = transactions.reduce((acc, transaction) => {
      const date = new Date(transaction.date);
      const yearMonth = date.toISOString().slice(0, 7); // Format as YYYY-MM

      if (!acc[yearMonth]) {
        acc[yearMonth] = {
          year: date.getFullYear(),
          month: date.getMonth() + 1, // Months are zero-indexed
          plAccounts: {},
          totalAmount: 0,
        };
      }

      acc[yearMonth].totalAmount += transaction.amount;

      const plAccountId = transaction.plAccount.id;
      const originalName = transaction.plAccount.originalName;
      if (!acc[yearMonth].plAccounts[plAccountId]) {
        acc[yearMonth].plAccounts[plAccountId] = {
          plAccountId,
          originalName,
          totalAmount: 0,
        };
      }
      acc[yearMonth].plAccounts[plAccountId].totalAmount += transaction.amount;

      return acc;
    }, {});

    return Object.values(report).map(({ plAccounts, ...rest }) => ({
      ...rest,
      plAccounts: Object.values(plAccounts), // Return PL accounts as an array
    }));
  }

  async getTopPLAccountsLastMonth(howMuch: number, uncategorized?: boolean) {
    const lastMonth = new Date();
    lastMonth.setMonth(lastMonth.getMonth() - 1);

    const query = this.transactionRepository
      .createQueryBuilder('transaction')
      .leftJoin('transaction.plAccount', 'plAccount') // Join to plAccount
      .select('plAccount.bestPracticeName', 'bestPracticeName')
      .addSelect('SUM(transaction.amount)', 'totalAmount')
      .where('transaction.date >= :lastMonth', { lastMonth })
      .groupBy('plAccount.bestPracticeName')
      .orderBy('totalAmount', 'DESC')
      .limit(howMuch);

    if (!uncategorized) {
      query.andWhere('transaction.plAccount IS NOT NULL');
    }
    return query.getRawMany();
  }
}
