import { useState, useRef, useEffect } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

function App() {
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const sendMessage = async () => {
    if (!input.trim() || loading) return

    const userMessage: Message = { role: 'user', content: input }
    setMessages(prev => [...prev, userMessage])
    setInput('')
    setLoading(true)

    const assistantMessage: Message = { role: 'assistant', content: '' }
    setMessages(prev => [...prev, assistantMessage])

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: { content: input, id: Date.now().toString(), role: 'user' },
          threadId: 'thread_1',
          responseId: Date.now().toString()
        })
      })

      const reader = response.body!.getReader()
      const decoder = new TextDecoder()

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        const chunk = decoder.decode(value)
        setMessages(prev => {
          const updated = [...prev]
          updated[updated.length - 1] = {
            role: 'assistant',
            content: updated[updated.length - 1].content + chunk
          }
          return updated
        })
      }
    } catch (err) {
      setMessages(prev => {
        const updated = [...prev]
        updated[updated.length - 1] = {
          role: 'assistant',
          content: 'Error: Could not get a response. Check the backend.'
        }
        return updated
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100vh',
      backgroundColor: '#0a0f1e', color: '#ffffff',
      fontFamily: 'sans-serif', maxWidth: '800px', margin: '0 auto'
    }}>
      {/* Header */}
      <div style={{
        padding: '20px', borderBottom: '1px solid #1e293b',
        backgroundColor: '#0f172a', textAlign: 'center'
      }}>
        <h1 style={{ margin: 0, color: '#3b82f6', fontSize: '22px' }}>
          📈 AI Stock Analysis Assistant
        </h1>
        <p style={{ margin: '4px 0 0', color: '#64748b', fontSize: '13px' }}>
          Powered by Groq + LlaMA 3.3 70B
        </p>
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        {messages.length === 0 && (
          <div style={{ textAlign: 'center', color: '#475569', marginTop: '60px' }}>
            <div style={{ fontSize: '48px' }}>📊</div>
            <p style={{ fontSize: '16px' }}>Ask me anything about stocks!</p>
            <p style={{ fontSize: '13px' }}>Try: "What is Apple's stock price?" or "Latest news on NVIDIA"</p>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} style={{
            display: 'flex',
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start'
          }}>
            <div style={{
              maxWidth: '75%', padding: '12px 16px', borderRadius: '16px',
              backgroundColor: msg.role === 'user' ? '#3b82f6' : '#1e293b',
              color: '#ffffff', fontSize: '14px', lineHeight: '1.6',
              whiteSpace: 'pre-wrap'
            }}>
              {msg.content || (loading && i === messages.length - 1
                ? <span style={{ color: '#64748b' }}>Thinking...</span>
                : '')}
            </div>
          </div>
        ))}
        <div ref={bottomRef} />
      </div>

      {/* Input */}
      <div style={{
        padding: '16px', borderTop: '1px solid #1e293b',
        backgroundColor: '#0f172a', display: 'flex', gap: '10px'
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => e.key === 'Enter' && sendMessage()}
          placeholder='Ask about any stock... (e.g. AAPL, TSLA, NVDA)'
          disabled={loading}
          style={{
            flex: 1, padding: '12px 16px', borderRadius: '10px',
            border: '1px solid #1e293b', backgroundColor: '#1e293b',
            color: '#ffffff', fontSize: '14px', outline: 'none'
          }}
        />
        <button
          onClick={sendMessage}
          disabled={loading || !input.trim()}
          style={{
            padding: '12px 24px', borderRadius: '10px', border: 'none',
            backgroundColor: loading ? '#1e3a5f' : '#3b82f6',
            color: '#ffffff', fontSize: '14px', cursor: loading ? 'not-allowed' : 'pointer',
            fontWeight: 'bold'
          }}
        >
          {loading ? '...' : 'Send'}
        </button>
      </div>
    </div>
  )
}

export default App