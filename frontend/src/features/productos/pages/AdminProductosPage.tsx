import { useState } from 'react'
import { useForm } from '@tanstack/react-form'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import type { ColumnDef } from '@tanstack/react-table'
import { useProductos } from '../hooks/useProductos'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { productosApi } from '../api/productos'
import { dinero } from '../components/ProductoCard'
import type { Producto, ProductoDatos } from '../types'
import { Card } from '../../../shared/ui/Card'
import { Button } from '../../../shared/ui/Button'
import { DataTable } from '../../../shared/components/DataTable'
import { EstadoError } from '../../../shared/components/Feedback'
import { handleApiError } from '../../../shared/api/handleApiError'

const vacio:ProductoDatos={nombre:'',descripcion:'',precio_base:0,imagen_url:'',stock:0,disponible:true,categoria_id:0}
export function AdminProductosPage(){
  const datos=useProductos({limit:100})
  const categorias=useCategorias()
  const qc=useQueryClient()
  const [editando,setEditando]=useState<number|null>(null)
  const [original,setOriginal]=useState<ProductoDatos|null>(null)
  const [error,setError]=useState('')
  const actualizar=()=>{void qc.invalidateQueries({queryKey:['productos']})}
  const guardar=useMutation({mutationFn:({id,data}:{id:number|null;data:ProductoDatos})=>id===null?productosApi.crear(data):productosApi.editar(id, original ? Object.fromEntries(Object.entries(data).filter(([key, value]) => value !== original[key as keyof ProductoDatos])) : data),onSuccess:actualizar})
  const borrar=useMutation({mutationFn:productosApi.eliminar,onSuccess:actualizar})
  const stock=useMutation({mutationFn:({id,cantidad,disponible}:{id:number;cantidad:number;disponible:boolean})=>productosApi.stock(id,cantidad,disponible),onSuccess:actualizar})
  const form=useForm({defaultValues:{...vacio},onSubmit:async({value})=>{
    try{setError('');await guardar.mutateAsync({id:editando,data:value});form.reset();setEditando(null);setOriginal(null)}catch(e){setError(handleApiError(e))}
  }})
  const editar=(p:Producto)=>{setOriginal({nombre:p.nombre,descripcion:p.descripcion??'',precio_base:p.precio_base,imagen_url:p.imagen_url??'',stock:p.stock,disponible:p.disponible,categoria_id:p.categoria_id});setEditando(p.id);form.setFieldValue('nombre',p.nombre);form.setFieldValue('descripcion',p.descripcion??'');form.setFieldValue('precio_base',p.precio_base);form.setFieldValue('imagen_url',p.imagen_url??'');form.setFieldValue('stock',p.stock);form.setFieldValue('disponible',p.disponible);form.setFieldValue('categoria_id',p.categoria_id);window.scrollTo({top:0,behavior:'smooth'})}
  const eliminar=async(id:number)=>{if(!window.confirm('¿Dar de baja este producto?'))return;try{setError('');await borrar.mutateAsync(id)}catch(e){setError(handleApiError(e))}}
  const cambiarStock=async(p:Producto)=>{const entrada=window.prompt(`Nuevo stock de ${p.nombre}:`,String(p.stock));if(entrada===null)return;const n=Number(entrada);if(!entrada.trim()||!Number.isInteger(n)||n<0){setError('El stock debe ser un entero mayor o igual a cero');return}try{setError('');await stock.mutateAsync({id:p.id,cantidad:n,disponible:p.disponible})}catch(e){setError(handleApiError(e))}}
  const toggleDisponible=async(p:Producto)=>{try{setError('');await stock.mutateAsync({id:p.id,cantidad:p.stock,disponible:!p.disponible})}catch(e){setError(handleApiError(e))}}
  const columnas:ColumnDef<Producto,unknown>[]=[{accessorKey:'nombre',header:'Producto'},{id:'categoria',header:'Categoría',cell:({row})=>row.original.categoria.nombre},{accessorKey:'precio_base',header:'Precio',cell:({row})=>dinero(row.original.precio_base)},{accessorKey:'stock',header:'Stock'},{id:'disponible',header:'Disponible',cell:({row})=>row.original.disponible?'Sí':'No'},{id:'acciones',header:'Acciones',cell:({row})=><div className="flex flex-wrap gap-1"><Button variant="outline" disabled={guardar.isPending || stock.isPending || borrar.isPending} onClick={()=>editar(row.original)}>Editar</Button><Button variant="outline" disabled={guardar.isPending || stock.isPending || borrar.isPending} onClick={()=>void cambiarStock(row.original)}>Stock</Button><Button variant="light" disabled={guardar.isPending || stock.isPending || borrar.isPending} onClick={()=>void toggleDisponible(row.original)}>{row.original.disponible?'Pausar':'Habilitar'}</Button><Button variant="danger" disabled={guardar.isPending || stock.isPending || borrar.isPending} onClick={()=>void eliminar(row.original.id)}>Baja</Button></div>}]
  return <div><h1 className="titulo-seccion mb-6">Productos</h1><div className="grid gap-6 xl:grid-cols-[340px_1fr]"><Card className="h-fit"><h2 className="mb-4 text-xl font-bold">{editando===null?'Nuevo producto':'Editar producto'}</h2><form className="space-y-3" onSubmit={e=>{e.preventDefault();e.stopPropagation();void form.handleSubmit()}}>
    <form.Field name="nombre" validators={{onChange:({value})=>!value.trim()?'Ingresá un nombre':undefined}} children={f=><label className="block"><span className="etiqueta">Nombre</span><input className="campo" required value={f.state.value} onBlur={f.handleBlur} onChange={e=>f.handleChange(e.target.value)}/>{f.state.meta.errors.length>0&&<small className="text-red-700">{f.state.meta.errors.join(', ')}</small>}</label>}/>
    <form.Field name="categoria_id" validators={{onChange:({value})=>value<=0?'Seleccioná una categoría':undefined}} children={f=><label className="block"><span className="etiqueta">Categoría</span><select className="campo" required value={f.state.value} onChange={e=>f.handleChange(Number(e.target.value))}><option value={0}>Elegir categoría</option>{categorias.data?.map(c=><option key={c.id} value={c.id}>{c.nombre}</option>)}</select></label>}/>
    <form.Field name="descripcion" children={f=><label className="block"><span className="etiqueta">Descripción</span><textarea className="campo" rows={2} value={f.state.value} onChange={e=>f.handleChange(e.target.value)}/></label>}/>
    <form.Field name="precio_base" validators={{onChange:({value})=>value<0?'Precio inválido':undefined}} children={f=><label className="block"><span className="etiqueta">Precio</span><input className="campo" type="number" step="0.01" min={0} required value={f.state.value} onChange={e=>f.handleChange(Number(e.target.value))}/></label>}/>
    <form.Field name="stock" children={f=><label className="block"><span className="etiqueta">Stock</span><input className="campo" type="number" min={0} step={1} value={f.state.value} onChange={e=>f.handleChange(Number(e.target.value))}/></label>}/>
    <form.Field name="imagen_url" children={f=><label className="block"><span className="etiqueta">URL de la imagen (opcional)</span><input className="campo" type="url" placeholder="https://..." value={f.state.value} onChange={e=>f.handleChange(e.target.value)}/></label>}/>
    <form.Field name="disponible" children={f=><label className="flex items-center gap-2 text-sm"><input type="checkbox" checked={f.state.value} onChange={e=>f.handleChange(e.target.checked)}/> Disponible</label>}/>
    {error&&<EstadoError mensaje={error}/>}<Button type="submit" className="w-full" disabled={guardar.isPending}>Guardar producto</Button>{editando!==null&&<Button type="button" variant="outline" className="w-full" onClick={()=>{form.reset();setEditando(null);setOriginal(null)}}>Cancelar edición</Button>}
  </form></Card><Card>{datos.isPending?<p>Cargando productos…</p>:datos.isError?<EstadoError mensaje={handleApiError(datos.error)}/>:<DataTable datos={datos.data.items} columnas={columnas}/>}</Card></div></div>
}
