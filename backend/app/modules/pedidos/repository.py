from datetime import datetime, time, timedelta, timezone
from sqlmodel import Session, select, func
from sqlalchemy.orm import selectinload
from app.core.base_repository import BaseRepository
from app.modules.pedidos.models import Pedido


class PedidoRepository(BaseRepository[Pedido]):
    def __init__(self, session: Session):
        super().__init__(session, Pedido)

    def list_by_usuario(self, usuario_id: int | None, estado: str | None, skip: int, limit: int) -> tuple[list[Pedido], int]:
        criteria = []
        if usuario_id is not None:
            criteria.append(Pedido.usuario_id == usuario_id)
        if estado is not None:
            criteria.append(Pedido.estado == estado)
        total = self.session.exec(select(func.count()).select_from(Pedido).where(*criteria)).one()
        items = list(self.session.exec(select(Pedido).where(*criteria).options(selectinload(Pedido.items)).order_by(Pedido.created_at.desc(), Pedido.id.desc()).offset(skip).limit(limit)).all())
        return items, total

    def locked(self, pedido_id: int) -> Pedido | None:
        """Serializa cambios de estado del mismo pedido en PostgreSQL."""
        return self.session.exec(
            select(Pedido).where(Pedido.id == pedido_id).with_for_update()
        ).first()

    def count_by_estado(self, estado: str) -> int:
        return self.session.exec(select(func.count()).select_from(Pedido).where(Pedido.estado == estado)).one()

    def ingresos_entregados(self) -> float:
        return float(self.session.exec(select(func.coalesce(func.sum(Pedido.total), 0)).where(Pedido.estado == 'ENTREGADO')).one())

    def pedidos_hoy(self) -> int:
        inicio = datetime.combine(datetime.now(timezone.utc).date(), time.min)
        fin = inicio + timedelta(days=1)
        return self.session.exec(select(func.count()).select_from(Pedido).where(Pedido.created_at >= inicio, Pedido.created_at < fin)).one()
