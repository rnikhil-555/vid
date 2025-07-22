import { getItem, setItem } from "@/lib/utils";
import { useEffect, useState } from "react";

export function usePersistedState<T>(key: string, defaultValue: T) {
  const [state, setState] = useState<T>(defaultValue);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = getItem<T>(key);
      // Use defaultValue if nothing is stored
      setState(stored !== null ? stored : defaultValue);
      setLoading(false);
    }
  }, [key, defaultValue]);

  useEffect(() => {
    if (!loading) {
      setItem(key, state);
    }
  }, [key, state, loading]);

  return [state, setState, loading] as const;
}
