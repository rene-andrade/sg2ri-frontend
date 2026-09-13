import { useState, useEffect, useCallback } from 'react';

export function useFetch(fetchFn, initialArgs = null, autoFetch = true) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(autoFetch);
  const [error, setError] = useState(null);

  const execute = useCallback(
    async (args = initialArgs) => {
      setLoading(true);
      setError(null);
      try {
        const result = await fetchFn(args);
        setData(result);
        return result;
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Erro ao carregar dados';
        setError(msg);
        throw err;
      } finally {
        setLoading(false);
      }
    },
    [fetchFn, initialArgs]
  );

  useEffect(() => {
    if (autoFetch) {
      execute();
    }
  }, [execute, autoFetch]);

  return {
    data,
    loading,
    error,
    refetch: execute,
    setData,
  };
}

export default useFetch;
