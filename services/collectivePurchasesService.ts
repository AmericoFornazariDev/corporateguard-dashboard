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

export const createCollectivePurchase = async (
  payload: {
    product_name: string;
    description: string;
    target_quantity: number;
    creator_quantity: number;
    signature_id: string;
    signature_name: string;
    signature_contact: string;
  },
  token: string
) =>
  request('/collective-purchases', {
    method: 'POST',
    body: JSON.stringify(payload),
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });

export const getMyCollectivePurchases = async (token: string) =>
  request('/collective-purchases/my', {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });

export const getFinalDocumentData = async (purchaseId: string, token: string) =>
  request(`/collective-purchases/${purchaseId}/final-document-data`, {
    method: 'GET',
    headers: token ? { Authorization: `Bearer ${token}` } : undefined
  });
