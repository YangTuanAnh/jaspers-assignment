import Link from 'next/link';

type Props = {
  title: string;
  description: string;
};

export const RequireAuth = ({ title, description }: Props) => {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white/70 p-10 text-center">
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
      <p className="mt-3 text-slate-500">{description}</p>
      <Link
        href="/auth"
        className="mt-6 inline-flex items-center rounded-full bg-indigo-600 px-5 py-2 text-sm font-medium text-white"
      >
        Go to auth page
      </Link>
    </div>
  );
};

