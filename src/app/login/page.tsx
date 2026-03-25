'use client'

import { useState } from 'react'
import { login, signup } from './actions'

export default function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; message?: string }>
}) {
  return <LoginContent searchParamsPromise={searchParams} />
}

function LoginContent({
  searchParamsPromise,
}: {
  searchParamsPromise: Promise<{ error?: string; message?: string }>
}) {
  const [isSignUp, setIsSignUp] = useState(false)
  const [loading, setLoading] = useState(false)

  // Use React.use() isn't available in client components easily, 
  // so we handle searchParams via URL parsing on client side
  const params = typeof window !== 'undefined' 
    ? Object.fromEntries(new URLSearchParams(window.location.search))
    : {}

  const error = params.error
  const message = params.message

  const handleSubmit = () => {
    setLoading(true)
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <div className="login-logo">
            <svg width="40" height="40" viewBox="0 0 40 40" fill="none">
              <circle cx="20" cy="20" r="18" stroke="url(#grad)" strokeWidth="3" strokeLinecap="round" strokeDasharray="80 33" />
              <circle cx="20" cy="20" r="8" fill="url(#grad)" />
              <defs>
                <linearGradient id="grad" x1="0" y1="0" x2="40" y2="40">
                  <stop stopColor="#06b6d4" />
                  <stop offset="1" stopColor="#8b5cf6" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1>Activity Tracker</h1>
          <p className="login-subtitle">
            {isSignUp ? 'Create your account' : 'Welcome back'}
          </p>
        </div>

        {error && (
          <div className="alert alert-error">{decodeURIComponent(error)}</div>
        )}
        {message && (
          <div className="alert alert-success">{decodeURIComponent(message)}</div>
        )}

        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label htmlFor="email">Email</label>
            <input
              id="email"
              name="email"
              type="email"
              placeholder="you@example.com"
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              name="password"
              type="password"
              placeholder="••••••••"
              required
              minLength={6}
            />
          </div>

          <button
            className="btn btn-primary btn-full"
            formAction={isSignUp ? signup : login}
            disabled={loading}
          >
            {loading
              ? 'Please wait...'
              : isSignUp
              ? 'Create Account'
              : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <button
            type="button"
            className="btn-link"
            onClick={() => setIsSignUp(!isSignUp)}
          >
            {isSignUp
              ? 'Already have an account? Sign in'
              : "Don't have an account? Sign up"}
          </button>
        </div>
      </div>
    </div>
  )
}
