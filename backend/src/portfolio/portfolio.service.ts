import { Injectable, Logger, InternalServerErrorException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../prisma/prisma.service';
import { ConfigService } from '@nestjs/config';
import axios from 'axios';

type AlpacaAccount = {
  cash: string;
  portfolio_value?: string;
};

type AlpacaPosition = {
  symbol: string;
  qty: string;
  avg_entry_price?: string;
  current_price?: string;
  market_value?: string;
  unrealized_pl?: string;
};

@Injectable()
export class PortfolioService {
  private readonly logger = new Logger(PortfolioService.name);

  constructor(
    private readonly prisma: PrismaService,
    private readonly configService: ConfigService,
  ) {}

  async getPortfolio(userId: number) {
    const [holdings, account] = await Promise.all([
      this.prisma.portfolioHolding.findMany({
        where: { userId },
        orderBy: { symbol: 'asc' },
      }),
      this.prisma.portfolioAccount.findUnique({
        where: { userId },
      }),
    ]);

    const mappedHoldings = holdings.map((holding) => ({
      id: holding.id,
      symbol: holding.symbol,
      quantity: holding.quantity.toNumber(),
      averageCost: holding.averageCost?.toNumber() ?? 0,
      currentPrice: holding.currentPrice?.toNumber() ?? 0,
      marketValue: holding.marketValue?.toNumber() ?? 0,
      updatedAt: holding.updatedAt,
    }));

    const investedValue = mappedHoldings.reduce(
      (sum, holding) => sum + holding.marketValue,
      0,
    );
    const cashBalance = account ? account.cashBalance.toNumber() : 0;

    return {
      summary: {
        totalValue: investedValue + cashBalance,
        cashBalance,
        investedValue,
      },
      holdings: mappedHoldings,
    };
  }

  async syncPortfolio(userId: number) {
    const { account, positions } = await this.fetchAlpacaData();

    await this.prisma.$transaction(async (tx: Prisma.TransactionClient) => {
      await tx.portfolioHolding.deleteMany({ where: { userId } });

      if (positions.length) {
        await tx.portfolioHolding.createMany({
          data: positions.map((position) => ({
            userId,
            symbol: position.symbol,
            quantity: new Prisma.Decimal(position.qty),
            averageCost: new Prisma.Decimal(position.avg_entry_price ?? 0),
            currentPrice: new Prisma.Decimal(position.current_price ?? 0),
            marketValue: new Prisma.Decimal(position.market_value ?? 0),
          })),
        });
      }

      await tx.portfolioAccount.upsert({
        where: { userId },
        update: {
          cashBalance: new Prisma.Decimal(account.cash ?? 0),
        },
        create: {
          userId,
          cashBalance: new Prisma.Decimal(account.cash ?? 0),
        },
      });
    });

    return this.getPortfolio(userId);
  }

  async buildPortfolioContext(userId: number) {
    const portfolio = await this.getPortfolio(userId);
    const lines = [
      `Total value: $${portfolio.summary.totalValue.toFixed(2)}`,
      `Cash balance: $${portfolio.summary.cashBalance.toFixed(2)}`,
      `Invested value: $${portfolio.summary.investedValue.toFixed(2)}`,
      'Holdings:',
      ...portfolio.holdings.map(
        (holding) =>
          `- ${holding.symbol}: ${holding.quantity.toFixed(
            4,
          )} shares @ $${holding.currentPrice.toFixed(
            2,
          )} (${holding.marketValue.toFixed(2)})`,
      ),
    ];

    if (!portfolio.holdings.length) {
      lines.push('- No holdings on record. Try syncing with Alpaca.');
    }

    return lines.join('\n');
  }

  private async fetchAlpacaData(): Promise<{
    account: AlpacaAccount;
    positions: AlpacaPosition[];
  }> {
    const apiKey = this.configService.get<string>('ALPACA_API_KEY');
    const secretKey = this.configService.get<string>('ALPACA_SECRET_KEY');
    const baseUrl =
      this.configService.get<string>('ALPACA_BASE_URL') ??
      'https://paper-api.alpaca.markets';

    if (!apiKey || !secretKey) {
      this.logger.warn(
        'Alpaca API keys are missing. Using mock data so the app stays functional.',
      );
      return this.mockPortfolio();
    }

    const headers = {
      'APCA-API-KEY-ID': apiKey,
      'APCA-API-SECRET-KEY': secretKey,
    };

    try {
      const [accountResponse, positionsResponse] = await Promise.all([
        axios.get(`${baseUrl}/v2/account`, { headers }),
        axios.get(`${baseUrl}/v2/positions`, { headers }),
      ]);

      return {
        account: accountResponse.data,
        positions: Array.isArray(positionsResponse.data)
          ? positionsResponse.data
          : [],
      };
    } catch (error) {
      this.logger.error('Failed to fetch data from Alpaca', error as Error);
      throw new InternalServerErrorException(
        'Unable to reach the Alpaca API right now.',
      );
    }
  }

  private mockPortfolio() {
    return {
      account: {
        cash: '4500.32',
        portfolio_value: '21500.76',
      },
      positions: [
        {
          symbol: 'AAPL',
          qty: '10',
          avg_entry_price: '150.00',
          current_price: '188.20',
          market_value: '1882.00',
          unrealized_pl: '382.00',
        },
        {
          symbol: 'MSFT',
          qty: '5.5',
          avg_entry_price: '305.00',
          current_price: '330.10',
          market_value: '1815.55',
          unrealized_pl: '138.05',
        },
      ] as AlpacaPosition[],
    };
  }
}

