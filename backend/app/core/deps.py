from collections.abc import Callable
from fastapi import Depends, HTTPException, Request
from sqlmodel import Session
from app.core.database import get_session
from app.core.security import decode_access_token
from app.modules.usuarios.models import Usuario


def get_current_user(request: Request, session: Session = Depends(get_session)) -> Usuario:
    token = request.cookies.get('access_token')
    user_id = decode_access_token(token) if token else None
    usuario = session.get(Usuario, user_id) if user_id is not None else None
    if usuario is None:
        raise HTTPException(status_code=401, detail='Sesión inválida o vencida')
    return usuario


def get_current_active_user(usuario: Usuario = Depends(get_current_user)) -> Usuario:
    if usuario.disabled:
        raise HTTPException(status_code=400, detail='Cuenta de usuario desactivada')
    return usuario


def require_role(roles: list[str]) -> Callable[..., Usuario]:
    def check(usuario: Usuario = Depends(get_current_active_user)) -> Usuario:
        if usuario.role not in roles:
            raise HTTPException(status_code=403, detail='Permiso insuficiente')
        return usuario
    return check
