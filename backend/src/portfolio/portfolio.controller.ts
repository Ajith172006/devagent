import { Controller, Get, Header, Query, UnauthorizedException, Res, UseGuards } from '@nestjs/common';
import { Response } from 'express';
import { PortfolioService } from './portfolio.service';
import { FirebaseAuthGuard } from '../auth/firebase-auth.guard';
import { CurrentUser } from '../auth/current-user.decorator';

@Controller('portfolio')
export class PortfolioController {
  constructor(private readonly portfolioService: PortfolioService) {}

  @Get()
  @UseGuards(FirebaseAuthGuard)
  generate(
    @CurrentUser() uid: string,
    @Query('githubUsername') githubUsername?: string,
  ) {
    return this.portfolioService.generate(uid, { githubUsername });
  }

  @Get('export')
  @Header('Content-Type', 'text/html')
  export(
    @Query('userId') uidQuery: string,
    @Query('githubUsername') githubUsername?: string,
    @Query('displayName') displayName?: string,
    @Query('includeLeetcode') includeLeetcode?: string,
    @Query('download') download?: string,
    @Res({ passthrough: true }) res?: Response,
  ) {
    if (!uidQuery) {
      throw new UnauthorizedException('userId query parameter is required to export portfolio');
    }
    if (download === 'true' && res) {
      res.setHeader('Content-Disposition', 'attachment; filename="portfolio.html"');
    }
    return this.portfolioService.generateHtml(uidQuery, {
      githubUsername,
      displayName,
      includeLeetcode: includeLeetcode === 'true',
    });
  }
}
