let csrf = ''
export class APIError extends Error {
  status: number
  constructor(message: string, status: number) { super(message); this.status = status }
}
export async function api<T>(path: string, body?: unknown): Promise<T> {
  if (body !== undefined && !csrf) {
    const result = await api<{ csrfToken: string }>('/auth/csrf/')
    csrf = result.csrfToken
  }
  const response = await fetch('/api/v1' + path, {
    method: body === undefined ? 'GET' : 'POST', credentials: 'same-origin',
    headers: body === undefined ? {} : { 'Content-Type': 'application/json', 'X-CSRFToken': csrf },
    body: body === undefined ? undefined : JSON.stringify(body), signal: AbortSignal.timeout(8000),
  })
  if (response.status === 204) return undefined as T
  const data = await response.json().catch(() => ({ detail: 'Resposta inválida do servidor.' }))
  if (!response.ok) {
    if (response.status === 403) csrf = ''
    const message = data.detail ?? Object.values(data).flat().join(' ')
    throw new APIError(String(message || 'Não foi possível concluir a solicitação.'), response.status)
  }
  if (data.csrfToken) csrf = data.csrfToken
  return data as T
}
export const errorMessage = (error: unknown) => error instanceof APIError ? error.message : 'Servidor indisponível. Verifique a conexão e tente novamente.'
