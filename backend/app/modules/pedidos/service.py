from datetime import datetime, timezone
from app.core.errors import DomainError
from app.modules.pedidos.models import Pedido, DetallePedido
from app.modules.pedidos.schemas import PedidoCreate, PedidoRead, PedidosPaginados, ResumenPedidos, EstadoPedido
from app.modules.pedidos.unit_of_work import PedidoUnitOfWork

TRANSICIONES: dict[str, set[str]] = {
    'PENDIENTE': {'EN_PREPARACION', 'CANCELADO'},
    'EN_PREPARACION': {'ENTREGADO', 'CANCELADO'},
    'ENTREGADO': set(),
    'CANCELADO': set(),
}


class PedidoService:
    def __init__(self, uow: PedidoUnitOfWork | None = None):
        self.uow = uow or PedidoUnitOfWork()

    def crear(self, datos: PedidoCreate, usuario_id: int) -> PedidoRead:
        with self.uow as uow:
            uow.lock_writes()
            ids = [i.producto_id for i in datos.items]
            if len(ids) != len(set(ids)):
                raise DomainError(400, 'Un producto no puede repetirse en un pedido')
            # Orden de bloqueos estable: reduce deadlocks si compran varios usuarios al mismo tiempo.
            productos = {}
            for producto_id in sorted(ids):
                producto = uow.productos.locked(producto_id)
                if producto is None or not producto.activo:
                    raise DomainError(404, f'Producto {producto_id} no encontrado')
                productos[producto_id] = producto
            pedido = Pedido(usuario_id=usuario_id, forma_pago=datos.forma_pago, direccion_entrega=datos.direccion_entrega, notas=datos.notas, estado='PENDIENTE', total=0)
            uow.pedidos.add(pedido)
            uow.session.flush()
            total = 0.0
            for item in datos.items:
                p = productos[item.producto_id]
                if not p.disponible:
                    raise DomainError(400, f'Producto {p.nombre} no disponible')
                if p.stock < item.cantidad:
                    raise DomainError(400, f'Stock insuficiente de {p.nombre}')
                p.stock -= item.cantidad
                subtotal = p.precio_base * item.cantidad
                detalle = DetallePedido(pedido_id=pedido.id, producto_id=p.id, cantidad=item.cantidad, nombre_producto=p.nombre, precio_unitario=p.precio_base, subtotal=subtotal)
                uow.session.add(p)
                uow.session.add(detalle)
                total += subtotal
            pedido.total = total
            uow.session.add(pedido)
            uow.session.flush()
            uow.session.refresh(pedido)
            return PedidoRead.model_validate(pedido)

    def listar(self, usuario_id: int | None, estado: EstadoPedido | None, skip: int, limit: int) -> PedidosPaginados:
        with self.uow as uow:
            pedidos, total = uow.pedidos.list_by_usuario(usuario_id, estado, skip, limit)
            return PedidosPaginados(total=total, items=[PedidoRead.model_validate(p) for p in pedidos])

    def obtener(self, id_: int, usuario_id: int, admin: bool) -> PedidoRead:
        with self.uow as uow:
            pedido = uow.pedidos.get_by_id(id_)
            if not pedido:
                raise DomainError(404, 'Pedido no encontrado')
            if not admin and pedido.usuario_id != usuario_id:
                raise DomainError(403, 'Pedido ajeno')
            return PedidoRead.model_validate(pedido)

    def cambiar_estado(self, id_: int, nuevo: EstadoPedido, usuario_id: int, admin: bool) -> PedidoRead:
        with self.uow as uow:
            uow.lock_writes()
            pedido = uow.pedidos.locked(id_)
            if not pedido:
                raise DomainError(404, 'Pedido no encontrado')
            if not admin and pedido.usuario_id != usuario_id:
                raise DomainError(403, 'Pedido ajeno')
            if not admin and (pedido.estado != 'PENDIENTE' or nuevo != 'CANCELADO'):
                raise DomainError(400, 'El cliente solo puede cancelar un pedido PENDIENTE')
            if nuevo not in TRANSICIONES[pedido.estado]:
                raise DomainError(400, f'Transición inválida: {pedido.estado} → {nuevo}')
            if nuevo == 'CANCELADO':
                for detalle in sorted(pedido.items, key=lambda item: item.producto_id):
                    producto = uow.productos.locked(detalle.producto_id)
                    if producto is None:
                        raise DomainError(404, 'Producto del pedido no encontrado')
                    producto.stock += detalle.cantidad
                    uow.session.add(producto)
            pedido.estado = nuevo
            pedido.updated_at = datetime.now(timezone.utc)
            uow.session.add(pedido)
            uow.session.flush()
            return PedidoRead.model_validate(pedido)

    def resumen(self) -> ResumenPedidos:
        with self.uow as uow:
            repo = uow.pedidos
            return ResumenPedidos(
                pendientes=repo.count_by_estado('PENDIENTE'),
                en_preparacion=repo.count_by_estado('EN_PREPARACION'),
                entregados=repo.count_by_estado('ENTREGADO'),
                cancelados=repo.count_by_estado('CANCELADO'),
                pedidos_hoy=repo.pedidos_hoy(),
                ingresos_entregados=repo.ingresos_entregados(),
            )
