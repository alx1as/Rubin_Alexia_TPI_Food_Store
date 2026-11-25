import { Link } from 'react-router-dom'
import { useResumenPedidos } from '../hooks/usePedidos'
import { Card } from '../../../shared/ui/Card'
import { EstadoError, Skeleton } from '../../../shared/components/Feedback'
import { handleApiError } from '../../../shared/api/handleApiError'
import { dinero } from '../../productos/components/ProductoCard'
const enlaces = [
  { titulo: 'Categorías', url: '/admin/categorias', icono: '▦', nota: 'Organizá tu carta' },
  { titulo: 'Productos', url: '/admin/productos', icono: '◈', nota: 'Precios y disponibilidad' },
  { titulo: 'Pedidos', url: '/admin/pedidos', icono: '▤', nota: 'Preparación y entregas' },
  { titulo: 'Usuarios', url: '/admin/usuarios', icono: '◎', nota: 'Cuentas y permisos' },
]
export function AdminResumenPage() {
  const resumen = useResumenPedidos()
  const indicadores = resumen.data ? [
    {titulo: 'Pendientes', valor: resumen.data.pendientes, fondo: '#f4dec0', simbolo: '◷'},
    {titulo: 'En preparación', valor: resumen.data.en_preparacion, fondo: '#dee9dc', simbolo: '◉'},
    {titulo: 'Entregados', valor: resumen.data.entregados, fondo: '#cce4cb', simbolo: '✓'},
    {titulo: 'Cancelados', valor: resumen.data.cancelados, fondo: '#f3d8cf', simbolo: '×'},
    {titulo: 'Pedidos hoy', valor: resumen.data.pedidos_hoy, fondo: '#f8e6af', simbolo: '✳'},
    {titulo: 'Ingresos entregados', valor: dinero(resumen.data.ingresos_entregados), fondo: '#c7dac9', simbolo: '$'},
  ] : []
  return <div>
    <div className="mb-8 flex flex-wrap items-end justify-between gap-4"><div><p className="mb-2 text-xs font-extrabold uppercase tracking-[.22em] text-[#c3502b]">Back office / Food Store</p><h1 className="titulo-seccion">Tu negocio, <span className="titulo-editorial text-[#bd4f31]">de un vistazo.</span></h1><p className="mt-3 text-sm text-[#708072]">Seguí el pulso de cada pedido y administrá tu carta desde un solo lugar.</p></div><Link to="/" className="boton-secundario text-sm font-semibold">↗ Ver tienda</Link></div>
    {resumen.isPending ? <Skeleton cantidad={6}/> : resumen.isError ? <EstadoError mensaje={handleApiError(resumen.error)}/> : <div className="mb-11 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">{indicadores.map(i => <Card key={i.titulo} className="relative overflow-hidden p-6"><div className="flex items-start justify-between"><p className="text-sm font-semibold text-[#647366]">{i.titulo}</p><span style={{backgroundColor:i.fondo}} className="flex h-10 w-10 items-center justify-center rounded-full text-xl font-black text-[#354e3a]" aria-hidden>{i.simbolo}</span></div><strong className="mt-3 block text-4xl font-black tracking-[-.06em] text-[#273b30]">{i.valor}</strong></Card>)}</div>}
    <div className="mb-5 flex items-center gap-4"><h2 className="text-2xl font-black tracking-tight">Centro de gestión</h2><div className="raya-decorativa flex-1"/></div>
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{enlaces.map(e => <Link key={e.url} to={e.url} className="group rounded-2xl border border-[#e4e2d6] bg-[#fffefa] p-5 transition hover:-translate-y-1 hover:border-[#d6c9aa] hover:shadow-md"><span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-[#f6e7cc] text-2xl font-black text-[#c3502b]" aria-hidden>{e.icono}</span><strong className="block text-lg text-[#273e30]">{e.titulo} <span aria-hidden className="float-right text-[#c3502b] group-hover:translate-x-1">↗</span></strong><p className="mt-1 text-xs text-[#778076]">{e.nota}</p></Link>)}</div>
  </div>
}
