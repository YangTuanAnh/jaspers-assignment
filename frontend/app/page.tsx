import Link from 'next/link';

const highlights = [
  {
    title: 'Secure authentication',
    description:
      'JWT-based auth with hashed credentials keeps your workspace safe.',
  },
  {
    title: 'Alpaca sync',
    description:
      'Pull cash balances and open positions directly from the Alpaca paper API.',
  },
  {
    title: 'AI portfolio chat',
    description:
      'Send questions to Claude/OpenAI with your holdings as structured context.',
  },
];

export default function Home() {
  return (
    <div className="rounded-3xl border border-slate-200 bg-white/90 p-10 shadow-lg">
      <div className="space-y-6">
        <p className="text-sm font-semibold uppercase tracking-wide text-indigo-600">
          Technical Assessment
        </p>
        <h1 className="text-4xl font-semibold text-slate-900">
          Jaspers AI – Portfolio Copilot
        </h1>
        <p className="text-lg text-slate-600">
          Minimal full-stack build that demonstrates authentication, Alpaca data
          ingestion, and an AI chat UI. Use it as a reference implementation or
          jump straight in to test the features.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/auth"
            className="inline-flex items-center rounded-full bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500"
          >
            Get started
          </Link>
          <Link
            href="/dashboard"
            className="inline-flex items-center rounded-full border border-slate-300 px-6 py-3 text-sm font-semibold text-slate-800 transition hover:border-slate-400"
          >
            View dashboard
          </Link>
        </div>
      </div>

      <div className="mt-10 grid gap-6 md:grid-cols-3">
        {highlights.map((item) => (
          <div
            key={item.title}
            className="rounded-2xl border border-slate-100 bg-slate-50 p-6"
          >
            <h3 className="text-base font-semibold text-slate-900">
              {item.title}
            </h3>
            <p className="mt-2 text-sm text-slate-600">{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
