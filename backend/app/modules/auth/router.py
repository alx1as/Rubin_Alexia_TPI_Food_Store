from fastapi import APIRouter, Depends, Response
from fastapi.security import OAuth2PasswordRequestForm
from sqlmodel import Session
from app.core.config import get_settings
from app.core.database import get_session
from app.core.deps import get_current_active_user
from app.core.errors import http_errors
from app.core.security import create_access_token
from app.modules.auth.service import AuthService
from app.modules.auth.schemas import MensajeLogin
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic

router = APIRouter(prefix='/auth', tags=['Autenticación'])


@router.post('/register', response_model=UserPublic, status_code=201)
def register(data: UserCreate, session: Session = Depends(get_session)):
    with http_errors():
        return AuthService().registrar(data, session)


@router.post('/token', response_model=MensajeLogin)
def token(response: Response, form: OAuth2PasswordRequestForm = Depends(), session: Session = Depends(get_session)):
    with http_errors():
        user = AuthService().login(form.username, form.password, session)
        jwt_token = create_access_token(user.id)
        response.set_cookie(key='access_token', value=jwt_token, httponly=True, secure=get_settings().cookie_secure, samesite='lax', max_age=get_settings().access_token_expire_minutes * 60, path='/')
        return MensajeLogin(message='Login exitoso')


@router.post('/logout', response_model=MensajeLogin)
def logout(response: Response):
    response.delete_cookie('access_token', path='/', samesite='lax', httponly=True, secure=get_settings().cookie_secure)
    return MensajeLogin(message='Sesión cerrada')


@router.get('/me', response_model=UserPublic)
def me(user: Usuario = Depends(get_current_active_user)):
    return UserPublic.model_validate(user)
