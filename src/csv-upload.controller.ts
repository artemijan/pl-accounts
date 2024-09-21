import {
  Controller,
  Post,
  Req,
  Res,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { CsvUploadService } from './csv-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { JwtAuthGuard } from './loginWithCredentialsGuard.guard'; // Correct import
import { Request, Response } from 'express';

@Controller('csv')
export class CsvController {
  constructor(private readonly csvService: CsvUploadService) {}

  @Post()
  @UseGuards(JwtAuthGuard)
  @UseInterceptors(
    FileInterceptor('file', {
      storage: memoryStorage(),
    }),
  )
  async uploadFile(
    @UploadedFile() file: Express.Multer.File,
    @Req() req: Request,
    @Res() response: Response,
  ) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    await this.csvService.processCSV(file, req.user);
    return response.render('index', {
      user: req.user,
      message:
        'Upload successful, you can upload more files, or go and check uploaded transactions <a href="/transactions">here</a>',
    });
  }
}
