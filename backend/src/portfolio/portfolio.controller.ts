import { Controller, Get, Post, UseGuards } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { AuthUser } from '../auth/types/auth-user.type';

@UseGuards(JwtAuthGuard)
@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  getPortfolio(@CurrentUser() user: AuthUser) {
    return this.portfolioService.getPortfolio(user.id);
  }

  @Post('sync')
  syncPortfolio(@CurrentUser() user: AuthUser) {
    return this.portfolioService.syncPortfolio(user.id);
  }
}
