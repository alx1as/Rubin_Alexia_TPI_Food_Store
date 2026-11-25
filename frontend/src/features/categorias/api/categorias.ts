import { api } from '../../../shared/api/axiosInstance'
import type { Categoria, CategoriaDatos } from '../types'
export const categoriasApi = {
  listar: async (): Promise<Categoria[]> => (await api.get<Categoria[]>('/categorias')).data,
  crear: async (data: CategoriaDatos): Promise<Categoria> => (await api.post<Categoria>('/categorias', data)).data,
  editar: async (id: number, data: CategoriaDatos): Promise<Categoria> => (await api.put<Categoria>(`/categorias/${id}`, data)).data,
  eliminar: async (id: number): Promise<void> => { await api.delete(`/categorias/${id}`) },
}
