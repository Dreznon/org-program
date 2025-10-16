const API_BASE: string = (import.meta as any).env?.VITE_API_BASE || ''

async function request<T>(path: string, init?: RequestInit, opts?: { fallback?: boolean }): Promise<T> {
  const url = (API_BASE ? API_BASE : '') + path
  const res = await fetch(url, init)
  if (!res.ok) {
    // If requested, try same-origin fallback so MSW can intercept
    if (opts?.fallback) {
      const relRes = await fetch(path, init).catch(() => undefined)
      if (relRes && relRes.ok) return relRes.json() as Promise<T>
    }
    throw new Error(`${res.status} ${res.statusText}`)
  }
  return res.json() as Promise<T>
}

export const getJSON = <T>(path: string) => request<T>(path)
export const getJSONWithFallback = <T>(path: string) => request<T>(path, undefined, { fallback: true })
export const postJSON = <T, B = unknown>(path: string, body: B) => request<T>(path, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
})
export const postJSONWithFallback = <T, B = unknown>(path: string, body: B) => request<T>(path, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(body),
}, { fallback: true })


