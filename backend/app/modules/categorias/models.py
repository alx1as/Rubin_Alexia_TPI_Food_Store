from typing import TYPE_CHECKING
from sqlmodel import Field, Relationship, SQLModel
from sqlalchemy import Index, func
if TYPE_CHECKING:
    from app.modules.productos.models import Producto


class Categoria(SQLModel, table=True):
    id: int | None = Field(default=None, primary_key=True)
    nombre: str = Field(index=True, unique=True)
    descripcion: str | None = None
    activo: bool = True
    productos: list['Producto'] = Relationship(back_populates='categoria')


# Unicidad sin distinguir mayúsculas, incluso después de la baja lógica.
Index('ux_categoria_nombre_lower', func.lower(Categoria.__table__.c.nombre), unique=True)
