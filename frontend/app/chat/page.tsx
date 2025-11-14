"use client";

import { useEffect, useMemo, useState } from "react";
import { useAuth } from "@/context/auth-context";
import { chatApi } from "@/lib/api";
import { ChatMessage } from "@/lib/types";
import { PageHeader } from "@/components/page-header";
import { RequireAuth } from "@/components/require-auth";
import { ChatWindow } from "@/components/chat-window";

export default function ChatPage() {
  const { token, loading } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [fetching, setFetching] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      return;
    }
    const fetchMessages = async () => {
      setFetching(true);
      setError("");
      try {
        const data = await chatApi.list(token);
        setMessages(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unable to load chat history");
      } finally {
        setFetching(false);
      }
    };
    fetchMessages();
  }, [token]);

  const sortedMessages = useMemo(
    () => [...messages].sort((a, b) => a.id - b.id),
    [messages],
  );

  const handleSend = async () => {
    if (!token || !input.trim()) {
      return;
    }
    setSending(true);
    setError("");
    try {
      const response = await chatApi.send(token, input);
      setMessages((prev) => [...prev, response.userMessage, response.aiMessage]);
      setInput("");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send message");
    } finally {
      setSending(false);
    }
  };

  if (!loading && !token) {
    return (
      <RequireAuth
        title="Sign in to chat"
        description="Authenticate to ask AI questions about your holdings."
      />
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Portfolio copilot"
        description="The assistant includes your latest holdings and cash details as context for every answer."
      />

      {error ? (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {fetching && !messages.length ? (
        <div className="rounded-2xl border border-slate-200 bg-white p-6 text-sm text-slate-500">
          Loading chat history...
        </div>
      ) : null}

      {token ? (
        <ChatWindow
          messages={sortedMessages}
          input={input}
          onInputChange={setInput}
          onSend={handleSend}
          sending={sending}
        />
      ) : null}
    </div>
  );
}

