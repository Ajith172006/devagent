import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Snippet } from './snippet.entity';
import { SnippetsService } from './snippets.service';
import { SnippetsController } from './snippets.controller';

@Module({
  imports: [TypeOrmModule.forFeature([Snippet])],
  controllers: [SnippetsController],
  providers: [SnippetsService],
  exports: [SnippetsService],
})
export class SnippetsModule {}
