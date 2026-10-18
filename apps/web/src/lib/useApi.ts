import { useCallback, useEffect, useState } from 'react';
import { api, errorMessage } from '../api/client';

interface ApiState<T> {
  data: T | null;
  error: string | null;
  loading: boolean;
}

/** Carga datos de la API con GET; `reload()` vuelve a pedirlos. path null = no cargar. */
export function useApi<T>(path: string | null) {
  const [state, setState] = useState<ApiState<T>>({ data: null, error: null, loading: path !== null });
  const [version, setVersion] = useState(0);

  useEffect(() => {
    if (path === null) {
      return;
    }
    let active = true;
    setState((s) => ({ ...s, loading: true }));
    api<T>(path)
      .then((data) => {
        if (active) setState({ data, error: null, loading: false });
      })
      .catch((e: unknown) => {
        if (active) setState({ data: null, error: errorMessage(e), loading: false });
      });
    return () => {
      active = false;
    };
  }, [path, version]);

  const reload = useCallback(() => setVersion((v) => v + 1), []);
  return { ...state, reload };
}
