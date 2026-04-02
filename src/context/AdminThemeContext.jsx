import { createContext, useContext, useState, useEffect } from "react";
import { C, CLight, F, FONT_OPTIONS } from "../styles/tokens";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { db } from "../config/firebase";

const AdminThemeContext = createContext(null);

const LS_THEME = "admin-theme";
const LS_FONT = "admin-font";

export function AdminThemeProvider({ children }) {
  const [theme, setThemeState] = useState(() => localStorage.getItem(LS_THEME) || "dark");
  const [fontId, setFontIdState] = useState(() => localStorage.getItem(LS_FONT) || "default");
  const [logoUrl, setLogoUrlState] = useState(null);
  const [logoLoading, setLogoLoading] = useState(true);

  // Load logo from Firestore on mount
  useEffect(() => {
    getDoc(doc(db, "kioskConfig", "branding")).then(snap => {
      if (snap.exists() && snap.data().logoUrl) setLogoUrlState(snap.data().logoUrl);
    }).catch(() => {}).finally(() => setLogoLoading(false));
  }, []);

  function setTheme(t) { setThemeState(t); localStorage.setItem(LS_THEME, t); }
  function setFontId(id) { setFontIdState(id); localStorage.setItem(LS_FONT, id); }
  async function setLogoUrl(url) {
    setLogoUrlState(url);
    try { await setDoc(doc(db, "kioskConfig", "branding"), { logoUrl: url || null }, { merge: true }); } catch (e) { console.warn("Failed to save logo:", e); }
  }

  const T = theme === "light" ? CLight : C;
  const fontOption = FONT_OPTIONS.find(f => f.id === fontId) || FONT_OPTIONS[0];
  const TF = { ...F, body: fontOption.body, display: fontOption.display };

  return (
    <AdminThemeContext.Provider value={{ theme, setTheme, fontId, setFontId, logoUrl, setLogoUrl, logoLoading, T, TF }}>
      {children}
    </AdminThemeContext.Provider>
  );
}

export function useAdminTheme() {
  const ctx = useContext(AdminThemeContext);
  if (!ctx) return { T: C, TF: F, theme: "dark", fontId: "default", logoUrl: null, logoLoading: false, setTheme: () => {}, setFontId: () => {}, setLogoUrl: () => {} };
  return ctx;
}
