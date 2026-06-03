import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { error: null }
  }

  static getDerivedStateFromError(error) {
    return { error }
  }

  componentDidCatch(error, info) {
    console.error('App crashed:', error, info)
  }

  render() {
    if (this.state.error) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 12,
          padding: 24,
          background: '#0a0a0f',
          color: '#ff0080',
          fontFamily: "'Courier New', monospace",
          textShadow: '0 0 8px #ff0080',
          textAlign: 'center',
        }}>
          <div style={{ fontSize: 18, letterSpacing: 3 }}>⚠ SYSTEM FAILURE</div>
          <div style={{ fontSize: 12, color: '#00fff9', textShadow: '0 0 6px #00fff9', maxWidth: 600, wordBreak: 'break-word' }}>
            {String(this.state.error?.message || this.state.error)}
          </div>
          <button
            onClick={() => window.location.reload()}
            style={{
              marginTop: 8,
              padding: '8px 20px',
              background: 'transparent',
              border: '1px solid #bc13fe',
              color: '#bc13fe',
              fontFamily: "'Courier New', monospace",
              letterSpacing: 2,
              cursor: 'pointer',
              textShadow: '0 0 6px #bc13fe',
              boxShadow: '0 0 12px rgba(188,19,254,0.4)',
            }}
          >
            ↻ RELOAD
          </button>
        </div>
      )
    }
    return this.props.children
  }
}
