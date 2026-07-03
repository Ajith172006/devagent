import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { LeetcodeEntry } from './leetcode-entry.entity';
import { LeetcodeService } from './leetcode.service';
import { LeetcodeController } from './leetcode.controller';

@Module({
  imports: [TypeOrmModule.forFeature([LeetcodeEntry])],
  controllers: [LeetcodeController],
  providers: [LeetcodeService],
  exports: [LeetcodeService],
})
export class LeetcodeModule {}
