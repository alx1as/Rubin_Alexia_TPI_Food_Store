from collections.abc import Iterator
from sqlmodel import SQLModel, Session, create_engine
from app.core.config import get_settings

url = get_settings().database_url
engine = create_engine(url, connect_args={'check_same_thread': False} if url.startswith('sqlite') else {}, pool_pre_ping=True)


def session_factory() -> Session:
    return Session(engine)


def get_session() -> Iterator[Session]:
    with session_factory() as session:
        yield session


def create_all_tables() -> None:
    from app.modules.usuarios import models as _usuarios  # noqa: F401
    from app.modules.categorias import models as _categorias  # noqa: F401
    from app.modules.productos import models as _productos  # noqa: F401
    from app.modules.pedidos import models as _pedidos  # noqa: F401
    SQLModel.metadata.create_all(engine)
