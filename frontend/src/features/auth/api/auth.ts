import { api } from '../../../shared/api/axiosInstance'
import type { Registro, Usuario } from '../types'

export const authApi = {
  async register(data: Registro): Promise<Usuario> { const r = await api.post<Usuario>('/auth/register', data); return r.data },
  async login(username: string, password: string): Promise<void> {
    const data = new URLSearchParams({ username, password })
    await api.post('/auth/token', data, { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } })
  },
  async me(): Promise<Usuario> { const r = await api.get<Usuario>('/auth/me'); return r.data },
  async logout(): Promise<void> { await api.post('/auth/logout') },
}
