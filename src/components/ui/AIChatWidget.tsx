import React, { useState, useRef, useEffect } from 'react'
import { MessageCircle, X, Send, Bot, User, Minimize2, Maximize2, Loader2 } from 'lucide-react'
import { clsx } from '../../utils'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
  timestamp: Date
}

const QUICK_ACTIONS = [
  '📦 Como está minha produção hoje?',
  '💰 Qual produto tem maior margem?',
  '🎂 Dica para reduzir desperdício',
  '📈 Como aumentar ticket médio?',
]

const SYSTEM_CONTEXT = `Você é o Docinho 🍰, assistente inteligente de um sistema SaaS para confeitarias.
Você ajuda confeiteiras e confeiteiros com:
- Gestão de pedidos, clientes e produtos
- Precificação e cálculo de margens
- Redução de desperdício de ingredientes
- Previsão de demanda e planejamento
- Automação de vendas e WhatsApp
- Dicas práticas de confeitaria e negócios

Responda sempre em português brasileiro, de forma simpática, prática e objetiva.
Use emojis com moderação. Máximo 4 parágrafos por resposta.
Se perguntarem sobre dados específicos do sistema (pedidos do dia, estoque, etc.),
diga que pode verificar no painel e ofereça orientações gerais.`

export default function AIChatWidget() {
  const [open, setOpen] = useState(false)
  const [minimized, setMinimized] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '0',
      role: 'assistant',
      content: 'Olá! Sou o **Docinho** 🍰, seu assistente de confeitaria!\n\nPosso te ajudar com precificação, gestão de pedidos, redução de desperdício e muito mais. Como posso ajudar hoje?',
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [unread, setUnread] = useState(0)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    if (open) {
      setUnread(0)
      setTimeout(() => inputRef.current?.focus(), 100)
    }
  }, [open])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const formatMessage = (text: string) => {
    return text
      .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
      .replace(/\*(.*?)\*/g, '<em>$1</em>')
      .replace(/\n/g, '<br/>')
  }

  const sendMessage = async (text: string) => {
    if (!text.trim() || loading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: text.trim(),
      timestamp: new Date(),
    }

    setMessages(m => [...m, userMsg])
    setInput('')
    setLoading(true)

    try {
      const history = messages.slice(-8).map(m => ({
        role: m.role,
        content: m.content,
      }))

      const res = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'anthropic-dangerous-allow-browser': 'true',
        },
        body: JSON.stringify({
          model: 'claude-haiku-4-5-20251001',
          max_tokens: 600,
          system: SYSTEM_CONTEXT,
          messages: [
            ...history,
            { role: 'user', content: text.trim() },
          ],
        }),
      })

      const data = await res.json()
      const reply = data.content?.[0]?.text || 'Desculpe, não consegui processar sua pergunta. Tente novamente!'

      const assistantMsg: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: reply,
        timestamp: new Date(),
      }

      setMessages(m => [...m, assistantMsg])
      if (!open) setUnread(u => u + 1)
    } catch (err) {
      setMessages(m => [...m, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '⚠️ Não consegui conectar à IA agora. Verifique sua conexão e tente novamente.',
        timestamp: new Date(),
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      sendMessage(input)
    }
  }

  return (
    <>
      {/* Floating button */}
      <button
        onClick={() => setOpen(o => !o)}
        className={clsx(
          'fixed bottom-6 right-6 z-50 w-14 h-14 rounded-2xl shadow-warm-lg',
          'bg-gradient-to-br from-chocolate-700 to-chocolate-900',
          'flex items-center justify-center transition-all duration-300',
          'hover:scale-110 hover:shadow-xl',
          open ? 'rotate-0' : 'animate-bounce-subtle'
        )}
        title="Assistente IA"
      >
        {open ? (
          <X size={22} className="text-cream-100" />
        ) : (
          <>
            <MessageCircle size={22} className="text-cream-100" />
            {unread > 0 && (
              <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {unread}
              </span>
            )}
          </>
        )}
      </button>

      {/* Chat window */}
      {open && (
        <div className={clsx(
          'fixed bottom-24 right-6 z-50 w-96 bg-white rounded-2xl shadow-2xl border border-cream-100',
          'flex flex-col transition-all duration-300',
          minimized ? 'h-14' : 'h-[520px]'
        )}>
          {/* Header */}
          <div className="flex items-center gap-3 px-4 py-3 bg-gradient-to-r from-chocolate-800 to-chocolate-900 rounded-t-2xl flex-shrink-0">
            <div className="w-8 h-8 rounded-xl bg-cream-100/20 flex items-center justify-center text-lg">
              🍰
            </div>
            <div className="flex-1 min-w-0">
              <p className="font-display font-bold text-cream-50 text-sm">Docinho IA</p>
              <p className="text-chocolate-300 text-xs">Assistente de confeitaria</p>
            </div>
            <div className="flex items-center gap-1">
              <span className="w-2 h-2 bg-green-400 rounded-full" />
              <span className="text-xs text-green-300 mr-2">Online</span>
              <button
                onClick={() => setMinimized(m => !m)}
                className="p-1.5 hover:bg-white/10 rounded-lg text-cream-200 transition-colors"
              >
                {minimized ? <Maximize2 size={14} /> : <Minimize2 size={14} />}
              </button>
            </div>
          </div>

          {!minimized && (
            <>
              {/* Messages */}
              <div className="flex-1 overflow-y-auto p-4 space-y-3 bg-cream-50/50">
                {messages.map(msg => (
                  <div
                    key={msg.id}
                    className={clsx(
                      'flex gap-2.5',
                      msg.role === 'user' ? 'flex-row-reverse' : 'flex-row'
                    )}
                  >
                    {/* Avatar */}
                    <div className={clsx(
                      'w-7 h-7 rounded-xl flex items-center justify-center flex-shrink-0 mt-0.5',
                      msg.role === 'user'
                        ? 'bg-chocolate-700'
                        : 'bg-amber-100'
                    )}>
                      {msg.role === 'user'
                        ? <User size={13} className="text-cream-100" />
                        : <span className="text-sm">🍰</span>
                      }
                    </div>

                    {/* Bubble */}
                    <div className={clsx(
                      'max-w-[78%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed',
                      msg.role === 'user'
                        ? 'bg-chocolate-800 text-cream-50 rounded-tr-sm'
                        : 'bg-white border border-cream-200 text-mocha-800 rounded-tl-sm shadow-sm'
                    )}>
                      <p
                        dangerouslySetInnerHTML={{ __html: formatMessage(msg.content) }}
                        className="leading-relaxed"
                      />
                      <p className={clsx(
                        'text-[10px] mt-1',
                        msg.role === 'user' ? 'text-chocolate-300 text-right' : 'text-mocha-300'
                      )}>
                        {msg.timestamp.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}

                {/* Loading */}
                {loading && (
                  <div className="flex gap-2.5">
                    <div className="w-7 h-7 rounded-xl bg-amber-100 flex items-center justify-center flex-shrink-0">
                      <span className="text-sm">🍰</span>
                    </div>
                    <div className="bg-white border border-cream-200 rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                      <div className="flex items-center gap-1.5">
                        <div className="w-2 h-2 bg-mocha-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                        <div className="w-2 h-2 bg-mocha-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                        <div className="w-2 h-2 bg-mocha-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Quick actions */}
              {messages.length <= 1 && (
                <div className="px-3 py-2 border-t border-cream-100 bg-white">
                  <p className="text-xs text-mocha-400 mb-2">Perguntas rápidas:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {QUICK_ACTIONS.map(action => (
                      <button
                        key={action}
                        onClick={() => sendMessage(action)}
                        className="text-xs bg-cream-100 hover:bg-cream-200 text-mocha-700 px-2.5 py-1.5 rounded-xl transition-colors text-left leading-snug"
                      >
                        {action}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Input */}
              <div className="flex items-center gap-2 px-3 py-3 border-t border-cream-100 bg-white rounded-b-2xl">
                <input
                  ref={inputRef}
                  className="flex-1 bg-cream-50 border border-cream-200 rounded-xl px-3.5 py-2.5 text-sm text-mocha-900 placeholder-mocha-300 focus:outline-none focus:border-chocolate-400 focus:ring-1 focus:ring-chocolate-200 transition-all"
                  placeholder="Pergunte qualquer coisa..."
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  disabled={loading}
                />
                <button
                  onClick={() => sendMessage(input)}
                  disabled={!input.trim() || loading}
                  className={clsx(
                    'w-10 h-10 rounded-xl flex items-center justify-center transition-all flex-shrink-0',
                    input.trim() && !loading
                      ? 'bg-chocolate-800 hover:bg-chocolate-700 text-cream-100 shadow-sm'
                      : 'bg-cream-100 text-mocha-300 cursor-not-allowed'
                  )}
                >
                  {loading ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                </button>
              </div>
            </>
          )}
        </div>
      )}
    </>
  )
}
