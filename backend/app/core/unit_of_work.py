from types import TracebackType
from typing_extensions import Self
from sqlmodel import Session
from sqlalchemy import text
from app.core.database import session_factory


class UnitOfWork:
    def __init__(self) -> None:
        self.session: Session | None = None

    def __enter__(self) -> Self:
        self.session = session_factory()
        return self

    def lock_writes(self) -> None:
        # SQLite no implementa FOR UPDATE: reservar la escritura antes de leer.
        assert self.session is not None
        if self.session.get_bind().dialect.name == "sqlite":
            self.session.execute(text("BEGIN IMMEDIATE"))

    def __exit__(self, exc_type: type[BaseException] | None, exc: BaseException | None, tb: TracebackType | None) -> bool:
        assert self.session is not None
        try:
            if exc_type is None:
                self.session.commit()
            else:
                self.session.rollback()
        except Exception:
            self.session.rollback()
            raise
        finally:
            self.session.close()
            self.session = None
        return False
