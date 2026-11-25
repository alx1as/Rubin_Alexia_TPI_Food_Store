import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { usuariosApi } from '../api/usuarios'
import { useUsuarios } from '../hooks/useUsuarios'
import { useAuthStore } from '../../../store/authStore'
import type { Usuario } from '../../auth/types'
import { Card } from '../../../shared/ui/Card'
import { Button } from '../../../shared/ui/Button'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/Feedback'
import { handleApiError } from '../../../shared/api/handleApiError'
export function AdminUsuariosPage(){
  const usuario=useAuthStore((s)=>s.usuario)
  const datos=useUsuarios()
  const [error,setError]=useState('')
  const qc=useQueryClient()
  const mutacion=useMutation({mutationFn:({id,activar}:{id:number;activar:boolean})=>activar?usuariosApi.activar(id):usuariosApi.desactivar(id),onSuccess:()=>void qc.invalidateQueries({queryKey:['usuarios']})})
  const cambiar=async(id:number,activar:boolean)=>{try{setError('');await mutacion.mutateAsync({id,activar})}catch(e){setError(handleApiError(e))}}
  const columnas:ColumnDef<Usuario,unknown>[]=[{accessorKey:'username',header:'Usuario'},{accessorKey:'full_name',header:'Nombre'},{accessorKey:'email',header:'Email'},{accessorKey:'role',header:'Rol'},{id:'estado',header:'Estado',cell:({row})=>row.original.disabled?'Desactivado':'Activo'},{id:'acciones',header:'Acciones',cell:({row})=>row.original.id===usuario?.id?<span className="text-xs text-[#7d8e7f]">Tu cuenta</span>:<Button variant={row.original.disabled?'primary':'danger'} disabled={mutacion.isPending} onClick={()=>void cambiar(row.original.id,row.original.disabled)}>{row.original.disabled?'Activar':'Desactivar'}</Button>}]
  return <><h1 className="titulo-seccion mb-6">Usuarios</h1>{error&&<EstadoError mensaje={error}/>}<Card>{datos.isPending?<p>Cargando usuarios…</p>:datos.isError?<EstadoError mensaje={handleApiError(datos.error)}/>:<DataTable datos={datos.data} columnas={columnas}/>}</Card></>
}
