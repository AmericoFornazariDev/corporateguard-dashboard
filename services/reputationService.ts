const getApiBaseUrl = () => {
  const env = (import.meta as ImportMeta).env || {};
  return env.VITE_API_URL || 'http://localhost:3001/api';
};

const request = async <T>(endpoint: string, options: RequestInit = {}): Promise<T> => {
  const response = await fetch(`${getApiBaseUrl()}${endpoint}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(errorData.message || `Erro na API (${response.status})`);
  }

  if (response.status === 204) {
    return null as T;
  }

  return response.json() as Promise<T>;
};

export const getCompanyPurchaseHistory = async (token: string) =>
  request('/company/purchase-history', {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
