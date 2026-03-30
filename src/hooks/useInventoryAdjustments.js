import { useEffect, useState } from "react";
import { collection, limit, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../config/firebase";

export function useInventoryAdjustments(maxResults = 300) {
  const [adjustments, setAdjustments] = useState([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const q = query(collection(db, "inventoryAdjustments"), orderBy("createdAt", "desc"), limit(maxResults));
    const unsub = onSnapshot(q, (snap) => {
      setAdjustments(snap.docs.map((d) => ({ id: d.id, ...d.data() })));
      setReady(true);
    }, () => setReady(true));
    return unsub;
  }, [maxResults]);

  return { adjustments, ready };
}
