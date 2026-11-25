import { api } from '../../../shared/api/axiosInstance'
import type { Pedido, PedidosPaginados, CrearPedido, EstadoPedido, ResumenPedidos } from '../types'
export const pedidosApi = {
  listar: async (filtros: {skip?: number; limit?: number; estado?: EstadoPedido | ''} = {}): Promise<PedidosPaginados> => (await api.get<PedidosPaginados>('/pedidos', {params: {...filtros, estado: filtros.estado || undefined}})).data,
  obtener: async (id: number): Promise<Pedido> => (await api.get<Pedido>(`/pedidos/${id}`)).data,
  crear: async (data: CrearPedido): Promise<Pedido> => (await api.post<Pedido>('/pedidos', data)).data,
  cancelar: async (id: number): Promise<Pedido> => (await api.patch<Pedido>(`/pedidos/${id}/cancelar`)).data,
  estado: async (id: number, estado: EstadoPedido): Promise<Pedido> => (await api.patch<Pedido>(`/pedidos/${id}/estado`, { estado })).data,
  resumen: async (): Promise<ResumenPedidos> => (await api.get<ResumenPedidos>('/pedidos/resumen')).data,
}
