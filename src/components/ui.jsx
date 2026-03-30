import { useState, useEffect } from "react";
import { C, F, ORDER_STATUSES } from "../styles/tokens";

export function Modal({ title, children, onClose, wide }) {
  useEffect(() => { const h = e => { if (e.key === "Escape") onClose(); }; document.addEventListener("keydown", h); return () => document.removeEventListener("keydown", h); }, [onClose]);
  return (
    <div onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.87)", backdropFilter: "blur(5px)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 500, padding: 20 }}>
      <div onClick={e => e.stopPropagation()} style={{ background: C.surface, border: `1px solid ${C.borderMid}`, borderRadius: 18, padding: "26px 28px", width: wide ? 570 : 420, maxWidth: "95vw", maxHeight: "90vh", overflowY: "auto", animation: "scaleIn .22s ease", boxShadow: "0 32px 80px rgba(0,0,0,.85)" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 22 }}>
          <div style={{ fontFamily: F.display, fontSize: 20, fontWeight: 900, letterSpacing: 2, color: C.cream }}>{title}</div>
          <button onClick={onClose} style={{ background: "transparent", border: "none", color: C.muted, cursor: "pointer", fontSize: 22, lineHeight: 1, width: 36, height: 36, display: "flex", alignItems: "center", justifyContent: "center", borderRadius: 8 }}>✕</button>
        </div>
        {children}
      </div>
    </div>
  );
}

export function ConfirmModal({ message, confirmLabel, danger, onConfirm, onClose }) {
  return (
    <Modal title="Confirm Action" onClose={onClose}>
      <div style={{ fontSize: 15, color: C.mutedLight, lineHeight: 1.65, marginBottom: 24 }}>{message}</div>
      <div style={{ display: "flex", justifyContent: "flex-end", gap: 10 }}>
        <Btn ghost onClick={onClose}>Cancel</Btn>
        <button onClick={onConfirm} style={{ background: danger ? C.errorBg : C.red, border: `1px solid ${danger ? "#450a0a" : C.red}`, color: danger ? C.errorText : C.cream, borderRadius: 10, padding: "10px 20px", cursor: "pointer", fontFamily: F.body, fontSize: 14, fontWeight: 600 }}>{confirmLabel}</button>
      </div>
    </Modal>
  );
}

export function Field({ label, children, style }) {
  return (
    <div style={style}>
      <label style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.muted, display: "block", marginBottom: 7 }}>{label}</label>
      {children}
    </div>
  );
}

export function Btn({ children, primary, ghost, fullWidth, large, disabled, onClick }) {
  const base = { border: "none", borderRadius: 10, cursor: disabled ? "not-allowed" : "pointer", fontFamily: F.body, fontWeight: 600, letterSpacing: .5, padding: large ? "14px 22px" : "9px 16px", fontSize: large ? 16 : 14, transition: "all .2s", display: "inline-flex", alignItems: "center", justifyContent: "center", width: fullWidth ? "100%" : "auto", opacity: disabled ? .5 : 1 };
  if (primary) return <button onClick={!disabled ? onClick : undefined} style={{ ...base, background: C.red, color: C.cream }}>{children}</button>;
  if (ghost) return <button onClick={onClick} style={{ ...base, background: "transparent", color: C.muted, border: `1px solid ${C.border}` }}>{children}</button>;
  return <button onClick={onClick} style={{ ...base, background: C.card, color: C.cream, border: `1px solid ${C.borderMid}` }}>{children}</button>;
}

export function KioskBtn({ children, primary, ghost, fullWidth, large, onClick }) {
  return (
    <button onClick={onClick} className="touch-active" style={{ background: primary ? C.red : ghost ? "transparent" : C.card, color: primary ? C.cream : C.muted, border: ghost ? `1px solid ${C.border}` : primary ? "none" : `1px solid ${C.borderMid}`, borderRadius: 12, padding: large ? "16px 28px" : "12px 20px", fontFamily: F.body, fontSize: large ? 18 : 15, fontWeight: 600, cursor: "pointer", transition: "all .2s", display: "inline-flex", alignItems: "center", justifyContent: "center", width: fullWidth ? "100%" : "auto", minHeight: large ? 56 : 48, letterSpacing: .5 }}>
      {children}
    </button>
  );
}

export function KQtyBtn({ children, large, onClick, disabled }) {
  return (
    <button onClick={!disabled ? onClick : undefined} className={disabled ? "" : "touch-active"} style={{ background: C.border, border: "none", color: disabled ? C.muted : C.cream, borderRadius: 9, width: large ? 52 : 38, height: large ? 52 : 38, fontSize: large ? 24 : 19, cursor: disabled ? "not-allowed" : "pointer", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: F.display, opacity: disabled ? .4 : 1, transition: "opacity .15s" }}>
      {children}
    </button>
  );
}

export function StatusBadge({ status }) {
  const s = ORDER_STATUSES.find(x => x.id === status) || ORDER_STATUSES[0];
  return (
    <span style={{ background: s.color, color: s.text, borderRadius: 6, padding: "3px 10px", fontSize: 11, fontWeight: 700, letterSpacing: 1, textTransform: "uppercase", whiteSpace: "nowrap" }}>
      {s.label}
    </span>
  );
}

export function ModeLoadingScreen({ label }) {
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.bg, gap: 20 }}>
      <img src="/Champs%20Meats.svg" alt="Champs Meats" style={{ height: "48px", width: "auto", objectFit: "contain" }} />
      <div style={{ width: 36, height: 36, border: `3px solid ${C.borderMid}`, borderTop: `3px solid ${C.red}`, borderRadius: "50%", animation: "spin 0.8s linear infinite" }} />
      <div style={{ fontFamily: F.body, fontSize: 14, color: C.muted, letterSpacing: 2, textTransform: "uppercase" }}>{label}</div>
    </div>
  );
}

export function inputSt(isSelect = false) {
  return { width: "100%", background: C.card, border: `1px solid ${C.borderMid}`, borderRadius: 10, padding: "10px 13px", color: C.cream, fontFamily: F.body, fontSize: 14, transition: "border .2s" };
}

export function smallBtn(danger = false, disabled = false) {
  return { background: danger ? C.errorBg : C.surface, border: `1px solid ${danger ? "#450a0a" : C.borderMid}`, color: danger ? C.errorText : C.cream, borderRadius: 7, padding: "5px 11px", cursor: disabled ? "not-allowed" : "pointer", fontFamily: F.body, fontSize: 12, opacity: disabled ? .4 : 1 };
}

// Shared print utility with popup-blocked detection
export function openPrintWindow(html, showToast) {
  const w = window.open("", "_blank", "width=400,height=600");
  if (!w) {
    if (showToast) showToast("Popup blocked — allow popups for this site to print.", "error");
    return null;
  }
  w.document.write(html);
  w.document.close();
  return w;
}
