from app.core.errors import DomainError
from app.modules.productos.models import Producto
from app.modules.productos.schemas import ProductoCreate, ProductoUpdate, ProductoStockUpdate, ProductoRead, ProductosPaginados
from app.modules.productos.unit_of_work import ProductoUnitOfWork


class ProductoService:
    def __init__(self, uow: ProductoUnitOfWork | None = None):
        self.uow = uow or ProductoUnitOfWork()

    def _categoria(self, uow: ProductoUnitOfWork, id_: int) -> None:
        categoria = uow.categorias.get_by_id(id_)
        if not categoria or not categoria.activo:
            raise DomainError(404, 'Categoría no encontrada')

    def buscar(self, skip: int, limit: int, search: str | None, categoria_id: int | None, disponible: bool | None) -> ProductosPaginados:
        with self.uow as uow:
            items, total = uow.productos.search(skip, limit, search, categoria_id, disponible)
            return ProductosPaginados(total=total, items=[ProductoRead.model_validate(p) for p in items])

    def obtener(self, id_: int) -> ProductoRead:
        with self.uow as uow:
            obj = uow.productos.get_by_id(id_)
            if not obj or not obj.activo:
                raise DomainError(404, 'Producto no encontrado')
            return ProductoRead.model_validate(obj)

    def crear(self, datos: ProductoCreate) -> ProductoRead:
        with self.uow as uow:
            uow.lock_writes()
            self._categoria(uow, datos.categoria_id)
            obj = Producto.model_validate(datos)
            uow.productos.add(obj)
            uow.session.flush()
            return ProductoRead.model_validate(obj)

    def editar(self, id_: int, datos: ProductoUpdate) -> ProductoRead:
        with self.uow as uow:
            uow.lock_writes()
            obj = uow.productos.locked(id_)
            if not obj or not obj.activo:
                raise DomainError(404, 'Producto no encontrado')
            cambios = datos.model_dump(exclude_unset=True)
            if cambios.get('categoria_id') is not None:
                self._categoria(uow, cambios['categoria_id'])
            for campo, valor in cambios.items():
                if valor is not None or campo in ('descripcion', 'imagen_url'):
                    setattr(obj, campo, valor)
            uow.session.add(obj)
            uow.session.flush()
            return ProductoRead.model_validate(obj)

    def cambiar_stock(self, id_: int, datos: ProductoStockUpdate) -> ProductoRead:
        with self.uow as uow:
            uow.lock_writes()
            obj = uow.productos.locked(id_)
            if not obj or not obj.activo:
                raise DomainError(404, 'Producto no encontrado')
            obj.stock, obj.disponible = datos.stock, datos.disponible
            uow.session.add(obj)
            return ProductoRead.model_validate(obj)

    def eliminar(self, id_: int) -> None:
        with self.uow as uow:
            uow.lock_writes()
            obj = uow.productos.locked(id_)
            if not obj or not obj.activo:
                raise DomainError(404, 'Producto no encontrado')
            obj.activo = False
            uow.session.add(obj)
