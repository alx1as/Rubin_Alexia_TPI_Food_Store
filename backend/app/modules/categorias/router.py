from fastapi import APIRouter, Depends, Response, status
from app.core.deps import require_role
from app.core.errors import http_errors
from app.modules.categorias.schemas import CategoriaCreate, CategoriaUpdate, CategoriaRead
from app.modules.categorias.service import CategoriaService

router = APIRouter(prefix='/categorias', tags=['Categorías'])


def get_categoria_service() -> CategoriaService:
    return CategoriaService()


@router.get('', response_model=list[CategoriaRead])
def listar(service: CategoriaService = Depends(get_categoria_service)):
    with http_errors():
        return service.listar()


@router.get('/{id_}', response_model=CategoriaRead)
def obtener(id_: int, service: CategoriaService = Depends(get_categoria_service)):
    with http_errors():
        return service.obtener(id_)


@router.post('', response_model=CategoriaRead, status_code=201, dependencies=[Depends(require_role(['admin']))])
def crear(datos: CategoriaCreate, service: CategoriaService = Depends(get_categoria_service)):
    with http_errors():
        return service.crear(datos)


@router.put('/{id_}', response_model=CategoriaRead, dependencies=[Depends(require_role(['admin']))])
def editar(id_: int, datos: CategoriaUpdate, service: CategoriaService = Depends(get_categoria_service)):
    with http_errors():
        return service.editar(id_, datos)


@router.delete('/{id_}', status_code=204, dependencies=[Depends(require_role(['admin']))])
def eliminar(id_: int, service: CategoriaService = Depends(get_categoria_service)) -> Response:
    with http_errors():
        service.eliminar(id_)
        return Response(status_code=status.HTTP_204_NO_CONTENT)
