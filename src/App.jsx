import { lazy, Suspense } from "react";
import { Routes, Route, useLocation } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import OperatorGate from "./components/OperatorGate";

const LandingPage = lazy(() => import("./views/landing/LandingPage"));
const KioskView = lazy(() => import("./views/kiosk/KioskView"));
const BoardView = lazy(() => import("./views/board/BoardView"));
const AdminView = lazy(() => import("./views/admin/AdminView"));

function SignOutButton() {
  const { logout } = useAuth();
  const location = useLocation();
  if (location.pathname === "/kiosk") return null;
  return (
    <div style={{ position: "fixed", top: 10, right: 10, zIndex: 9999 }}>
      <button
        onClick={logout}
        style={{
          background: "#333", border: "1px solid #555", color: "#ccc",
          borderRadius: 6, padding: "6px 14px", cursor: "pointer", fontSize: 13,
        }}
      >
        Sign Out
      </button>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<div style={{ minHeight: "100vh", background: "#111" }} />}>
      <Routes>
        <Route path="/kiosk" element={<KioskView />} />
        <Route path="/*" element={
          <OperatorGate>
            <SignOutButton />
            <Routes>
              <Route path="/" element={<LandingPage />} />
              <Route path="/board" element={<BoardView />} />
              <Route path="/admin" element={<AdminView />} />
            </Routes>
          </OperatorGate>
        } />
      </Routes>
    </Suspense>
  );
}
