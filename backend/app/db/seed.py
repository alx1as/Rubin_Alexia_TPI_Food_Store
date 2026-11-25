from sqlmodel import select, func
from app.core.database import create_all_tables, session_factory
from app.core.security import hash_password
from app.modules.usuarios.models import Usuario
from app.modules.categorias.models import Categoria
from app.modules.productos.models import Producto

CATEGORIAS = {
    'Hamburguesas': [
        ('Clásica', 6500, 'Medallón a la plancha, cheddar, lechuga y nuestra salsa especial.'),
        ('Doble queso', 8800, 'Dos medallones dorados y una generosa capa de cheddar fundido.'),
        ('Vegetariana', 7200, 'Medallón de legumbres, vegetales frescos y alioli suave.'),
    ],
    'Pizzas': [
        ('Margarita', 12000, 'Masa artesanal, tomate, mozzarella y hojas de albahaca.'),
        ('Especial', 14500, 'Mozzarella, jamón cocido, morrones y aceitunas.'),
        ('Napolitana', 13800, 'Tomate fresco, mozzarella, ajo y un toque de orégano.'),
    ],
    'Bebidas': [
        ('Agua mineral', 1800, 'Agua fresca, ideal para acompañar cualquier pedido.'),
        ('Gaseosa', 2500, 'Bien fría, con el toque justo para completar tu menú.'),
    ],
}


def seed() -> None:
    create_all_tables()
    with session_factory() as session:
        if not session.exec(select(Usuario).where(Usuario.username == 'admin')).first():
            session.add(Usuario(username='admin', full_name='Administración Food Store', email='admin@foodstore.local', hashed_password=hash_password('Admin1234!'), role='admin'))
            session.flush()
        for nombre, productos in CATEGORIAS.items():
            categoria = session.exec(select(Categoria).where(func.lower(Categoria.nombre) == nombre.lower())).first()
            if categoria is None:
                categoria = Categoria(nombre=nombre, descripcion=f'{nombre} de Food Store')
                session.add(categoria)
                session.flush()
            for producto_nombre, precio, descripcion in productos:
                existe = session.exec(select(Producto).where(Producto.nombre == producto_nombre, Producto.categoria_id == categoria.id)).first()
                if existe is None:
                    session.add(Producto(nombre=producto_nombre, descripcion=descripcion, precio_base=precio, categoria_id=categoria.id, stock=25, disponible=True))
        session.commit()
    print('Seed completado: admin, 3 categorías y 8 productos (idempotente).')


if __name__ == '__main__':
    seed()
