export default function ErrorPage() {
  return (
    <div className="login-container">
      <div className="login-card" style={{ textAlign: 'center' }}>
        <div style={{ fontSize: '3rem', marginBottom: '16px' }}>😕</div>
        <h1 style={{ fontSize: '1.25rem', marginBottom: '8px' }}>Something went wrong</h1>
        <p style={{ color: 'var(--color-text-muted)', marginBottom: '20px' }}>
          Please try again or contact support if the issue persists.
        </p>
        <a href="/login" className="btn btn-primary">
          Back to Login
        </a>
      </div>
    </div>
  )
}
