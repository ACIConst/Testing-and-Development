import React from "react";
import { C, F } from "../styles/tokens";

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, message: "" };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, message: error?.message || "Unexpected application error." };
  }

  componentDidCatch(error, errorInfo) {
    console.error("App error boundary:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ minHeight: "100vh", background: C.bg, color: C.cream, display: "flex", alignItems: "center", justifyContent: "center", padding: 24, fontFamily: F.body }}>
          <div style={{ maxWidth: 560, width: "100%", background: C.surface, border: `1px solid ${C.borderMid}`, borderRadius: 18, padding: 28 }}>
            <div style={{ fontFamily: F.display, fontSize: 28, fontWeight: 900, letterSpacing: 2, marginBottom: 12 }}>Something went wrong</div>
            <div style={{ color: C.muted, marginBottom: 18 }}>The app hit an unexpected error. Reload the page to recover.</div>
            <div style={{ background: C.card, border: `1px solid ${C.border}`, borderRadius: 12, padding: 14, fontSize: 14, color: C.errorText }}>{this.state.message}</div>
            <button onClick={() => window.location.reload()} style={{ marginTop: 18, background: C.red, border: "none", color: C.cream, borderRadius: 10, padding: "12px 16px", cursor: "pointer", fontWeight: 700 }}>Reload app</button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
