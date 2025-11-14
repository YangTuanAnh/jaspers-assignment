import { PortfolioHolding } from '@/lib/types';

type Props = {
  holdings: PortfolioHolding[];
};

const currency = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
});

export const HoldingsTable = ({ holdings }: Props) => {
  if (!holdings.length) {
    return (
      <div className="rounded-2xl border border-dashed border-slate-300 bg-white/50 p-8 text-center text-slate-500">
        No holdings yet. Use the “Sync portfolio” button to pull fresh data
        from Alpaca.
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Symbol</th>
            <th className="px-4 py-3">Quantity</th>
            <th className="px-4 py-3">Avg Cost</th>
            <th className="px-4 py-3">Price</th>
            <th className="px-4 py-3">Market Value</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100 bg-white text-slate-900">
          {holdings.map((holding) => (
            <tr key={holding.id}>
              <td className="px-4 py-3 font-semibold">{holding.symbol}</td>
              <td className="px-4 py-3">
                {Number(holding.quantity).toLocaleString('en-US', {
                  maximumFractionDigits: 4,
                })}
              </td>
              <td className="px-4 py-3">{currency.format(holding.averageCost)}</td>
              <td className="px-4 py-3">{currency.format(holding.currentPrice)}</td>
              <td className="px-4 py-3 font-semibold">
                {currency.format(holding.marketValue)}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

