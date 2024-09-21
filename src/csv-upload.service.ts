import { Injectable } from '@nestjs/common';
import csv from 'csv-parser';
import * as fs from 'fs';
import { InjectRepository } from '@nestjs/typeorm';
import { Transaction } from './models.entity';
import { Repository } from 'typeorm';

@Injectable()
export class CsvUploadService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
  ) {}

  async processCSV(file: Express.Multer.File): Promise<any> {
    const results: Partial<Transaction>[] = [];
    return new Promise((resolve, reject) => {
      fs.createReadStream(file.path)
        .pipe(csv())
        .on('data', (data) => {
          // Map CSV data to Transaction entity
          const transaction: Partial<Transaction> = {
            date: data.Date,
            plAccount: data['PL Account'],
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
