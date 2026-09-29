import { useState, useRef, useEffect } from 'react'
import api from '../../services/api'

function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState([
    { sender: 'ai', text: "Hi! I'm your GoalGenie AI advisor. Ask me anything about your savings goals." }
  ])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const bottomRef = useRef(null)

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages, loading, isOpen])

  const handleSend = async (e) => {
    e.preventDefault()
    const text = input.trim()
    if (!text || loading) return

    // Welcome message bad diye ager kotha gulo history hishebe pathabo
    const history = messages.slice(1).map((m) => ({
      role: m.sender === 'user' ? 'user' : 'assistant',
      content: m.text,
    }))

    setMessages((prev) => [...prev, { sender: 'user', text }])
    setInput('')
    setLoading(true)

    try {
      const res = await api.post('/advisor/ask', { message: text, history })
      setMessages((prev) => [...prev, { sender: 'ai', text: res.data.reply }])
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: err.response?.data?.message || 'Sorry, something went wrong. Please try again.',
        },
      ])
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-6 right-6 w-16 h-16 rounded-full bg-primary hover:bg-primary-hover shadow-lg shadow-primary/40 flex items-center justify-center text-3xl text-white z-50 transition-transform hover:scale-105"
      >
        {isOpen ? '✕' : '🤖'}
      </button>

      {/* Chat Panel */}
      {isOpen && (
        <div className="fixed bottom-24 right-6 w-[24rem] sm:w-[26rem] h-[36rem] bg-white rounded-3xl border border-gray-300/60 shadow-2xl flex flex-col z-50 overflow-hidden">

          {/* Header */}
          <div className="bg-gradient-to-r from-primary to-indigo-700 p-5 flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center text-xl">
              🧞
            </div>
            <div>
              <p className="text-white font-semibold text-base">GoalGenie Advisor</p>
              <p className="text-indigo-100 text-sm">Knows your goals, always here to help</p>
            </div>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4 bg-gray-50">
            {messages.map((msg, idx) => (
              <div
                key={idx}
                className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[80%] px-4 py-3 rounded-2xl text-base leading-relaxed whitespace-pre-wrap ${
                    msg.sender === 'user'
                      ? 'bg-primary text-white rounded-br-sm'
                      : 'bg-white border border-gray-200 text-gray-700 rounded-bl-sm'
                  }`}
                >
                  {msg.text}
                </div>
              </div>
            ))}

            {loading && (
              <div className="flex justify-start">
                <div className="bg-white border border-gray-200 text-gray-400 px-4 py-3 rounded-2xl rounded-bl-sm text-base">
                  🧞 Thinking...
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <form onSubmit={handleSend} className="p-4 border-t border-gray-200 flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about your goals..."
              disabled={loading}
              className="flex-1 px-4 py-3 border border-gray-300 rounded-xl text-base focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent disabled:bg-gray-50"
            />
            <button
              type="submit"
              disabled={loading}
              className="w-11 h-11 rounded-xl bg-primary hover:bg-primary-hover disabled:opacity-60 text-white flex items-center justify-center shrink-0 transition-colors text-lg"
            >
              →
            </button>
          </form>
        </div>
      )}
    </>
  )
}

export default ChatWidget