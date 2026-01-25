import { useCallback, useState } from 'react';

export type QueryState<T> = {
  data: T;
  loading: boolean;
  error: Error | null;
  reload: () => Promise<void>;
};

export function useQueryState<T>(loader: () => Promise<T>, initial: T): QueryState<T> {
  const [data, setData] = useState<T>(initial);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const next = await loader();
      setData(next);
    } catch (e) {
      setError(e as Error);
    } finally {
      setLoading(false);
    }
  }, [loader]);

  return { data, loading, error, reload };
}
