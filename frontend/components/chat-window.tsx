'use client';

import { FormEvent } from 'react';
import { ChatMessage } from '@/lib/types';

type Props = {
  messages: ChatMessage[];
  input: string;
  onInputChange: (value: string) => void;
  onSend: () => Promise<void>;
  sending: boolean;
};

export const ChatWindow = ({
  messages,
  input,
  onInputChange,
  onSend,
  sending,
}: Props) => {
  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!input.trim() || sending) {
      return;
    }
    await onSend();
  };

  return (
    <div className="flex h-full flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="flex-1 space-y-3 overflow-y-auto p-5">
        {messages.length === 0 ? (
          <div className="rounded-2xl bg-slate-50 p-6 text-center text-slate-500">
            Ask anything about your portfolio. For example: “What is my biggest
            holding?” or “How much cash do I have?”
          </div>
        ) : (
          messages.map((message) => (
            <div
              key={message.id}
              className={`max-w-xl rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                message.role === 'user'
                  ? 'ml-auto bg-indigo-600 text-white'
                  : 'bg-slate-100 text-slate-800'
              }`}
            >
              <p className="whitespace-pre-line">{message.content}</p>
              <span className="mt-2 block text-xs opacity-70">
                {new Date(message.createdAt).toLocaleTimeString(undefined, {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </span>
            </div>
          ))
        )}
      </div>
      <form
        onSubmit={handleSubmit}
        className="border-t border-slate-100 p-4 sm:flex sm:items-end sm:gap-4"
      >
        <textarea
          value={input}
          onChange={(event) => onInputChange(event.target.value)}
          rows={2}
          className="w-full flex-1 rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
          placeholder="Ask a question about your portfolio..."
        />
        <button
          type="submit"
          disabled={sending}
          className="mt-3 inline-flex items-center justify-center rounded-2xl bg-indigo-600 px-6 py-3 text-sm font-semibold text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-70 sm:mt-0"
        >
          {sending ? 'Thinking...' : 'Send'}
        </button>
      </form>
    </div>
  );
};

