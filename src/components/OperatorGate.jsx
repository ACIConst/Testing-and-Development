import { useState, useRef, useEffect } from "react";
import { C, F } from "../styles/tokens";
import { useAuth } from "../context/AuthContext";

/**
 * OperatorGate — asks for the operator's name before entering a view.
 * If the operator is already set (sessionStorage), it skips the prompt.
 *
 * Props:
 *  - children(operatorName) — render prop receiving the current operator name
 *  - label — what to show (e.g. "Order Board", "Delivery")
 *  - accent — brand color for the view
 *  - onExit — callback to navigate away
 *  - users — optional array of { name } objects for quick-select buttons
 */
export default function OperatorGate({ children, label, accent, onExit, users }) {
  const { operator, setOperator } = useAuth();
  const [name, setName] = useState("");
  const inputRef = useRef();

  useEffect(() => { inputRef.current?.focus(); }, []);

  // Already identified → render the view
  if (operator) return children(operator);

  function submit() {
    const trimmed = name.trim();
    if (!trimmed) return;
    setOperator(trimmed);
  }

  return (
    <div style={{
      minHeight: "100vh", background: C.bg, display: "flex", flexDirection: "column",
      alignItems: "center", justifyContent: "center", fontFamily: F.body, color: C.cream, padding: 40,
    }}>
      <img
        src="/Champs%20Meats.svg"
        alt="Champs Meats"
        style={{ height: "50px", width: "auto", objectFit: "contain", marginBottom: 14 }}
      />
      <div style={{ fontFamily: F.display, fontSize: 24, fontWeight: 900, letterSpacing: 4, color: C.cream, marginBottom: 4 }}>
        {label || "OPERATOR LOGIN"}
      </div>
      <div style={{ fontSize: 14, color: C.muted, marginBottom: 28 }}>
        Who is operating this station?
      </div>

      <div style={{
        background: C.surface, border: "1px solid " + C.borderMid, borderRadius: 18,
        padding: "30px 34px", width: 400, maxWidth: "95vw",
        boxShadow: "0 24px 60px rgba(0,0,0,.7)", animation: "scaleIn .3s ease",
      }}>
        {/* Quick-select from employee list */}
        {users && users.length > 0 && (
          <div style={{ marginBottom: 18 }}>
            <div style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.muted, marginBottom: 10 }}>
              Quick Select
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
              {users.map(u => (
                <button
                  key={u.name}
                  onClick={() => setOperator(u.name)}
                  style={{
                    background: C.card, border: "1px solid " + C.borderMid, color: C.cream,
                    borderRadius: 10, padding: "10px 16px", cursor: "pointer", fontFamily: F.body,
                    fontSize: 14, fontWeight: 600, transition: "border .2s",
                  }}
                >
                  {u.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <div style={{ marginBottom: 18 }}>
          <label style={{ fontSize: 11, letterSpacing: 2, textTransform: "uppercase", color: C.muted, display: "block", marginBottom: 7 }}>
            Your Name
          </label>
          <input
            ref={inputRef}
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            onKeyDown={e => e.key === "Enter" && submit()}
            placeholder="Enter your name"
            autoCapitalize="words"
            style={{
              width: "100%", background: C.card, border: "1px solid " + C.borderMid,
              borderRadius: 10, padding: "12px 14px", color: C.cream,
              fontFamily: F.body, fontSize: 15, transition: "border .2s",
            }}
          />
        </div>

        <button
          onClick={submit}
          disabled={!name.trim()}
          style={{
            width: "100%", background: name.trim() ? (accent || C.red) : C.border,
            border: "none", color: C.cream, borderRadius: 10, padding: "14px",
            fontSize: 16, fontWeight: 700, cursor: name.trim() ? "pointer" : "default",
            fontFamily: F.body, transition: "background .2s",
            opacity: name.trim() ? 1 : 0.5,
          }}
        >
          Continue
        </button>

        <button
          onClick={onExit}
          style={{
            background: "transparent", border: "none", color: C.muted, cursor: "pointer",
            width: "100%", marginTop: 12, fontFamily: F.body, fontSize: 14, padding: "8px 0",
          }}
        >
          ← Back to Mode Select
        </button>
      </div>
    </div>
  );
}
