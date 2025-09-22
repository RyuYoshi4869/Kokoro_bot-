import Link from "next/link";   // ← これを一番上に追加！

export default function Home() {
  return (
    <main>
      <h1>Next.js</h1>
      <p>Get started by editing app/page.tsx</p>

      {/* 👇 この1行を追加 */}
      <p><Link href="/chat">こころBotチャットへ →</Link></p>
    </main>
  );
}

'use client';
import React, { useState } from 'react';

type Role = 'user' | 'assistant';
type Mood = 'anxious' | 'lonely' | 'tired' | 'angry' | 'ok';
type ChatResponse = { reply: string; mood: Mood; risk: boolean };

function Bubble({ role, text }: { role: Role; text: string }) {
  const isUser = role === 'user';
  return (
    <div style={{ display: 'flex', justifyContent: isUser ? 'flex-end' : 'flex-start', margin: '8px 0' }}>
      <div style={{
        maxWidth: '80%',
        padding: '8px 12px',
        borderRadius: 16,
        background: isUser ? '#000' : '#f3f4f6',
        color: isUser ? '#fff' : '#111',
        boxShadow: '0 1px 3px rgba(0,0,0,0.1)'
      }}>
        {text}
      </div>
    </div>
  );
}

export default function ChatPage() {
  const [messages, setMessages] = useState<{role: Role; content: string}[]>([]);
  const [input, setInput] = useState('');
  const [userId, setUserId] = useState('user001');
  const [sessionId, setSessionId] = useState('session001');
  const [loading, setLoading] = useState(false);

  async function sendMessage() {
    const text = input.trim();
    if (!text) return;
    setInput('');
    setMessages(m => [...m, { role: 'user', content: text }]);
    setLoading(true);
    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, sessionId, message: text })
      });
      const data: ChatResponse | { error: string } = await res.json();
      if ('error' in data) throw new Error(data.error);
      setMessages(m => [...m, { role: 'assistant', content: data.reply }]);
    } catch {
      setMessages(m => [...m, { role: 'assistant', content: 'エラーが発生しました。少し待って再度お試しください。' }]);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight: '100vh', padding: 16, display: 'flex', justifyContent: 'center' }}>
      <div style={{ width: '100%', maxWidth: 720 }}>
        <h1 style={{ fontSize: 20, fontWeight: 600, marginBottom: 8 }}>こころBot</h1>
        <p style={{ color: '#6b7280', marginBottom: 12 }}>子育て中のママに寄り添う共感チャット</p>
        <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
          <input style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '6px 8px' }}
                 placeholder="user id" value={userId} onChange={e => setUserId(e.target.value)} />
          <input style={{ border: '1px solid #e5e7eb', borderRadius: 6, padding: '6px 8px' }}
                 placeholder="session id" value={sessionId} onChange={e => setSessionId(e.target.value)} />
        </div>
        <div style={{ border: '1px solid #e5e7eb', borderRadius: 10, padding: 12, height: '60vh', overflowY: 'auto', background: '#fff' }}>
          {messages.length === 0 && <div style={{ color: '#6b7280' }}>メッセージを入力して送信してください。</div>}
          {messages.map((m, i) => <Bubble key={i} role={m.role} text={m.content} />)}
        </div>
        <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
          <input
            style={{ flex: 1, border: '1px solid #e5e7eb', borderRadius: 6, padding: '8px 10px' }}
            placeholder="ここに入力（Enterで送信）"
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter') sendMessage(); }}
          />
          <button
            onClick={sendMessage}
            disabled={loading}
            style={{ padding: '8px 16px', borderRadius: 6, background: '#000', color: '#fff', opacity: loading ? 0.6 : 1 }}
          >
            {loading ? '送信中…' : '送信'}
          </button>
        </div>
      </div>
    </div>
  );
}
