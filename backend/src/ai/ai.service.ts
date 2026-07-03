import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import Anthropic from '@anthropic-ai/sdk';
import { DebugCodeDto } from './dto/debug-code.dto';
import { ExplainCodeDto } from './dto/explain-code.dto';

@Injectable()
export class AiService {
  private client: Anthropic | null = null;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    this.model = this.config.get<string>('ANTHROPIC_MODEL') || 'claude-sonnet-4-6';
  }

  private getClient(): Anthropic {
    const apiKey = this.config.get<string>('ANTHROPIC_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException(
        'ANTHROPIC_API_KEY is not set. Add it to your .env file to use AI features.',
      );
    }
    if (!this.client) {
      this.client = new Anthropic({ apiKey });
    }
    return this.client;
  }

  async debugCode(dto: DebugCodeDto) {
    const client = this.getClient();

    const prompt = [
      `You are an expert ${dto.language || ''} debugger helping a developer inside "DevAgent", a developer workspace tool.`,
      `Analyze the following code${dto.errorMessage ? ' and the error message below' : ''} and identify the bug(s).`,
      '',
      '```' + (dto.language || ''),
      dto.code,
      '```',
      dto.errorMessage ? `\nError message:\n${dto.errorMessage}` : '',
      dto.context ? `\nAdditional context:\n${dto.context}` : '',
      '',
      'Respond in this exact structure:',
      '1. **Root cause** — a concise explanation of what is wrong.',
      '2. **Fix** — the corrected code in a fenced code block.',
      '3. **Why it works** — a short explanation of the fix.',
      '4. **Prevention tip** — one tip to avoid this class of bug in the future.',
    ]
      .filter(Boolean)
      .join('\n');

    const response = await client.messages.create({
      model: this.model,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    return { result: this.extractText(response) };
  }

  async explainCode(dto: ExplainCodeDto) {
    const client = this.getClient();
    const level = dto.level || 'intermediate';

    const prompt = [
      `Explain the following ${dto.language || ''} code to a developer at a ${level} level.`,
      'Cover: what it does overall, how it works step by step, and call out any notable',
      'patterns, edge cases, or potential issues.',
      '',
      '```' + (dto.language || ''),
      dto.code,
      '```',
    ].join('\n');

    const response = await client.messages.create({
      model: this.model,
      max_tokens: 2000,
      messages: [{ role: 'user', content: prompt }],
    });

    return { result: this.extractText(response) };
  }

  private extractText(response: Anthropic.Message): string {
    return response.content
      .map((block) => (block.type === 'text' ? block.text : ''))
      .filter(Boolean)
      .join('\n');
  }
}
