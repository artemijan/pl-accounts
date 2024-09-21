import {
  Controller,
  Post,
  UploadedFile,
  UseInterceptors,
} from '@nestjs/common';
import { CsvUploadService } from './csv-upload.service';
import { FileInterceptor } from '@nestjs/platform-express';

@Controller('csv')
export class CsvController {
  constructor(private readonly csvService: CsvUploadService) {}

  @Post()
  @UseInterceptors(FileInterceptor('file'))
  async uploadFile(@UploadedFile() file: Express.Multer.File) {
    if (!file) {
      throw new Error('No file uploaded');
    }
    return this.csvService.processCSV(file);
  }
}
