import { useRef, useEffect, useCallback } from "react";

export function useIdleTimer(timeoutMs, onIdle) {
  const timer = useRef(null);
  const reset = useCallback(() => {
    clearTimeout(timer.current);
    timer.current = setTimeout(onIdle, timeoutMs);
  }, [timeoutMs, onIdle]);
  useEffect(() => {
    const events = ["mousedown", "touchstart", "keydown", "mousemove", "scroll"];
    events.forEach(e => document.addEventListener(e, reset, { passive: true }));
    reset();
    return () => { clearTimeout(timer.current); events.forEach(e => document.removeEventListener(e, reset)); };
  }, [reset]);
}
