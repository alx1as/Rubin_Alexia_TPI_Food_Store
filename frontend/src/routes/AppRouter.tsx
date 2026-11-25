import { BrowserRouter, Routes, Route, Link, Navigate } from 'react-router-dom'
import { useAuthStore } from '../store/authStore'
import { MainLayout } from '../shared/layout/MainLayout'
import { ProtectedRoute } from './ProtectedRoute'
import { LoginPage } from '../features/auth/pages/LoginPage'
import { RegisterPage } from '../features/auth/pages/RegisterPage'
import { CatalogoPage } from '../features/productos/pages/CatalogoPage'
import { CarritoPage } from '../features/pedidos/pages/CarritoPage'
import { CheckoutPage } from '../features/pedidos/pages/CheckoutPage'
import { MisPedidosPage } from '../features/pedidos/pages/MisPedidosPage'
import { AdminResumenPage } from '../features/pedidos/pages/AdminResumenPage'
import { AdminPedidosPage } from '../features/pedidos/pages/AdminPedidosPage'
import { AdminCategoriasPage } from '../features/categorias/pages/AdminCategoriasPage'
import { AdminProductosPage } from '../features/productos/pages/AdminProductosPage'
import { AdminUsuariosPage } from '../features/usuarios/pages/AdminUsuariosPage'

function MisPedidosRoute() {
  const usuario = useAuthStore(s => s.usuario)
  return usuario?.role === 'admin' ? <Navigate to="/admin/pedidos" replace/> : <MisPedidosPage/>
}

export function AppRouter(){ return <BrowserRouter><Routes>
  <Route element={<MainLayout/>}>
    <Route path="/" element={<CatalogoPage/>}/>
    <Route path="/login" element={<LoginPage/>}/>
    <Route path="/register" element={<RegisterPage/>}/>
    <Route path="/carrito" element={<CarritoPage/>}/>
    <Route path="/unauthorized" element={<div className="mx-auto max-w-lg py-20 text-center"><h1 className="titulo-seccion">Sin permisos</h1><p>No tenés autorización para acceder a esta pantalla.</p><Link to="/" className="underline">Ir al catálogo</Link></div>}/>
    <Route element={<ProtectedRoute/>}>
      <Route path="/checkout" element={<CheckoutPage/>}/>
      <Route path="/mis-pedidos" element={<MisPedidosRoute/>}/>
    </Route>
    <Route element={<ProtectedRoute rol="admin"/>}>
      <Route path="/admin/resumen" element={<AdminResumenPage/>}/>
      <Route path="/admin/categorias" element={<AdminCategoriasPage/>}/>
      <Route path="/admin/productos" element={<AdminProductosPage/>}/>
      <Route path="/admin/pedidos" element={<AdminPedidosPage/>}/>
      <Route path="/admin/usuarios" element={<AdminUsuariosPage/>}/>
    </Route>
    <Route path="*" element={<div><h1 className="titulo-seccion">No encontramos esa página</h1><Link to="/" className="underline">Volver al inicio</Link></div>}/>
  </Route>
</Routes></BrowserRouter> }
