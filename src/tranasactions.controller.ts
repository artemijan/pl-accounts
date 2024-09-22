import { Controller, Get, Query, Req, UseGuards } from '@nestjs/common';
import { Request } from 'express';
import { UsersService } from './user.service';
import { JwtAuthGuard } from './jwtAuth.guard';
import { plainToInstance } from 'class-transformer';
import { TransactionDto } from './dto/transaction';

@Controller('transactions')
export class TransactionsController {
  constructor(private readonly userService: UsersService) {}

  @Get()
  @UseGuards(JwtAuthGuard)
  async transactions(@Req() req: Request, @Query('page') page: string = '1') {
    const pageNumber = parseInt(page, 10);
    const pageSize = 10;
    const response = await this.userService.getUserTransactions(
      req.user,
      pageNumber,
      pageSize,
    );
    const totalPages = Math.ceil(response.total / pageSize); // Calculate total pages
    // Logic for pagination truncation
    let pagination = [];
    const visiblePages = 5; // Number of page links to show
    const startPage = Math.max(2, pageNumber - Math.floor(visiblePages / 2));
    const endPage = Math.min(totalPages - 1, startPage + visiblePages - 2);

    if (totalPages > visiblePages) {
      pagination.push(1); // Always show the first page
      if (startPage > 2) {
        pagination.push('...'); // Indicate skipped pages
      }
      for (let i = startPage; i <= endPage; i++) {
        pagination.push(i);
      }
      if (endPage < totalPages - 1) {
        pagination.push('...'); // Indicate skipped pages
      }
      pagination.push(totalPages); // Always show the last page
    } else {
      pagination = Array.from({ length: totalPages }, (_, i) => i + 1); // Show all pages
    }
    return {
      size: pageSize,
      page: pageNumber,
      pagination,
      transactions: plainToInstance(TransactionDto, response.transactions),
      totalPages,
    };
  }

  @Get('report')
  @UseGuards(JwtAuthGuard)
  async transactionsReport() {
    const monthly = await this.userService.getMonthlyReport();
    const topFive = await this.userService.getTopPLAccountsLastMonth(5);
    // todo implement dto for these to be used in FE/BE
    return {
      monthly,
      topFive,
    };
  }
}
