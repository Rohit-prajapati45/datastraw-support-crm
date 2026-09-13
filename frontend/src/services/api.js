const apiBaseUrl = (import.meta.env.VITE_API_URL || '').replace(/\/+$/, '');

async function request(path, options = {}) {
  const response = await fetch(`${apiBaseUrl}${path}`, { headers: { 'Content-Type': 'application/json', ...options.headers }, ...options });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error || 'Request failed. Please try again.');
  return body;
}
export const ticketApi = {
  list: (params = {}) => request(`/api/tickets?${new URLSearchParams(Object.entries(params).filter(([, v]) => v)).toString()}`),
  create: (data) => request('/api/tickets', { method: 'POST', body: JSON.stringify(data) }),
  get: (ticketId) => request(`/api/tickets/${encodeURIComponent(ticketId)}`),
  update: (ticketId, data) => request(`/api/tickets/${encodeURIComponent(ticketId)}`, { method: 'PUT', body: JSON.stringify(data) }),
  summary: (ticketId) => request(`/api/tickets/${encodeURIComponent(ticketId)}/summary`, { method: 'POST' })
};
