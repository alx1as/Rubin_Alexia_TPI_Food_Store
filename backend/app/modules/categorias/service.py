from sqlalchemy.exc import IntegrityError
from app.core.errors import DomainError
from app.modules.categorias.models import Categoria
from app.modules.categorias.schemas import CategoriaCreate, CategoriaUpdate, CategoriaRead
from app.modules.categorias.unit_of_work import CategoriaUnitOfWork


class CategoriaService:
    def __init__(self, uow: CategoriaUnitOfWork | None = None):
        self.uow = uow or CategoriaUnitOfWork()

    def listar(self) -> list[CategoriaRead]:
        with self.uow as uow:
            return [CategoriaRead.model_validate(c) for c in uow.categorias.get_all() if c.activo]

    def obtener(self, id_: int) -> CategoriaRead:
        with self.uow as uow:
            obj = uow.categorias.get_by_id(id_)
            if not obj or not obj.activo:
                raise DomainError(404, 'Categoría no encontrada')
            return CategoriaRead.model_validate(obj)

    def crear(self, datos: CategoriaCreate) -> CategoriaRead:
        try:
            with self.uow as uow:
                uow.lock_writes()
                if uow.categorias.get_by_nombre(datos.nombre):
                    raise DomainError(409, 'Ya existe una categoría con ese nombre')
                obj = Categoria.model_validate(datos)
                uow.categorias.add(obj)
                uow.session.flush()
                return CategoriaRead.model_validate(obj)
        except IntegrityError as exc:
            # También cubre la carrera entre dos creaciones simultáneas.
            raise DomainError(409, 'Ya existe una categoría con ese nombre') from exc

    def editar(self, id_: int, datos: CategoriaUpdate) -> CategoriaRead:
        try:
            with self.uow as uow:
                uow.lock_writes()
                obj = uow.categorias.get_by_id(id_)
                if not obj or not obj.activo:
                    raise DomainError(404, 'Categoría no encontrada')
                cambios = datos.model_dump(exclude_unset=True)
                if 'nombre' in cambios and cambios['nombre'] is not None:
                    otra = uow.categorias.get_by_nombre(cambios['nombre'])
                    if otra and otra.id != id_:
                        raise DomainError(409, 'Ya existe una categoría con ese nombre')
                for campo, valor in cambios.items():
                    if valor is not None or campo == 'descripcion':
                        setattr(obj, campo, valor)
                uow.session.add(obj)
                uow.session.flush()
                return CategoriaRead.model_validate(obj)
        except IntegrityError as exc:
            raise DomainError(409, 'Ya existe una categoría con ese nombre') from exc

    def eliminar(self, id_: int) -> None:
        with self.uow as uow:
            uow.lock_writes()
            obj = uow.categorias.get_by_id(id_)
            if not obj or not obj.activo:
                raise DomainError(404, 'Categoría no encontrada')
            obj.activo = False
            uow.session.add(obj)
