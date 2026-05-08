'use client'

import { useState } from 'react'
import { supabase } from '../../lib/supabase'

export default function Login() {
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleLogin() {
    setLoading(true)
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: { emailRedirectTo: 'http://localhost:3000' }
    })
    if (!error) setSent(true)
    setLoading(false)
  }

  return (
    <main className="min-h-screen bg-black text-white flex flex-col items-center justify-center px-4">
      <h1 className="text-xl font-medium text-center mb-2 text-gray-100">
        For the Memory and Legacy of Abbas!
      </h1>
      <p className="text-gray-600 text-sm mb-12">sign in to begin tracking</p>

      {sent ? (
        <div className="text-center">
          <p className="text-gray-300 mb-2">Check your email ✓</p>
          <p className="text-gray-600 text-sm">click the link we sent to {email}</p>
        </div>
      ) : (
        <div className="flex flex-col gap-4 w-full max-w-xs">
          <input
            type="email"
            placeholder="your@email.com"
            value={email}
            onChange={e => setEmail(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleLogin()}
            className="bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-white placeholder-gray-600 focus:outline-none focus:border-gray-400"
          />
          <button
            onClick={handleLogin}
            disabled={loading || !email}
            className="bg-white text-black rounded-lg px-4 py-3 font-medium disabled:opacity-30 hover:bg-gray-100 transition-colors"
          >
            {loading ? 'Sending...' : 'Send magic link'}
          </button>
        </div>
      )}
    </main>
  )
}