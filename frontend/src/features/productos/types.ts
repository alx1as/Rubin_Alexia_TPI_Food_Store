import type { Categoria } from '../categorias/types'
export interface Producto {
  id: number; categoria_id: number; nombre: string; descripcion: string | null;
  precio_base: number; imagen_url: string | null; stock: number; disponible: boolean;
  activo: boolean; categoria: Categoria
}
export interface ProductosPaginados { total: number; items: Producto[] }
export interface ProductoDatos { categoria_id: number; nombre: string; descripcion: string; precio_base: number; imagen_url: string; stock: number; disponible: boolean }
export interface FiltrosProducto { skip?: number; limit?: number; search?: string; categoria_id?: number; disponible?: boolean }
