import { Injectable } from '@nestjs/common';
import * as csv from 'csv-parser';
import { InjectRepository } from '@nestjs/typeorm';
import { PlAccount, Transaction, User } from './models.entity';
import { Repository } from 'typeorm';
import { Readable } from 'stream';

@Injectable()
export class CsvUploadService {
  constructor(
    @InjectRepository(Transaction)
    private readonly transactionRepo: Repository<Transaction>,
    @InjectRepository(PlAccount)
    private readonly plAccountRepo: Repository<PlAccount>,
  ) {}

  async processCSVBestPracticesPLAccounts(
    file: Express.Multer.File,
  ): Promise<any> {
    const results: Partial<PlAccount>[] = [];
    // todo move out csv parsing functionality to a separate function
    return new Promise((resolve, reject) => {
      const readableStream = new Readable();
      readableStream.push(file.buffer); // Push the buffer into the stream
      readableStream.push(null); // Indicate the end of the stream
      readableStream
        .pipe(csv())
        .on('data', (data) => {
          // Map CSV data to Transaction entity
          const plAcc: Partial<PlAccount> = {
            originalName: data['Master categories'],
            bestPracticeName: data['Master categories'].trim().toLowerCase(),
          };
          results.push(plAcc);
        })
        .on('end', async () => {
          try {
            // Save all transactions to the database
            await this.plAccountRepo.save(results);
            resolve(results); // Return saved records
          } catch (error) {
            reject(error); // Handle errors
          }
        })
        .on('error', (err) => reject(err));
    });
  }

  async processCSVTransactions(
    file: Express.Multer.File,
    user: User,
  ): Promise<any> {
    // todo ideally it should be in background processing
    const transactionGroups: Map<string, Transaction[]> = new Map();
    const batchSize = 100; // Set your desired batch size

    return new Promise((resolve, reject) => {
      const readableStream = new Readable();
      readableStream.push(file.buffer); // Push the buffer into the stream
      readableStream.push(null); // Indicate the end of the stream
      readableStream
        .pipe(csv())
        .on('data', async (data) => {
          const plAccountName = data['PL Account'].trim().toLocaleLowerCase();

          // Create the transaction object
          const transaction: Transaction = {
            id: undefined,
            date: data.Date,
            plAccount: undefined,
            user,
            amount: parseFloat(data.Amount),
            description: data.Description || null,
            counterparty: data.Counterparty || null,
          };

          // Group transactions by PL Account
          if (!transactionGroups.has(plAccountName)) {
            transactionGroups.set(plAccountName, []);
          }
          transactionGroups.get(plAccountName)?.push(transaction);
        })
        .on('end', async () => {
          try {
            // Save transactions by groups in batches
            for (const [
              plAccountName,
              transactions,
            ] of transactionGroups.entries()) {
              const plAcc = await this.plAccountRepo.findOne({
                where: { bestPracticeName: plAccountName },
              });
              for (let i = 0; i < transactions.length; i += batchSize) {
                let batch = transactions.slice(i, i + batchSize);
                try {
                  // Assign the plAccount if it exists
                  batch = batch.map((t) => {
                    return {
                      ...t,
                      plAccount: plAcc || null, // Set to plAcc or null
                    };
                  });

                  await this.transactionRepo.save(batch);
                } catch (error) {
                  console.error(
                    `Failed to save transaction batch for PL Account: ${plAccountName}. Error: ${error.message}`,
                  );
                }
              }
            }

            resolve([...transactionGroups.values()].flat()); // Return all saved records
          } catch (error) {
            reject(error); // Handle errors
          }
        })
        .on('error', (err) => reject(err));
    });
  }
}
