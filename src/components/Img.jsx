import { useState } from "react";
import { C } from "../styles/tokens";

export function Img({ src, alt, style }) {
  const [err, setErr] = useState(false);
  if (err || !src) return (
    <div style={{ ...style, background: `linear-gradient(135deg,${C.card},${C.border})`, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 6 }}>
      <span style={{ fontSize: 28, opacity: .3 }}>🥩</span>
      <span style={{ fontSize: 10, color: C.muted, letterSpacing: 1 }}>No Image</span>
    </div>
  );
  return <img src={src} alt={alt} style={style} onError={() => setErr(true)} />;
}
