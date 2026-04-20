import { useState, useEffect, useCallback } from 'react';
import { getCases as fetchCases, getCasesByCountry } from '../firebase/cases';
import type { Case } from '../types';

export function useCases(countryCode: string, stateCode: string) {
  const [cases, setCases] = useState<Case[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const reload = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      // Timeout after 5 seconds to handle unconfigured Firebase
      const timeout = new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error('timeout')), 5000)
      );
      const fetcher = stateCode === 'ALL'
        ? getCasesByCountry(countryCode)
        : fetchCases(countryCode, stateCode);
      const data = await Promise.race([fetcher, timeout]);
      setCases(data);
    } catch (err) {
      setError((err as Error).message);
      setCases([]);
    } finally {
      setLoading(false);
    }
  }, [countryCode, stateCode]);

  useEffect(() => {
    reload();
  }, [reload]);

  return { cases, loading, error, reload };
}
