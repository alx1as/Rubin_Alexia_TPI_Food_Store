import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom'
import { useAuthStore } from '../../store/authStore'
import { useCartStore } from '../../store/cartStore'
import { Button } from '../ui/Button'
export function Navbar() {
  const usuario = useAuthStore((s) => s.usuario)
  const logout = useAuthStore((s) => s.logout)
  const cantidad = useCartStore((s) => s.items.reduce((total, i) => total + i.cantidad, 0))
  const navigate = useNavigate()
  const enAdmin = useLocation().pathname.startsWith('/admin/')
  const cerrar = async () => { try { await logout() } catch { /* La sesión local se limpia igualmente. */ } navigate('/login') }
  return <header className="sticky top-0 z-40 border-b border-[#e5e5d9] bg-[#faf8f2]/95 backdrop-blur-lg">
    <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-3 px-5 py-3.5">
      <Link aria-label="Food Store, ir al inicio" to="/" className="flex items-center gap-2 text-2xl font-black tracking-[-0.065em] text-[#253d31]"><span aria-hidden className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#f3d37d] text-xl text-[#bd492c]">✳</span>food<span className="text-[#c3502b]">store.</span></Link>
      <nav aria-label="Navegación principal" className="flex flex-wrap items-center gap-3 text-sm font-semibold md:gap-6">
        <NavLink end to="/" className="nav-link">Menú</NavLink>
        {!enAdmin && <NavLink to="/carrito" className="nav-link">Carrito <span className="rounded-full bg-[#f4d77e] px-2 py-1 text-xs text-[#483c1e]">{cantidad}</span></NavLink>}
        {usuario?.role === 'user' && !enAdmin && <NavLink to="/mis-pedidos" className="nav-link">Mis pedidos</NavLink>}
        {usuario?.role === 'admin' && <><NavLink to="/admin/resumen" className="nav-link">Administración</NavLink>{enAdmin && <><NavLink to="/admin/categorias" className="nav-link">Categorías</NavLink><NavLink to="/admin/productos" className="nav-link">Productos</NavLink><NavLink to="/admin/pedidos" className="nav-link">Pedidos</NavLink><NavLink to="/admin/usuarios" className="nav-link">Usuarios</NavLink></>}</>}
      </nav>
      <div className="flex items-center gap-2">{usuario ? <><span className="hidden text-sm text-[#677568] sm:block">Hola, {usuario.full_name.split(' ')[0]}</span><Button variant="outline" onClick={() => void cerrar()}>Salir</Button></> : <Link to="/login"><Button>Ingresar</Button></Link>}</div>
    </div>
  </header>
}
