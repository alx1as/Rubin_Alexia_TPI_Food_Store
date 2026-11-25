from fastapi import APIRouter, Depends
from sqlmodel import Session
from app.core.database import get_session
from app.core.deps import require_role
from app.core.errors import http_errors
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserPublic
from app.modules.usuarios.service import UsuarioService

router = APIRouter(prefix='/admin/usuarios', tags=['Administración de usuarios'])


@router.get('', response_model=list[UserPublic])
def listar(_admin: Usuario = Depends(require_role(['admin'])), session: Session = Depends(get_session)):
    return UsuarioService().listar(session)


@router.post('/{id_}/activar', response_model=UserPublic)
def activar(id_: int, _admin: Usuario = Depends(require_role(['admin'])), session: Session = Depends(get_session)):
    with http_errors():
        return UsuarioService().activar(id_, session)


@router.post('/{id_}/desactivar', response_model=UserPublic)
def desactivar(id_: int, admin: Usuario = Depends(require_role(['admin'])), session: Session = Depends(get_session)):
    with http_errors():
        return UsuarioService().desactivar(id_, admin.id, session)
