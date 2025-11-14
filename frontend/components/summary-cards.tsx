import { PortfolioSummary } from '@/lib/types';

type Props = {
  summary: PortfolioSummary;
};

const formatter = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

const cards = [
  { key: 'totalValue', label: 'Total Value' },
  { key: 'investedValue', label: 'Invested' },
  { key: 'cashBalance', label: 'Cash Balance' },
] as const;

export const SummaryCards = ({ summary }: Props) => {
  return (
    <div className="grid gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.key}
          className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm"
        >
          <p className="text-sm text-slate-500">{card.label}</p>
          <p className="mt-2 text-2xl font-semibold text-slate-900">
            {formatter.format(summary[card.key])}
          </p>
        </div>
      ))}
    </div>
  );
};

