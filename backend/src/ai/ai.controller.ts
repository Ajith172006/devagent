import { Body, Controller, Post } from '@nestjs/common';
import { Throttle } from '@nestjs/throttler';
import { AiService } from './ai.service';
import { DebugCodeDto } from './dto/debug-code.dto';
import { ExplainCodeDto } from './dto/explain-code.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('debug')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  debug(@Body() dto: DebugCodeDto) {
    return this.aiService.debugCode(dto);
  }

  @Post('explain')
  @Throttle({ default: { limit: 5, ttl: 60000 } })
  explain(@Body() dto: ExplainCodeDto) {
    return this.aiService.explainCode(dto);
  }
}
