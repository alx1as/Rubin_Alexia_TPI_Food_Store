TPI Programación IV (UTN)
## Link al repositorio:
https://github.com/alx1as/Rubin_Alexia_TPI_Food_Store

## Link al video:
https://www.youtube.com/watch?v=dkHp50Jd49E&list=PLYQVagaiMTl4rryoVwcbGMC-j5wi8hc-V&index=4

# Food Store 
Aplicación web de pedidos de comida. Los clientes pueden consultar el catálogo, armar un carrito, confirmar pedidos y consultar su estado. El panel de administración permite gestionar categorías, productos, stock, pedidos y usuarios.

## Requisitos

- Python 3.11 a 3.13.
- PostgreSQL 15 o superior. Para desarrollo local se puede utilizar SQLite.
- Node.js 20.19+ o 22.12+ y pnpm 9.

## Backend

Desde la raíz del proyecto:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
```

En Windows, activar el entorno con `.venv\Scripts\activate` y copiar el archivo con `copy .env.example .env`.

Crear una base PostgreSQL llamada `foodstore_db` y configurar `DATABASE_URL` con el usuario y la contraseña correspondientes. Si se utiliza SQLite, reemplazar esa variable por `sqlite:///./foodstore.db`; no es necesario crear una base manualmente.

En ambos casos, generar una clave privada con `python -c "import secrets; print(secrets.token_urlsafe(32))"` y colocarla en `SECRET_KEY` dentro de `.env`.

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `DATABASE_URL` | Conexión a la base de datos | `postgresql://postgres:postgres@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Clave JWT de al menos 32 caracteres | Generar una clave propia |
| `ALGORITHM` | Algoritmo de firma JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Duración de la sesión | `30` |
| `FRONTEND_ORIGIN` | Origen autorizado para CORS | `http://localhost:5173` |
| `COOKIE_SECURE` | Cookie segura en HTTPS | `false` para desarrollo HTTP local |

```bash
python -m app.db.seed
uvicorn app.main:app --reload
```

El seed carga el administrador, tres categorías y ocho productos. Puede ejecutarse nuevamente sin duplicar los registros.

- API: http://localhost:8000/api/v1
- Swagger: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Administrador de demostración: `admin` / `Admin1234!`

## Frontend

En una segunda terminal, desde la raíz del proyecto:

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm build
pnpm dev
```

En Windows, utilizar `copy .env.example .env`.

`VITE_API_URL` indica la URL de la API; el valor de ejemplo es `http://localhost:8000/api/v1`.

Abrir http://localhost:5173. Usar `localhost` tanto para el frontend como para el backend para que coincidan el origen autorizado y la configuración de la cookie.

## Arquitectura

El backend utiliza FastAPI, SQLModel y una estructura modular por dominio. Los routers delegan las reglas de negocio a los servicios; el Unit of Work administra la sesión y las transacciones, y los repositorios encapsulan las consultas. El frontend está organizado por features y utiliza React, TypeScript, Tailwind CSS, Axios, TanStack Query, Form y Table, y Zustand con persistencia.

[Diagrama UML de la consigna](docs/UML_FOOD_STORE.png).

## Funcionalidades

- Registro y autenticación JWT mediante cookie HttpOnly, sin almacenar el token en el frontend.
- Catálogo público con búsqueda, filtro por categoría y paginación.
- Carrito persistente, checkout con dirección y forma de pago, y detalle de pedidos.
- Creación transaccional del pedido, descuento de stock y restitución al cancelar. Las líneas conservan el nombre y precio del momento de la compra.
- Estados del pedido: PENDIENTE, EN_PREPARACION, ENTREGADO y CANCELADO.
- Panel administrador con resumen, gestión de categorías, productos, stock, pedidos y usuarios.



