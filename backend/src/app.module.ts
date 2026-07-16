import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ThrottlerModule, ThrottlerGuard } from '@nestjs/throttler';
import { APP_GUARD } from '@nestjs/core';

import { SnippetsModule } from './snippets/snippets.module';
import { NotesModule } from './notes/notes.module';
import { GoalsModule } from './goals/goals.module';
import { LeetcodeModule } from './leetcode/leetcode.module';
import { GithubModule } from './github/github.module';
import { AiModule } from './ai/ai.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { AdminModule } from './admin/admin.module';
import { UsersModule } from './users/users.module';

import { Snippet } from './snippets/snippet.entity';
import { Note } from './notes/note.entity';
import { Goal } from './goals/goal.entity';
import { LeetcodeEntry } from './leetcode/leetcode-entry.entity';
import { User } from './users/user.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'mongodb',
      url: process.env.MONGODB_URI,
      entities: [Snippet, Note, Goal, LeetcodeEntry, User],
      synchronize: process.env.NODE_ENV !== 'production',
    }),
    ThrottlerModule.forRoot([{
      ttl: 60000, // 1 minute
      limit: 100, // 100 requests per minute
    }]),
    UsersModule,
    SnippetsModule,
    NotesModule,
    GoalsModule,
    LeetcodeModule,
    GithubModule,
    AiModule,
    PortfolioModule,
    AdminModule,
  ],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
