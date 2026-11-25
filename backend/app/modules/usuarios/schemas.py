from datetime import datetime
from pydantic import EmailStr, field_validator
from sqlmodel import SQLModel, Field


class UserCreate(SQLModel):
    username: str = Field(min_length=3, max_length=50)
    full_name: str = Field(min_length=1)
    email: EmailStr
    password: str = Field(min_length=8)

    @field_validator("username", "full_name", mode="before")
    @classmethod
    def limpiar_texto(cls, valor):
        return valor.strip() if isinstance(valor, str) else valor

    @field_validator("password")
    @classmethod
    def validar_password(cls, value: str) -> str:
        if len(value.encode("utf-8")) > 72:
            raise ValueError("La contraseña no puede superar 72 bytes")
        return value


class UserPublic(SQLModel):
    id: int
    username: str
    full_name: str
    email: str
    role: str
    disabled: bool
    created_at: datetime
