import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { pedidosApi } from '../api/pedidos'
import type { CrearPedido, EstadoPedido } from '../types'
export const usePedidos = (estado: EstadoPedido | '' = '', pagina = 0, limite = 10) => useQuery({queryKey: ['pedidos', estado, pagina, limite], queryFn: () => pedidosApi.listar({skip: pagina * limite, limit: limite, estado})})
export const useResumenPedidos = () => useQuery({queryKey: ['pedidos','resumen'], queryFn: pedidosApi.resumen})
export function useCrearPedido() { const q = useQueryClient(); return useMutation({ mutationFn: (data: CrearPedido) => pedidosApi.crear(data), onSuccess: () => { void q.invalidateQueries({queryKey:['pedidos']}); void q.invalidateQueries({queryKey:['productos']}) }}) }
export function useCancelarPedido() { const q = useQueryClient(); return useMutation({ mutationFn: pedidosApi.cancelar, onSuccess: () => { void q.invalidateQueries({queryKey:['pedidos']}); void q.invalidateQueries({queryKey:['productos']}) }}) }
export function useCambiarEstadoPedido() { const q = useQueryClient(); return useMutation({ mutationFn: ({id, estado}:{id:number;estado:EstadoPedido}) => pedidosApi.estado(id, estado), onSuccess: () => { void q.invalidateQueries({queryKey:['pedidos']}); void q.invalidateQueries({queryKey:['productos']}) }}) }
