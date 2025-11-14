export type ApiUser = {
  id: number;
  email: string;
};

export type AuthResponse = {
  user: ApiUser;
  token: string;
};

export type PortfolioHolding = {
  id: number;
  symbol: string;
  quantity: number;
  averageCost: number;
  currentPrice: number;
  marketValue: number;
  updatedAt: string;
};

export type PortfolioSummary = {
  totalValue: number;
  cashBalance: number;
  investedValue: number;
};

export type PortfolioPayload = {
  summary: PortfolioSummary;
  holdings: PortfolioHolding[];
};

export type ChatMessage = {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  createdAt: string;
};

export type ChatResponse = {
  userMessage: ChatMessage;
  aiMessage: ChatMessage;
};

