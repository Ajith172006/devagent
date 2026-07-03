import { Controller, Get, Header, Headers, Query, UnauthorizedException } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  private uid(h: string): string {
    if (!h) throw new UnauthorizedException('x-user-id header is required');
    return h;
  }

  @Get()
  generate(
    @Headers('x-user-id') uid: string,
    @Query('githubUsername') githubUsername?: string,
  ) {
    return this.portfolioService.generate(this.uid(uid), { githubUsername });
  }

  @Get('export')
  @Header('Content-Type', 'text/html')
  export(
    @Headers('x-user-id') uid: string,
    @Query('githubUsername') githubUsername?: string,
    @Query('displayName') displayName?: string,
  ) {
    return this.portfolioService.generateHtml(this.uid(uid), { githubUsername, displayName });
  }
}
