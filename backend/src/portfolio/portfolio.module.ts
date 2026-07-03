import { Module } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { SnippetsModule } from '../snippets/snippets.module';
import { LeetcodeModule } from '../leetcode/leetcode.module';
import { GithubModule } from '../github/github.module';
import { GoalsModule } from '../goals/goals.module';

@Module({
  imports: [SnippetsModule, LeetcodeModule, GithubModule, GoalsModule],
  controllers: [PortfolioController],
  providers: [PortfolioService],
})
export class PortfolioModule {}
