from sqlmodel import Session, select
from sqlalchemy.exc import IntegrityError
from app.core.errors import DomainError
from app.core.security import hash_password, verify_password
from app.modules.usuarios.models import Usuario
from app.modules.usuarios.schemas import UserCreate, UserPublic


class UsuarioService:
    def registrar(self, data: UserCreate, session: Session) -> UserPublic:
        if session.exec(select(Usuario).where((Usuario.username == data.username) | (Usuario.email == data.email))).first():
            raise DomainError(409, 'Nombre de usuario o correo ya registrado')
        obj = Usuario(username=data.username, full_name=data.full_name, email=data.email, hashed_password=hash_password(data.password), role='user')
        session.add(obj)
        try:
            session.commit()
        except IntegrityError as exc:
            session.rollback()
            raise DomainError(409, 'Nombre de usuario o correo ya registrado') from exc
        session.refresh(obj)
        return UserPublic.model_validate(obj)

    def login(self, username: str, password: str, session: Session) -> Usuario:
        user = session.exec(select(Usuario).where(Usuario.username == username)).first()
        if not user or not verify_password(password, user.hashed_password):
            raise DomainError(401, 'Credenciales incorrectas')
        if user.disabled:
            raise DomainError(400, 'Cuenta de usuario desactivada')
        return user

    def listar(self, session: Session) -> list[UserPublic]:
        return [UserPublic.model_validate(x) for x in session.exec(select(Usuario).order_by(Usuario.id)).all()]

    def activar(self, id_: int, session: Session) -> UserPublic:
        user = session.get(Usuario, id_)
        if not user:
            raise DomainError(404, 'Usuario no encontrado')
        user.disabled = False
        session.add(user)
        session.commit()
        session.refresh(user)
        return UserPublic.model_validate(user)

    def desactivar(self, id_: int, admin_id: int, session: Session) -> UserPublic:
        user = session.get(Usuario, id_)
        if not user:
            raise DomainError(404, 'Usuario no encontrado')
        if user.id == admin_id:
            raise DomainError(400, 'No podés desactivar tu propio usuario administrador')
        user.disabled = True
        session.add(user)
        session.commit()
        session.refresh(user)
        return UserPublic.model_validate(user)
