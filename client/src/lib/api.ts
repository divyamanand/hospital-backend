export const apiBase = import.meta.env.VITE_API_BASE || ''

export async function api<T>(path: string, options: RequestInit = {}): Promise<T> {
  const res = await fetch(apiBase + path, {
    credentials: 'include',
    headers: {
      'Content-Type': 'application/json',
      ...(options.headers || {})
    },
    ...options
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(text || res.statusText)
  }
  // attempt json
  try { return await res.json() } catch { return undefined as unknown as T }
}

export function query<T>(path: string) { return api<T>(path) }
export function mutate<T>(path: string, body?: any, method: string = 'POST') {
  return api<T>(path, { method, body: body ? JSON.stringify(body) : undefined })
}
