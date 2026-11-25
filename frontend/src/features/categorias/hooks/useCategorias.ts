import { useQuery } from '@tanstack/react-query'
import { categoriasApi } from '../api/categorias'
export function useCategorias() { return useQuery({ queryKey: ['categorias'], queryFn: categoriasApi.listar }) }
