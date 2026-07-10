import { Module } from '@nestjs/common';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { SnippetsModule } from '../snippets/snippets.module';
import { LeetcodeModule } from '../leetcode/leetcode.module';
import { GithubModule } from '../github/github.module';
import { GoalsModule } from '../goals/goals.module';
import { UsersModule } from '../users/users.module';

@Module({
  imports: [SnippetsModule, LeetcodeModule, GithubModule, GoalsModule, UsersModule],
  controllers: [PortfolioController],
  providers: [PortfolioService],
})
export class PortfolioModule {}
