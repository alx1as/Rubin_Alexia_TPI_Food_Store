from sqlmodel import Session, select, func
from sqlalchemy.orm import selectinload
from app.core.base_repository import BaseRepository
from app.modules.productos.models import Producto


class ProductoRepository(BaseRepository[Producto]):
    def __init__(self, session: Session):
        super().__init__(session, Producto)

    def search(self, skip: int, limit: int, search: str | None, categoria_id: int | None, disponible: bool | None) -> tuple[list[Producto], int]:
        criteria = [Producto.activo == True]  # noqa: E712
        if search:
            criteria.append(Producto.nombre.ilike(f'%{search}%'))
        if categoria_id is not None:
            criteria.append(Producto.categoria_id == categoria_id)
        if disponible is not None:
            criteria.append(Producto.disponible == disponible)
        count = self.session.exec(select(func.count()).select_from(Producto).where(*criteria)).one()
        items = list(self.session.exec(select(Producto).where(*criteria).options(selectinload(Producto.categoria)).order_by(Producto.id).offset(skip).limit(limit)).all())
        return items, count

    def locked(self, producto_id: int) -> Producto | None:
        # PostgreSQL: bloqueo de fila para evitar ventas concurrentes con stock insuficiente.
        return self.session.exec(select(Producto).where(Producto.id == producto_id).with_for_update()).first()
