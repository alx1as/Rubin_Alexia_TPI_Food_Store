from fastapi import APIRouter, Depends, Query
from app.core.deps import get_current_active_user, require_role
from app.core.errors import http_errors
from app.modules.usuarios.models import Usuario
from app.modules.pedidos.schemas import PedidoCreate, PedidoRead, PedidosPaginados, CambioEstado, ResumenPedidos, EstadoPedido
from app.modules.pedidos.service import PedidoService

router = APIRouter(prefix='/pedidos', tags=['Pedidos'])


def get_pedido_service() -> PedidoService:
    return PedidoService()


@router.post('', response_model=PedidoRead, status_code=201)
def crear(datos: PedidoCreate, user: Usuario = Depends(get_current_active_user), service: PedidoService = Depends(get_pedido_service)):
    with http_errors():
        return service.crear(datos, user.id)


@router.get('', response_model=PedidosPaginados)
def listar(skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100), estado: EstadoPedido | None = None, user: Usuario = Depends(get_current_active_user), service: PedidoService = Depends(get_pedido_service)):
    with http_errors():
        return service.listar(None if user.role == 'admin' else user.id, estado, skip, limit)


@router.get('/resumen', response_model=ResumenPedidos)
def resumen(_admin: Usuario = Depends(require_role(['admin'])), service: PedidoService = Depends(get_pedido_service)):
    with http_errors():
        return service.resumen()


@router.get('/{id_}', response_model=PedidoRead)
def obtener(id_: int, user: Usuario = Depends(get_current_active_user), service: PedidoService = Depends(get_pedido_service)):
    with http_errors():
        return service.obtener(id_, user.id, user.role == 'admin')


@router.patch('/{id_}/estado', response_model=PedidoRead)
def cambiar_estado(id_: int, datos: CambioEstado, admin: Usuario = Depends(require_role(['admin'])), service: PedidoService = Depends(get_pedido_service)):
    with http_errors():
        return service.cambiar_estado(id_, datos.estado, admin.id, True)


@router.patch('/{id_}/cancelar', response_model=PedidoRead)
def cancelar(id_: int, user: Usuario = Depends(get_current_active_user), service: PedidoService = Depends(get_pedido_service)):
    with http_errors():
        return service.cambiar_estado(id_, 'CANCELADO', user.id, False)
