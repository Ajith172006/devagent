import { Body, Controller, Post } from '@nestjs/common';
import { AiService } from './ai.service';
import { DebugCodeDto } from './dto/debug-code.dto';
import { ExplainCodeDto } from './dto/explain-code.dto';

@Controller('ai')
export class AiController {
  constructor(private readonly aiService: AiService) {}

  @Post('debug')
  debug(@Body() dto: DebugCodeDto) {
    return this.aiService.debugCode(dto);
  }

  @Post('explain')
  explain(@Body() dto: ExplainCodeDto) {
    return this.aiService.explainCode(dto);
  }
}
