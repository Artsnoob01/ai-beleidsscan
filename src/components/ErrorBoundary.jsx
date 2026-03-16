import { Component } from 'react';
import { C } from '../config/theme.js';
import { Logo } from './Logo.jsx';
import { btn, font } from '../styles/buttonStyles.js';

export class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", background: C.bg, fontFamily: font, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ textAlign: "center", maxWidth: 480, padding: 24 }}>
            <div style={{ marginBottom: 28 }}><Logo size={200} /></div>
            <div style={{ width: 56, height: 56, borderRadius: 14, background: C.dangerDim, border: `1px solid ${C.dangerBorder}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 24, margin: "0 auto 20px" }}>⚠</div>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: C.white, marginBottom: 8 }}>Er is een onverwachte fout opgetreden</h2>
            <p style={{ fontSize: 13, color: C.textMuted, marginBottom: 24, lineHeight: 1.6 }}>
              Probeer de pagina opnieuw te laden. Uw antwoorden zijn mogelijk bewaard.
            </p>
            <button onClick={this.handleReload} style={{ ...btn, padding: "12px 28px", fontSize: 13, background: C.accent, color: C.black, borderRadius: 8 }}>
              Pagina herladen
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}
