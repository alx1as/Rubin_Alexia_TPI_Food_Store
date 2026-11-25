from sqlmodel import SQLModel


class MensajeLogin(SQLModel):
    message: str
