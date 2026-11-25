import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useCategorias } from '../../categorias/hooks/useCategorias'
import { useProductos } from '../hooks/useProductos'
import { ProductoCard } from '../components/ProductoCard'
import { Skeleton, EstadoVacio, EstadoError, Paginacion } from '../../../shared/components/Feedback'
import { handleApiError } from '../../../shared/api/handleApiError'
const LIMITE = 6
export function CatalogoPage() {
  const [pagina, setPagina] = useState(0)
  const [search, setSearch] = useState('')
  const [categoria_id, setCategoria] = useState(0)
  const categorias = useCategorias()
  const productos = useProductos({skip: pagina * LIMITE, limit: LIMITE, search: search.trim() || undefined, categoria_id: categoria_id || undefined})
  return <>
    <section className="hero-fondo mb-11 grid gap-10 rounded-[2.2rem] p-5 sm:p-8 text-white md:grid-cols-[1.15fr_.85fr] md:items-center md:px-14 md:py-12">
      <div className="relative z-10"><span className="info-chip inline-block border border-[#efc77e] text-[#f9db90]">HECHO CON GANAS · PARA DISFRUTAR</span>
        <h1 className="mt-5 text-[clamp(3.25rem,6.5vw,5.8rem)] font-black leading-[.93] tracking-[-.075em]">El hambre tiene <span className="titulo-editorial block text-[#f6ca71]">buen gusto.</span></h1>
        <p className="mt-6 max-w-md text-base leading-relaxed text-[#e1e9df]">Platos que se antojan, ingredientes que se sienten. Elegí tus favoritos y nosotros nos ocupamos del resto.</p>
        <div className="mt-7 flex flex-wrap items-center gap-3"><a href="#menu" className="inline-flex items-center rounded-xl bg-[#f3cc78] px-5 py-3 text-sm font-extrabold text-[#314131] transition hover:bg-[#ffe29a]">Explorar el menú <span className="ml-2">↗</span></a><Link to="/carrito" className="text-sm font-semibold underline underline-offset-4 hover:text-[#ffdda2]">Ver mi carrito</Link></div>
      </div>
      <div className="relative mx-auto flex h-72 w-full max-w-sm items-center justify-center md:h-88" aria-hidden>
        <span className="hero-plato absolute h-52 w-52 sm:h-66 sm:w-66 rotate-[-12deg] md:h-78 md:w-78"/>
        <span className="relative z-10 -rotate-12 text-[8rem] sm:text-[10.5rem] drop-shadow-[0_17px_12px_#412e2550] md:text-[12rem]">🍔</span>
        <span className="hero-sello absolute -right-1 -top-1 z-20 flex h-22 w-22 items-center justify-center border-2 border-dashed border-[#213d32] bg-[#f8e8b9] text-center text-[11px] font-extrabold uppercase leading-tight text-[#294231]">Tu pausa<br/>favorita</span>
        <span className="absolute bottom-4 left-0 z-20 rotate-[-9deg] rounded-lg bg-[#c95032] px-5 py-2 text-sm font-black text-white shadow-xl">¡Qué rico!</span>
      </div>
    </section>
    <section id="menu" className="scroll-mt-28"><div className="mb-7 flex flex-wrap items-end justify-between gap-5"><div><span className="text-xs font-extrabold uppercase tracking-[.2em] text-[#bb4c2e]">01 / LA CARTA</span><h2 className="titulo-seccion mt-2">Elegí tu próximo <span className="titulo-editorial text-[#bb4c2e]">favorito.</span></h2><p className="mt-2 text-sm text-[#738070]">Descubrí nuestras especialidades.</p></div>
      <div className="flex flex-wrap gap-2"><label className="sr-only" htmlFor="buscar-productos">Buscar productos</label><input id="buscar-productos" className="campo min-w-50 md:min-w-60" placeholder="¿Qué se te antoja?" value={search} onChange={e => {setSearch(e.target.value); setPagina(0)}}/>
        <label className="sr-only" htmlFor="filtrar-categoria">Filtrar por categoría</label><select id="filtrar-categoria" className="campo w-auto max-w-56" value={categoria_id} onChange={e => {setCategoria(Number(e.target.value)); setPagina(0)}}><option value={0}>Todas las categorías</option>{categorias.data?.map(c => <option key={c.id} value={c.id}>{c.nombre}</option>)}</select></div></div>
      {categorias.isError && <EstadoError mensaje={handleApiError(categorias.error)}/>}
      {productos.isPending ? <Skeleton/> : productos.isError ? <EstadoError mensaje={handleApiError(productos.error)}/> : productos.data.items.length === 0 ? <EstadoVacio mensaje="No encontramos productos con esos filtros. Probá con otra búsqueda."/> : <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">{productos.data.items.map(p => <ProductoCard key={p.id} producto={p}/>)}</div>}
      {productos.data && <Paginacion pagina={pagina} total={productos.data.total} limite={LIMITE} setPagina={setPagina}/>}</section>
    <aside className="mt-12 grid gap-4 rounded-[1.6rem] border border-[#e9e0cf] bg-[#f2ede0] px-6 py-7 text-sm text-[#53624f] md:grid-cols-3 md:gap-8"><p><strong className="block text-lg text-[#273d2f]">01 · Elegí</strong>Armá el pedido desde el menú.</p><p><strong className="block text-lg text-[#273d2f]">02 · Confirmá</strong>Indicá tu dirección y cómo pagás.</p><p><strong className="block text-lg text-[#273d2f]">03 · Disfrutá</strong>Seguí tu pedido desde tu cuenta.</p></aside>
  </>
}
