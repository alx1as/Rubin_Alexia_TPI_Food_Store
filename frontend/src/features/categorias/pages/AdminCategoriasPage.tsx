import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { useCategorias } from '../hooks/useCategorias'
import { categoriasApi } from '../api/categorias'
import type { Categoria, CategoriaDatos } from '../types'
import { Button } from '../../../shared/ui/Button'
import { Card } from '../../../shared/ui/Card'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/Feedback'
import { handleApiError } from '../../../shared/api/handleApiError'

export function AdminCategoriasPage(){
  const datos=useCategorias()
  const qc=useQueryClient()
  const [editando,setEditando]=useState<number|null>(null)
  const [error,setError]=useState('')
  const guardar=useMutation({mutationFn:({id,data}:{id:number|null;data:CategoriaDatos})=>id===null?categoriasApi.crear(data):categoriasApi.editar(id,data),onSuccess:()=>{void qc.invalidateQueries({queryKey:['categorias']});void qc.invalidateQueries({queryKey:['productos']})}})
  const borrar=useMutation({mutationFn:categoriasApi.eliminar,onSuccess:()=>{void qc.invalidateQueries({queryKey:['categorias']});void qc.invalidateQueries({queryKey:['productos']})}})
  const form=useForm({defaultValues:{nombre:'',descripcion:''},onSubmit:async({value})=>{
    try{setError('');await guardar.mutateAsync({id:editando,data:value});form.reset();setEditando(null)}catch(e){setError(handleApiError(e))}
  }})
  const editar=(categoria:Categoria)=>{setEditando(categoria.id);form.setFieldValue('nombre',categoria.nombre);form.setFieldValue('descripcion',categoria.descripcion??'');window.scrollTo({top:0,behavior:'smooth'})}
  const eliminar=async(id:number)=>{if(!window.confirm('¿Dar de baja esta categoría? Sus productos seguirán activos.'))return;try{setError('');await borrar.mutateAsync(id)}catch(e){setError(handleApiError(e))}}
  const columnas:ColumnDef<Categoria,unknown>[]=[{accessorKey:'id',header:'ID'},{accessorKey:'nombre',header:'Nombre'},{accessorKey:'descripcion',header:'Descripción',cell:info=>String(info.getValue()??'—')},{id:'acciones',header:'Acciones',cell:({row})=><div className="flex gap-2"><Button variant="outline" onClick={()=>editar(row.original)}>Editar</Button><Button variant="danger" disabled={borrar.isPending} onClick={()=>void eliminar(row.original.id)}>Baja lógica</Button></div>}]
  return <div><h1 className="titulo-seccion mb-6">Categorías</h1><div className="grid gap-6 lg:grid-cols-[330px_1fr]"><Card className="h-fit"><h2 className="mb-4 text-xl font-bold">{editando===null?'Nueva categoría':'Editar categoría'}</h2><form className="space-y-4" onSubmit={e=>{e.preventDefault();e.stopPropagation();void form.handleSubmit()}}>
    <form.Field name="nombre" validators={{onChange:({value})=>value.trim().length<2?'Nombre de al menos 2 caracteres':undefined}} children={f=><label className="block"><span className="etiqueta">Nombre</span><input className="campo" required minLength={2} maxLength={100} value={f.state.value} onChange={e=>f.handleChange(e.target.value)} onBlur={f.handleBlur}/>{f.state.meta.errors.length>0&&<small className="text-red-700">{f.state.meta.errors.join(', ')}</small>}</label>}/>
    <form.Field name="descripcion" children={f=><label className="block"><span className="etiqueta">Descripción</span><textarea className="campo" rows={3} value={f.state.value} onChange={e=>f.handleChange(e.target.value)}/></label>}/>
    {error&&<EstadoError mensaje={error}/>}<Button type="submit" className="w-full" disabled={guardar.isPending}>Guardar categoría</Button>{editando!==null&&<Button variant="outline" type="button" className="w-full" onClick={()=>{form.reset();setEditando(null)}}>Cancelar edición</Button>}
  </form></Card><Card>{datos.isPending?<p>Cargando categorías…</p>:datos.isError?<EstadoError mensaje={handleApiError(datos.error)}/>:<DataTable datos={datos.data} columnas={columnas}/>}</Card></div></div>
}
