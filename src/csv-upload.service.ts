import { Injectable } from '@nestjs/common';
import * as csv from 'csv-parser';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction, User } from './models.entity';
import { Repository } from 'typeorm';
import { Readable } from 'stream';

@Injectable()
export class CsvUploadService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
  ) {}

  async processCSV(file: Express.Multer.File, user: User): Promise<any> {
    const results: Partial<Transaction>[] = [];

    return new Promise((resolve, reject) => {
      const readableStream = new Readable();
      readableStream.push(file.buffer); // Push the buffer into the stream
      readableStream.push(null); // Indicate the end of the stream
      readableStream
        .pipe(csv())
        .on('data', (data) => {
          // Map CSV data to Transaction entity
          const transaction: Partial<Transaction> = {
            date: data.Date,
            plAccount: data['PL Account'],
            user,
            amount: parseFloat(data.Amount),
            description: data.Description || null,
            counterparty: data.Counterparty || null,
          };
          results.push(transaction);
        })
        .on('end', async () => {
          try {
            // Save all transactions to the database
            await this.transactionRepo.save(results);
            resolve(results); // Return saved records
          } catch (error) {
            reject(error); // Handle errors
          }
        })
        .on('error', (err) => reject(err));
    });
  }
}
