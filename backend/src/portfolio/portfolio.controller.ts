import { Controller, Get, Header, Query } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  generate(@Query('githubUsername') githubUsername?: string) {
    return this.portfolioService.generate({ githubUsername });
  }

  @Get('export')
  @Header('Content-Type', 'text/html')
  async export(
    @Query('githubUsername') githubUsername?: string,
    @Query('displayName') displayName?: string,
  ) {
    return this.portfolioService.generateHtml({ githubUsername, displayName });
  }
}
