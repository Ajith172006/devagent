import { Injectable, InternalServerErrorException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI, GenerativeModel } from '@google/generative-ai';
import { DebugCodeDto } from './dto/debug-code.dto';
import { ExplainCodeDto } from './dto/explain-code.dto';

@Injectable()
export class AiService {
  private genAI: GoogleGenerativeAI | null = null;
  private readonly model: string;

  constructor(private readonly config: ConfigService) {
    this.model = this.config.get<string>('GEMINI_MODEL') || 'gemini-1.5-flash';
  }

  private getModel(): GenerativeModel {
    const apiKey = this.config.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      throw new InternalServerErrorException(
        'GEMINI_API_KEY is not set. Add it to your .env file to use AI features.',
      );
    }
    if (!this.genAI) {
      this.genAI = new GoogleGenerativeAI(apiKey);
    }
    return this.genAI.getGenerativeModel({ model: this.model });
  }

  async debugCode(dto: DebugCodeDto) {
    const model = this.getModel();

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

    const result = await model.generateContent(prompt);
    return { result: result.response.text() };
  }

  async explainCode(dto: ExplainCodeDto) {
    const model = this.getModel();
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

    const result = await model.generateContent(prompt);
    return { result: result.response.text() };
  }
}
