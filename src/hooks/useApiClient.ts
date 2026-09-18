import { useCallback } from 'react';
import { API_URL } from '../lib/env';

export const useApiClient = (userId?: string) => {
  const call = useCallback(
    async <T>(
      endpoint: string,
      method: 'GET' | 'POST' | 'PUT' | 'DELETE' = 'GET',
      body?: unknown
    ): Promise<{ success: boolean; data?: T; error?: string }> => {
      try {
        const serverUrl = API_URL.replace(/\/+$/, '');

        // Add userId as query parameter if user is available and endpoint doesn't already have it
        let finalEndpoint = endpoint.startsWith('/') ? endpoint : `/${endpoint}`;
        if (
          userId &&
          !finalEndpoint.includes('userId=') &&
          !finalEndpoint.includes('/users/') &&
          !finalEndpoint.includes('/sessions/')
        ) {
          const separator = finalEndpoint.includes('?') ? '&' : '?';
          finalEndpoint = `${finalEndpoint}${separator}userId=${userId}`;
        }

        const url = `${serverUrl}/api${finalEndpoint}`;

        const res = await fetch(url, {
          method,
          headers: {
            'Content-Type': 'application/json',
          },
          ...(method !== 'GET' && body !== undefined
            ? { body: JSON.stringify(body) }
            : {}),
        });

        const result = await res.json().catch(() => ({}));

        if (!res.ok) {
          return { success: false, error: result.error || `HTTP ${res.status}` };
        }

        return { success: true, data: result.data ?? result };
      } catch (err) {
        return { success: false, error: (err as Error).message };
      }
    },
    [userId]
  );

  return call;
};

export default useApiClient;
