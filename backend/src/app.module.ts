import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SnippetsModule } from './snippets/snippets.module';
import { NotesModule } from './notes/notes.module';
import { GoalsModule } from './goals/goals.module';
import { LeetcodeModule } from './leetcode/leetcode.module';
import { GithubModule } from './github/github.module';
import { AiModule } from './ai/ai.module';
import { PortfolioModule } from './portfolio/portfolio.module';
import { AdminModule } from './admin/admin.module';

import { Snippet } from './snippets/snippet.entity';
import { Note } from './notes/note.entity';
import { Goal } from './goals/goal.entity';
import { LeetcodeEntry } from './leetcode/leetcode-entry.entity';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'sqljs',
      autoSave: true,
      location: process.env.DATABASE_PATH || 'devagent.sqlite',
      entities: [Snippet, Note, Goal, LeetcodeEntry],
      synchronize: true,
    }),
    SnippetsModule,
    NotesModule,
    GoalsModule,
    LeetcodeModule,
    GithubModule,
    AiModule,
    PortfolioModule,
    AdminModule,
  ],
})
export class AppModule {}
