from datetime import datetime, timedelta, timezone
from jose import JWTError, jwt
from passlib.context import CryptContext
from app.core.config import get_settings

password_context = CryptContext(schemes=['bcrypt'], deprecated='auto')


def hash_password(password: str) -> str:
    return password_context.hash(password)


def verify_password(password: str, hashed: str) -> bool:
    if len(password.encode("utf-8")) > 72:
        return False
    return password_context.verify(password, hashed)


def create_access_token(user_id: int) -> str:
    conf = get_settings()
    exp = datetime.now(timezone.utc) + timedelta(minutes=conf.access_token_expire_minutes)
    return jwt.encode({'sub': str(user_id), 'exp': exp}, conf.secret_key, algorithm=conf.algorithm)


def decode_access_token(token: str) -> int | None:
    try:
        data = jwt.decode(token, get_settings().secret_key, algorithms=[get_settings().algorithm], options={"require_exp": True, "require_sub": True})
        return int(data['sub'])
    except (JWTError, ValueError, KeyError, TypeError):
        return None
