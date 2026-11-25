import { api } from '../../../shared/api/axiosInstance'
import type { Producto, ProductosPaginados, ProductoDatos, FiltrosProducto } from '../types'
export const productosApi = {
  listar: async (filtros: FiltrosProducto = {}): Promise<ProductosPaginados> => (await api.get<ProductosPaginados>('/productos', { params: filtros })).data,
  obtener: async (id: number): Promise<Producto> => (await api.get<Producto>(`/productos/${id}`)).data,
  crear: async (data: ProductoDatos): Promise<Producto> => (await api.post<Producto>('/productos', data)).data,
  editar: async (id: number, data: Partial<ProductoDatos>): Promise<Producto> => (await api.put<Producto>(`/productos/${id}`, data)).data,
  stock: async (id: number, stock: number, disponible: boolean): Promise<Producto> => (await api.patch<Producto>(`/productos/${id}/stock`, { stock, disponible })).data,
  eliminar: async (id: number): Promise<void> => { await api.delete(`/productos/${id}`) },
}
