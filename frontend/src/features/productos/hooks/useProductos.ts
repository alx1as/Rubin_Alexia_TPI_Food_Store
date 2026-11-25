import { useQuery } from '@tanstack/react-query'
import { productosApi } from '../api/productos'
import type { FiltrosProducto } from '../types'
export function useProductos(filtros: FiltrosProducto) {
  return useQuery({ queryKey: ['productos', filtros], queryFn: () => productosApi.listar(filtros) })
}
