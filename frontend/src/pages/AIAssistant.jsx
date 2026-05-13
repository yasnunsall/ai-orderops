import { useState, useRef, useEffect } from 'react'
import ReactMarkdown from 'react-markdown'
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react'
import { sendChatMessage } from '../services/api'

const SUGGESTED = [
  '128 numaralı siparişim nerede?',
  'Stok durumu nedir?',
  'Bugün ne yapmam gerekiyor?',
  'Geciken kargolar var mı?',
  'Kritik stoktaki ürünler neler?',
  '103 numaralı siparişin durumu?',
]

const INTENT_LABEL = {
  order_status:     '📦 Sipariş Sorgusu',
  stock_query:      '📊 Stok Sorgusu',
  delayed_shipping: '🚚 Kargo Takibi',
  daily_summary:    '📋 Günlük Özet',
  general_help:     '💬 Genel Yardım',
}

const WELCOME = {
  role: 'assistant',
  content:
    'Merhaba! Ben **AI OrderOps** asistanınızım. 👋\n\n' +
    'Aşağıdaki konularda size yardımcı olabilirim:\n\n' +
    '📦 **Sipariş Sorgulama** — "128 numaralı siparişim nerede?"\n' +
    '📊 **Stok Durumu** — "Stok durumu nedir?"\n' +
    '🚚 **Kargo Takibi** — "Geciken kargolar var mı?"\n' +
    '📋 **Günlük Özet** — "Bugün ne yapmam gerekiyor?"\n\n' +
    'Nasıl yardımcı olabilirim?',
  intent: null,
}

export default function AIAssistant() {
  const [messages, setMessages] = useState([WELCOME])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  async function sendMessage(text) {
    const msg = (text ?? input).trim()
    if (!msg || loading) return
    setInput('')
    setMessages((prev) => [...prev, { role: 'user', content: msg }])
    setLoading(true)
    try {
      const res = await sendChatMessage(msg)
      setMessages((prev) => [
        ...prev,
        { role: 'assistant', content: res.data.message, intent: res.data.intent },
      ])
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          role: 'assistant',
          content: '❌ Backend\'e bağlanılamadı. Lütfen backend\'in çalıştığından emin olun.',
          intent: null,
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex flex-col h-full" style={{ height: 'calc(100vh - 3rem)' }}>
      {/* Header */}
      <div className="mb-4 flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">AI Asistan</h2>
          <p className="text-slate-500 text-sm mt-0.5">Sipariş, stok ve kargo sorularınızı yanıtlar</p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 bg-white border border-slate-200 rounded-full px-3 py-1.5">
          <Sparkles size={12} className="text-blue-400" />
          Gemini AI destekli
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-y-auto p-4 space-y-4 min-h-0">
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
            {/* Avatar */}
            <div
              className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                msg.role === 'user' ? 'bg-blue-600' : 'bg-slate-700'
              }`}
            >
              {msg.role === 'user' ? (
                <User size={15} className="text-white" />
              ) : (
                <Bot size={15} className="text-white" />
              )}
            </div>

            {/* Bubble */}
            <div
              className={`flex flex-col gap-1 max-w-[78%] ${
                msg.role === 'user' ? 'items-end' : 'items-start'
              }`}
            >
              {msg.intent && INTENT_LABEL[msg.intent] && (
                <span className="text-[10px] text-slate-400 px-1">
                  {INTENT_LABEL[msg.intent]}
                </span>
              )}
              <div
                className={`rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white rounded-tr-sm'
                    : 'bg-slate-100 text-slate-800 rounded-tl-sm'
                }`}
              >
                {msg.role === 'assistant' ? (
                  <div className="prose-chat">
                    <ReactMarkdown>{msg.content}</ReactMarkdown>
                  </div>
                ) : (
                  msg.content
                )}
              </div>
            </div>
          </div>
        ))}

        {/* Typing indicator */}
        {loading && (
          <div className="flex gap-3">
            <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center flex-shrink-0">
              <Bot size={15} className="text-white" />
            </div>
            <div className="bg-slate-100 rounded-2xl rounded-tl-sm px-4 py-3 flex items-center gap-2">
              <Loader2 size={15} className="animate-spin text-slate-400" />
              <span className="text-sm text-slate-400">Analiz ediliyor...</span>
            </div>
          </div>
        )}
        <div ref={bottomRef} />
      </div>

      {/* Suggested messages */}
      <div className="mt-3 flex flex-wrap gap-2">
        {SUGGESTED.map((s, i) => (
          <button
            key={i}
            onClick={() => sendMessage(s)}
            disabled={loading}
            className="text-xs bg-white border border-slate-200 rounded-full px-3 py-1.5 text-slate-600
                       hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 transition-colors
                       disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {s}
          </button>
        ))}
      </div>

      {/* Input bar */}
      <div className="mt-3 flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
              e.preventDefault()
              sendMessage()
            }
          }}
          placeholder='Mesajınızı yazın... (örn: "128 numaralı sipariş nerede?")'
          disabled={loading}
          className="flex-1 border border-slate-200 rounded-xl px-4 py-3 text-sm
                     focus:outline-none focus:ring-2 focus:ring-blue-500
                     disabled:opacity-50 bg-white"
        />
        <button
          onClick={() => sendMessage()}
          disabled={!input.trim() || loading}
          className="bg-blue-600 text-white rounded-xl px-4 py-3 hover:bg-blue-700
                     transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Send size={18} />
        </button>
      </div>
    </div>
  )
}
