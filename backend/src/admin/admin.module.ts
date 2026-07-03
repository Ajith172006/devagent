import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { SnippetsModule } from '../snippets/snippets.module';
import { NotesModule } from '../notes/notes.module';
import { GoalsModule } from '../goals/goals.module';
import { LeetcodeModule } from '../leetcode/leetcode.module';

@Module({
  imports: [SnippetsModule, NotesModule, GoalsModule, LeetcodeModule],
  controllers: [AdminController],
})
export class AdminModule {}
