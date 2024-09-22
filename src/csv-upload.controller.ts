import {
  Controller,
  HttpCode,
  HttpException,
  HttpStatus,
  Post,
  Req,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CsvUploadService } from './csv-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from './jwtAuth.guard'; // Correct import
import { Request } from 'express';

@Controller('csv')
export class CsvController {
  constructor(private readonly csvService: CsvUploadService) {}

  @HttpCode(HttpStatus.OK)
  @Post('transactions')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async uploadTransactions(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      // todo verify it's csv
      throw new Error('No file uploaded');
    }
    await this.csvService.processCSVTransactions(file, req.user);
  }

  @HttpCode(HttpStatus.OK)
  @Post('pl-accounts')
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async uploadBestPracticePLAccounts(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
  ) {
    if (!file) {
      // todo verify it's csv
      throw new Error('No file uploaded');
    }
    if (req.user.username == 'admin') {
      // todo, need permission system (for the future)
      await this.csvService.processCSVBestPracticesPLAccounts(file);
      return;
    }
    return new HttpException(
      'This is only for admin users',
      HttpStatus.FORBIDDEN,
    );
  }
}
