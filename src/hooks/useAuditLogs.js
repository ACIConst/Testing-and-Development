import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../config/firebase";

export function useAuditLogs(maxResults = 300) {
  const [auditLogs, setAuditLogs] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "auditLogs"), orderBy("createdAt", "desc"), limit(maxResults));
    const unsub = onSnapshot(q, (snap) => {
      setAuditLogs(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setReady(true);
    }, () => setReady(true));
    return unsub;
  }, [maxResults]);

  return { auditLogs, ready };
}
