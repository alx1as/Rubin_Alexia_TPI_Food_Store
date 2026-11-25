import { api } from '../../../shared/api/axiosInstance'
import type { Usuario } from '../../auth/types'
export const usuariosApi = {
  listar: async (): Promise<Usuario[]> => (await api.get<Usuario[]>('/admin/usuarios')).data,
  activar: async (id: number): Promise<Usuario> => (await api.post<Usuario>(`/admin/usuarios/${id}/activar`)).data,
  desactivar: async (id: number): Promise<Usuario> => (await api.post<Usuario>(`/admin/usuarios/${id}/desactivar`)).data,
}
