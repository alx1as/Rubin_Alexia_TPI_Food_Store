from fastapi import APIRouter, Depends, Query, Response
from app.core.deps import require_role
from app.core.errors import http_errors
from app.modules.productos.schemas import ProductoCreate, ProductoUpdate, ProductoStockUpdate, ProductoRead, ProductosPaginados
from app.modules.productos.service import ProductoService

router = APIRouter(prefix='/productos', tags=['Productos'])


def get_producto_service() -> ProductoService:
    return ProductoService()


@router.get('', response_model=ProductosPaginados)
def listar(skip: int = Query(0, ge=0), limit: int = Query(20, ge=1, le=100), search: str | None = None, categoria_id: int | None = None, disponible: bool | None = None, service: ProductoService = Depends(get_producto_service)):
    with http_errors():
        return service.buscar(skip, limit, search, categoria_id, disponible)


@router.get('/{id_}', response_model=ProductoRead)
def obtener(id_: int, service: ProductoService = Depends(get_producto_service)):
    with http_errors():
        return service.obtener(id_)


@router.post('', response_model=ProductoRead, status_code=201, dependencies=[Depends(require_role(['admin']))])
def crear(datos: ProductoCreate, service: ProductoService = Depends(get_producto_service)):
    with http_errors():
        return service.crear(datos)


@router.put('/{id_}', response_model=ProductoRead, dependencies=[Depends(require_role(['admin']))])
def editar(id_: int, datos: ProductoUpdate, service: ProductoService = Depends(get_producto_service)):
    with http_errors():
        return service.editar(id_, datos)


@router.patch('/{id_}/stock', response_model=ProductoRead, dependencies=[Depends(require_role(['admin']))])
def stock(id_: int, datos: ProductoStockUpdate, service: ProductoService = Depends(get_producto_service)):
    with http_errors():
        return service.cambiar_stock(id_, datos)


@router.delete('/{id_}', status_code=204, dependencies=[Depends(require_role(['admin']))])
def eliminar(id_: int, service: ProductoService = Depends(get_producto_service)) -> Response:
    with http_errors():
        service.eliminar(id_)
        return Response(status_code=204)
