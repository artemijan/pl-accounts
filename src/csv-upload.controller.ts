import {
  Controller,
  HttpCode,
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
  ) {
    if (!file) {
      // todo verify it's csv
      throw new Error('No file uploaded');
    }
    await this.csvService.processCSV(file, req.user);
  }
}
