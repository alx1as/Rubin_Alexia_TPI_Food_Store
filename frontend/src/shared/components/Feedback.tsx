import { Card } from '../ui/Card'
export function Skeleton({ cantidad = 6 }: {cantidad?: number}) {
  return <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">{Array.from({length:cantidad},(_,i)=><div key={i} className="h-60 animate-pulse rounded-2xl bg-[#eee9dc]"/>)}</div>
}
export function EstadoVacio({mensaje='No hay resultados.'}: {mensaje?: string}) { return <Card className="text-center text-[#647364] py-14">{mensaje}</Card> }
export function EstadoError({mensaje}: {mensaje:string}) { return <div role="alert" className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-800">{mensaje}</div> }
export function Paginacion({ pagina, total, limite, setPagina }: {pagina:number; total:number; limite:number; setPagina:(pagina:number)=>void}) {
  const paginas = Math.max(1,Math.ceil(total/limite))
  return <div className="flex flex-wrap items-center justify-between gap-3 py-4 text-sm"><span className="text-[#66766b]">Página {pagina+1} de {paginas} · {total} resultados</span><div className="flex gap-2"><button className="boton-secundario" disabled={pagina<=0} onClick={()=>setPagina(pagina-1)}>Anterior</button><button className="boton-secundario" disabled={pagina>=paginas-1} onClick={()=>setPagina(pagina+1)}>Siguiente</button></div></div>
}
