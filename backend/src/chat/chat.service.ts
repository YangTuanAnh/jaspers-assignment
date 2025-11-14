import {
  Injectable,
  InternalServerErrorException,
  Logger,
} from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { SendMessageDto } from './dto/send-message.dto';
import { PortfolioService } from '../portfolio/portfolio.service';
import { ConfigService } from '@nestjs/config';
import { fetch } from 'undici';

@Injectable()
export class ChatService {
  private readonly logger = new Logger(ChatService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly portfolioService: PortfolioService,
    private readonly configService: ConfigService,
  ) {}

  getMessages(userId: number) {
    return this.prisma.chatMessage.findMany({
      where: { userId },
      orderBy: { createdAt: 'asc' },
    });
  }

  async createMessage(userId: number, dto: SendMessageDto) {
    const userMessage = await this.prisma.chatMessage.create({
      data: {
        userId,
        role: 'user',
        content: dto.message.trim(),
      },
    });

    const context = await this.portfolioService.buildPortfolioContext(userId);
    const assistantContent = await this.generateAssistantResponse(
      dto.message,
      context,
    );

    const aiMessage = await this.prisma.chatMessage.create({
      data: {
        userId,
        role: 'assistant',
        content: assistantContent,
      },
    });

    return { userMessage, aiMessage };
  }

  private async generateAssistantResponse(question: string, context: string) {
    const anthropicKey = this.configService.get<string>('ANTHROPIC_API_KEY');
    const openaiKey = this.configService.get<string>('OPENAI_API_KEY');

    const basePrompt = `You are a helpful financial assistant for a retail investor. Use the portfolio data below to answer succinctly and include concrete numbers when possible. If the user asks for something that cannot be answered with the portfolio provided, explain what is missing instead of guessing.

Portfolio data:
${context}

User question: ${question}`;

    try {
      if (anthropicKey) {
        return await this.askAnthropic(basePrompt, anthropicKey);
      }

      if (openaiKey) {
        return await this.askOpenAI(basePrompt, openaiKey);
      }
    } catch (error) {
      this.logger.error('LLM API error', error as Error);
      throw new InternalServerErrorException(
        'Unable to reach the AI provider. Try again shortly.',
      );
    }

    return this.buildLocalFallbackAnswer(question, context);
  }

  private async askAnthropic(prompt: string, apiKey: string) {
    const model =
      this.configService.get<string>('ANTHROPIC_MODEL') ??
      'claude-3-5-sonnet-20241022';

    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': apiKey,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model,
        max_tokens: 500,
        messages: [
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`Anthropic API error: ${body}`);
      throw new Error('Anthropic API responded with an error');
    }

    const data = (await response.json()) as {
      content: Array<{ text: string }>;
    };

    return data.content?.[0]?.text ?? 'I could not generate a response.';
  }

  private async askOpenAI(prompt: string, apiKey: string) {
    const model =
      this.configService.get<string>('OPENAI_MODEL') ?? 'gpt-4o-mini';

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        max_tokens: 500,
        messages: [
          {
            role: 'system',
            content:
              'You are an AI financial co-pilot focused on describing a portfolio to the user.',
          },
          {
            role: 'user',
            content: prompt,
          },
        ],
      }),
    });

    if (!response.ok) {
      const body = await response.text();
      this.logger.error(`OpenAI API error: ${body}`);
      throw new Error('OpenAI API responded with an error');
    }

    const data = (await response.json()) as {
      choices: Array<{ message: { content: string } }>;
    };

    return (
      data.choices?.[0]?.message?.content ??
      'I could not generate a response this time.'
    );
  }

  private buildLocalFallbackAnswer(question: string, context: string) {
    const holdingsLines = context
      .split('\n')
      .filter((line) => line.trim().startsWith('- '));

    const summaryLines = context
      .split('\n')
      .filter((line) => line.includes('value') || line.includes('Cash'));

    return [
      "I'm operating in local demo mode because no AI provider key is configured.",
      ...summaryLines,
      holdingsLines.length ? 'Positions:' : 'No positions on record.',
      ...holdingsLines,
      `Asked: "${question}"`,
    ]
      .filter(Boolean)
      .join('\n');
  }
}
