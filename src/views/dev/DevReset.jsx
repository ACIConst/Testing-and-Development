/**
 * DevReset — temporary dev tool
 * Route: /reset
 * Delete this file and its route before production.
 */
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { collection, getDocs, deleteDoc, doc, updateDoc } from "firebase/firestore";
import { db } from "../../config/firebase";
import { C, F, GLASS_MODAL, SEED_MENU } from "../../styles/tokens";

const COLLECTIONS_TO_CLEAR = ["kioskOrders", "orders"];

export default function DevReset() {
  const navigate = useNavigate();
  const [log, setLog] = useState([]);
  const [running, setRunning] = useState(false);

  function addLog(msg) {
    setLog(prev => [...prev, `${new Date().toLocaleTimeString()} — ${msg}`]);
  }

  async function clearCollection(name) {
    try {
      const snap = await getDocs(collection(db, name));
      if (snap.empty) {
        addLog(`${name}: already empty`);
        return 0;
      }
      let count = 0;
      for (const d of snap.docs) {
        await deleteDoc(doc(db, name, d.id));
        count++;
      }
      addLog(`${name}: deleted ${count} documents`);
      return count;
    } catch (e) {
      addLog(`${name}: ERROR — ${e.message}`);
      return 0;
    }
  }

  async function resetMenuStock() {
    try {
      const snap = await getDocs(collection(db, "kioskMenu"));
      if (snap.empty) {
        addLog("kioskMenu: no items found");
        return;
      }
      let count = 0;
      for (const d of snap.docs) {
        // Find seed data match by name for default inStock value
        const seed = SEED_MENU.find(s => s.name === d.data().name);
        await updateDoc(doc(db, "kioskMenu", d.id), {
          inStock: seed ? seed.inStock : true,
          stock: null,
        });
        count++;
      }
      addLog(`kioskMenu: reset stock on ${count} items`);
    } catch (e) {
      addLog(`kioskMenu: ERROR — ${e.message}`);
    }
  }

  async function runFullReset() {
    setRunning(true);
    setLog([]);
    addLog("Starting full reset...");

    for (const name of COLLECTIONS_TO_CLEAR) {
      await clearCollection(name);
    }

    await resetMenuStock();

    addLog("✓ Reset complete");
    setRunning(false);
  }

  async function clearOrdersOnly() {
    setRunning(true);
    setLog([]);
    addLog("Clearing orders...");
    for (const name of COLLECTIONS_TO_CLEAR) {
      await clearCollection(name);
    }
    addLog("✓ Orders cleared");
    setRunning(false);
  }

  async function resetStockOnly() {
    setRunning(true);
    setLog([]);
    addLog("Resetting menu stock...");
    await resetMenuStock();
    addLog("✓ Stock reset");
    setRunning(false);
  }

  const btn = (label, onClick, color = C.red) => (
    <button onClick={onClick} disabled={running} style={{
      background: running ? C.border : color,
      border: "none", color: "#fff", borderRadius: 12,
      padding: "14px 24px", fontFamily: F.display, fontSize: 15,
      fontWeight: 700, cursor: running ? "default" : "pointer",
      opacity: running ? .5 : 1, transition: "opacity .2s",
      minHeight: 48, flex: 1, minWidth: 160,
    }}>{label}</button>
  );

  return (
    <div style={{ minHeight: "100vh", background: C.bg, fontFamily: F.body, color: C.cream, display: "flex", flexDirection: "column", alignItems: "center", padding: "40px 20px" }}>
      <div style={{ width: "100%", maxWidth: 600 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 32 }}>
          <div>
            <div style={{ fontFamily: F.display, fontSize: 28, fontWeight: 700, color: C.cream, marginBottom: 4 }}>Dev Reset</div>
            <div style={{ fontSize: 13, color: C.muted }}>Temporary tool — delete before production</div>
          </div>
          <button onClick={() => navigate("/")} style={{
            background: "transparent", border: `1px solid ${C.border}`, color: C.muted,
            borderRadius: 10, padding: "10px 16px", cursor: "pointer", fontFamily: F.display, fontSize: 13,
          }}>← Back</button>
        </div>

        {/* Warning */}
        <div style={{
          background: C.errorBg, border: `1px solid ${C.errorText}44`, borderRadius: 14,
          padding: "14px 18px", marginBottom: 24, fontSize: 14, color: C.errorText, lineHeight: 1.6,
        }}>
          ⚠ These actions are destructive and cannot be undone. They will permanently delete data from Firestore.
        </div>

        {/* Action buttons */}
        <div style={{ display: "flex", gap: 12, flexWrap: "wrap", marginBottom: 24 }}>
          {btn("Full Reset", runFullReset, "#991b1b")}
          {btn("Clear Orders Only", clearOrdersOnly, "#92400e")}
          {btn("Reset Stock Only", resetStockOnly, "#166534")}
        </div>

        {/* What each does */}
        <div style={{ ...GLASS_MODAL, borderRadius: 14, padding: "16px 20px", marginBottom: 24, fontSize: 13, color: C.muted, lineHeight: 1.8 }}>
          <div><strong style={{ color: C.cream }}>Full Reset:</strong> Deletes all orders + resets menu stock to seed defaults</div>
          <div><strong style={{ color: C.cream }}>Clear Orders Only:</strong> Deletes kioskOrders and orders collections</div>
          <div><strong style={{ color: C.cream }}>Reset Stock Only:</strong> Sets all menu items back to seed inStock values, clears stock counts</div>
        </div>

        {/* Log output */}
        {log.length > 0 && (
          <div style={{
            background: C.surface, border: `1px solid ${C.border}`, borderRadius: 14,
            padding: "16px 18px", fontFamily: F.mono, fontSize: 12, lineHeight: 1.8,
            maxHeight: 300, overflowY: "auto",
          }}>
            {log.map((line, i) => (
              <div key={i} style={{ color: line.includes("ERROR") ? C.errorText : line.includes("✓") ? C.greenText : C.mutedLight }}>
                {line}
              </div>
            ))}
            {running && <div style={{ color: C.muted, animation: "pulse 1s infinite" }}>Running...</div>}
          </div>
        )}
      </div>
    </div>
  );
}
