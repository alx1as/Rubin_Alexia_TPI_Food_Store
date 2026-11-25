import { useQuery } from '@tanstack/react-query'
import { usuariosApi } from '../api/usuarios'
export function useUsuarios() { return useQuery({queryKey: ['usuarios'], queryFn: usuariosApi.listar}) }
