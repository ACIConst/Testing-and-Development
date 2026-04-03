import { lazy, Suspense } from "react";
import { Routes, Route } from "react-router-dom";
import ErrorBoundary from "./components/ErrorBoundary";
import OperatorGate from "./components/OperatorGate";
import { useGlobalStyles } from "./hooks/useGlobalStyles";

const LandingPage = lazy(() => import("./views/landing/LandingPage"));
const KioskView = lazy(() => import("./views/kiosk/KioskView"));
const AdminView = lazy(() => import("./views/admin/AdminView"));
const LegalPages = lazy(() => import("./views/legal/LegalPages").then(m => ({ default: m.PrivacyPolicy })));
const TermsPage = lazy(() => import("./views/legal/LegalPages").then(m => ({ default: m.TermsOfService })));

export default function App() {
  useGlobalStyles();
  return (
    <ErrorBoundary>
      <Suspense fallback={<div style={{ minHeight: "100vh", background: "#111" }} />}>
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/kiosk" element={<KioskView />} />
          <Route path="/admin" element={<OperatorGate><AdminView /></OperatorGate>} />
          <Route path="/privacy" element={<LegalPages />} />
          <Route path="/terms" element={<TermsPage />} />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}
