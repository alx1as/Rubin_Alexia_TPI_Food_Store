# Food Store — Trabajo Práctico Integrador

**Programación IV · Tecnicatura Universitaria en Programación a Distancia · UTN**  
**Alumna:** Alexia Rubin

- Repositorio: https://github.com/alx1as/Rubin_Alexia_TPI_Food_Store
- Video de demostración: https://www.youtube.com/watch?v=dkHp50Jd49E

Food Store es una aplicación web de pedidos de comida. El cliente puede consultar el catálogo, armar un carrito, confirmar pedidos y consultar su estado. El administrador dispone de un panel para gestionar categorías, productos, stock, pedidos y usuarios.

## Requisitos e instalación

- Python 3.11 a 3.13.
- PostgreSQL 15 o superior. Para desarrollo local se admite SQLite, cambiando `DATABASE_URL`.
- Node.js 20.19+ (rama 20) o 22.12+ y pnpm 9 (el proyecto fija pnpm 9.15.9).

El backend y el frontend son aplicaciones independientes. Las dependencias directas están fijadas en `backend/requirements.txt` y `frontend/package.json`; el frontend incluye `pnpm-lock.yaml`.

### 1. Backend

Desde la raíz del proyecto:

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
cp .env.example .env
```

En Windows, activar el entorno con `.venv\Scripts\activate` (CMD) o `.venv\Scripts\Activate.ps1` (PowerShell) y copiar el archivo con `copy .env.example .env`. Usar una versión de Python comprendida en el rango indicado.

Para PostgreSQL, crear previamente una base llamada `foodstore_db` y configurar `DATABASE_URL` con las credenciales correspondientes. Para probar localmente con SQLite, colocar `DATABASE_URL=sqlite:///./foodstore.db` en `.env`; no hace falta crear la base manualmente.

Generar una clave privada propia:

```bash
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

Copiar el resultado en `SECRET_KEY` dentro del `.env` del backend.

| Variable | Descripción | Ejemplo |
| --- | --- | --- |
| `DATABASE_URL` | Conexión a la base de datos | `postgresql://postgres:postgres@localhost:5432/foodstore_db` |
| `SECRET_KEY` | Clave JWT de al menos 32 caracteres | Generar una clave propia |
| `ALGORITHM` | Algoritmo de firma JWT | `HS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | Expiración del token y la cookie | `30` |
| `FRONTEND_ORIGIN` | Origen autorizado en CORS | `http://localhost:5173` |
| `COOKIE_SECURE` | Cookie restringida a HTTPS | `false` para HTTP local; `true` para HTTPS |

Cargar los datos iniciales y levantar el servidor:

```bash
python -m app.db.seed
uvicorn app.main:app --reload
```

El seed crea el administrador, tres categorías y ocho productos con 25 unidades de stock inicial cada uno en una base vacía. Es idempotente: volver a ejecutarlo no duplica los registros existentes ni reinicia su stock.

- API: http://localhost:8000/api/v1
- Swagger: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
- Estado del servicio: http://localhost:8000/health
- Administrador de demostración: usuario `admin`, contraseña `Admin1234!` (solo para uso local de evaluación).

### 2. Frontend

En otra terminal, desde la raíz del proyecto:

```bash
cd frontend
cp .env.example .env
pnpm install
pnpm build
pnpm dev
```

En Windows, utilizar `copy .env.example .env`. `VITE_API_URL` indica la URL de la API y su valor de ejemplo es `http://localhost:8000/api/v1`.

Abrir http://localhost:5173. Mantener ambas terminales abiertas y usar `localhost` en los dos servicios para que coincidan el origen autorizado y la configuración de la cookie. Para probar el perfil cliente, crear una cuenta desde el registro público.

## Arquitectura y organización

El backend utiliza FastAPI, SQLModel y una arquitectura en capas organizada por dominio. El frontend utiliza React, TypeScript en modo estricto, Vite y Tailwind CSS, con una organización por features.

```text
backend/
  app/
    main.py
    core/                       # Configuración, BD, seguridad, dependencias, UoW y repositorio base
    modules/
      auth/                     # Router, servicio y schemas; reutiliza Usuario
      usuarios/
      categorias/
      productos/
      pedidos/                  # Modelos, schemas, repositorio, UoW, servicio y router
    db/seed.py
  .env.example
  requirements.txt
frontend/
  src/
    features/                   # auth, categorias, productos, pedidos, usuarios
    shared/                     # API, componentes, UI y layout
    store/                      # authStore y cartStore
    routes/                     # AppRouter y ProtectedRoute
    App.tsx
    main.tsx
  .env.example
  package.json
  pnpm-lock.yaml
docs/UML_FOOD_STORE.png
```

### Backend: responsabilidades de las capas

| Capa | Implementación y responsabilidad |
| --- | --- |
| Router | `modules/<dominio>/router.py`: contratos HTTP, schemas, dependencias y delegación al servicio. |
| Service | `modules/<dominio>/service.py`: reglas de negocio y coordinación de operaciones. |
| Unit of Work | `core/unit_of_work.py` y `modules/<dominio>/unit_of_work.py`: apertura de sesión, repositorios que comparten sesión, commit, rollback y cierre. |
| Repository | `core/base_repository.py` y `modules/<dominio>/repository.py`: consultas y operaciones de persistencia, sin reglas de negocio. |
| Model y Schema | `models.py` y `schemas.py`: tablas y relaciones SQLModel, contratos de entrada y salida separados. |

Las rutas de categorías, productos y pedidos reciben el servicio mediante `Depends`. Los servicios abren `with self.uow as uow:` y construyen los schemas de salida dentro del bloque. El commit se realiza en `UnitOfWork.__exit__`, no en esos servicios ni en sus routers; `flush()` permite obtener identificadores y sincronizar cambios sin confirmar la transacción. Auth y usuarios conservan el estilo de sesión directa admitido por la consigna (p. 7).

El tratamiento de errores de dominio se centraliza en `core/errors.py`: los servicios lanzan `DomainError` con el código y mensaje correspondientes; los routers utilizan `http_errors()` para traducirla a `HTTPException` con `detail`. Esta variante evita repetir bloques de captura y mantiene separados el tratamiento HTTP y la lógica del servicio, aunque utiliza una excepción común en lugar de las clases individuales sugeridas en la especificación.

### Modelo de datos

Las cinco entidades SQLModel con `table=True` son `Usuario`, `Categoria`, `Producto`, `Pedido` y `DetallePedido`. Se respetan las cuatro relaciones 1:N con `Relationship` y `back_populates`: `Categoria.productos` / `Producto.categoria`, `Usuario.pedidos` / `Pedido.usuario`, `Pedido.items` / `DetallePedido.pedido` y `Producto.detalles` / `DetallePedido.producto`.

Los identificadores son enteros, los importes `float` y las fechas `datetime`, de acuerdo con el UML. Categorías y productos se dan de baja con `activo`; los usuarios con `disabled`. Los pedidos no se eliminan. La baja de una categoría conserva su nombre único y no implica la baja de sus productos.

[Diagrama UML de la consigna](docs/UML_FOOD_STORE.png).

### Frontend: datos, formularios y estado

- **TanStack Query:** `useQuery` para datos del servidor y `useMutation` para escrituras; invalidación de consultas después de las operaciones. Los hooks y las funciones de API están agrupados por feature.
- **TanStack Form:** utilizado en `LoginPage`, `RegisterPage`, `CheckoutPage`, `AdminCategoriasPage` y `AdminProductosPage`, con validaciones de entrada.
- **TanStack Table:** utilizado en las cuatro tablas administrativas. Categorías, productos y usuarios comparten `shared/components/DataTable.tsx`, componente genérico con columnas `ColumnDef<T, unknown>`, `useReactTable`, `getCoreRowModel`, `getPaginationRowModel` y `flexRender`. Cada pantalla define sus propias columnas y acciones. `AdminPedidosPage.tsx` utiliza directamente `useReactTable` con `manualPagination`, `rowCount` e identificadores de fila; la API pagina y filtra los pedidos. Se evita duplicar la paginación en el cliente.
- **Zustand:** `authStore.ts` persiste únicamente los datos del usuario mediante `partialize`; `cartStore.ts` persiste los carritos y calcula sus totales estimados. El JWT nunca se guarda en estos stores.
- **Axios:** instancia única en `shared/api/axiosInstance.ts`, con `withCredentials: true` e interceptor para sesiones inválidas (401) y cuentas desactivadas (400).
- **React Router:** `ProtectedRoute.tsx` espera la comprobación de sesión y redirige a `/login` o `/unauthorized` según corresponda. `App.tsx` ejecuta `checkSession()` al montar la aplicación y `main.tsx` configura `QueryClientProvider`.

## API REST y funcionalidades

Todos los endpoints del dominio utilizan el prefijo `/api/v1`.

| Módulo | Operaciones |
| --- | --- |
| Auth | `POST /auth/register`, `POST /auth/token`, `POST /auth/logout`, `GET /auth/me`. |
| Usuarios | `GET /admin/usuarios`, `POST /admin/usuarios/{id}/activar`, `POST /admin/usuarios/{id}/desactivar`. |
| Categorías | `GET` y `POST /categorias`; `GET`, `PUT` y `DELETE /categorias/{id}`. |
| Productos | `GET` y `POST /productos`; `GET`, `PUT` y `DELETE /productos/{id}`; `PATCH /productos/{id}/stock`. |
| Pedidos | `GET` y `POST /pedidos`; `GET /pedidos/resumen`; `GET /pedidos/{id}`; `PATCH /pedidos/{id}/estado` y `PATCH /pedidos/{id}/cancelar`. |

El catálogo es público y ofrece búsqueda por nombre, filtro por categoría, paginación y estados de carga, vacío y error. La API de productos también admite el filtro `disponible`. Los listados paginados reciben `skip` y `limit` y devuelven `total` e `items`. Las altas responden 201 y las bajas lógicas de categorías y productos, 204 sin cuerpo. Las actualizaciones PUT conservan los campos no enviados.

El registro público crea usuarios con rol `user`. El login recibe un formulario OAuth2 y entrega el JWT en la cookie `access_token`, HttpOnly, con expiración de 30 minutos y `SameSite=Lax`. Las contraseñas se almacenan con bcrypt. Las dependencias `get_current_user`, `get_current_active_user` y `require_role` controlan el acceso real en el backend; la protección de rutas del frontend complementa esos controles. El administrador puede crear pedidos, tal como permite la consigna.

El panel incluye ABM de categorías y productos, stock y disponibilidad, gestión de estados de pedidos, activación y desactivación de usuarios y resumen con los seis indicadores requeridos. Se impide que un administrador desactive su propia cuenta.

## Reglas de negocio de pedidos

Implementadas en `backend/app/modules/pedidos/service.py`, con validaciones en `schemas.py` y permisos en `router.py`.

| Regla | Implementación |
| --- | --- |
| RN-01 — Creación | `PedidoCreate` exige al menos un ítem y cantidad positiva. `PedidoService.crear` rechaza productos repetidos, inexistentes, inactivos, no disponibles o sin stock suficiente. Descuenta unidades, crea detalles y calcula el total en una sola transacción. |
| RN-02 — Estados | `TRANSICIONES` define los cambios permitidos; `cambiar_estado` rechaza las transiciones inválidas con 400. |
| RN-03 — Cancelación | `cambiar_estado` restituye el stock de cada línea y cambia el estado en la misma transacción, sin borrar el pedido. |
| RN-04 — Permisos | El cliente lista, consulta y cancela únicamente sus pedidos; solo cancela en `PENDIENTE`. El administrador lista todos y gestiona sus estados mediante el endpoint administrativo. |
| RN-05 — Inmutabilidad | `DetallePedido` conserva el nombre y precio unitario de la compra; el total lo calcula el servidor. No se exponen endpoints para editar o eliminar pedidos. |
| RN-06 — Validación | `PedidoCreate` exige `EFECTIVO` o `TRANSFERENCIA` y dirección de 5 a 200 caracteres, después de quitar espacios externos. |

| Estado actual | Próximos estados permitidos |
| --- | --- |
| `PENDIENTE` | `EN_PREPARACION`, `CANCELADO` |
| `EN_PREPARACION` | `ENTREGADO`, `CANCELADO` |
| `ENTREGADO` | Ninguno |
| `CANCELADO` | Ninguno |

El resumen utiliza conteos y sumas en el repositorio de pedidos. Solo los pedidos entregados aportan a `ingresos_entregados`; el indicador de pedidos de hoy utiliza el día UTC.

## Mejoras y decisiones de implementación

Además del alcance funcional solicitado, se incorporaron medidas para mejorar la consistencia de datos y la experiencia de uso, sin agregar nuevas entidades ni modificar las reglas principales:

| Mejora | Fundamento y evidencia |
| --- | --- |
| Control de concurrencia | Los repositorios de productos y pedidos ofrecen consultas `with_for_update()` para bloquear filas en PostgreSQL. En SQLite, `UnitOfWork.lock_writes()` utiliza `BEGIN IMMEDIATE` antes de leer en las operaciones críticas. El servicio de pedidos adquiere los bloqueos de productos en orden estable para reducir el riesgo de deadlocks. Esto protege el descuento de stock y evita cancelaciones simultáneas con doble restitución. |
| Unicidad de categorías | `categorias/models.py` incluye un índice único sobre `lower(nombre)`, complementado con la búsqueda del repositorio y manejo de `IntegrityError` en el servicio. Evita duplicados que solo difieran en mayúsculas, incluso después de una baja lógica. |
| Carga eficiente de relaciones | `selectinload` en los repositorios de productos y pedidos para cargar categorías y líneas en los listados, evitando consultas individuales por cada registro. |
| Validaciones y seguridad | Se rechazan precios no finitos, contraseñas superiores a 72 bytes de bcrypt y direcciones compuestas solo por espacios. `COOKIE_SECURE` permite restringir la cookie a HTTPS cuando corresponde; no se requiere desactivar esta protección en un despliegue HTTPS. |
| Carritos separados | `cartStore.ts` conserva un carrito por cuenta y otro para el visitante. El carrito invitado se integra al iniciar sesión, sin mezclar los de otras cuentas. `authStore.ts` y el interceptor limpian la caché de consultas al cambiar o perder la sesión. |
| Continuidad de compra | `CarritoPage`, `ProtectedRoute`, `LoginPage` y `RegisterPage` preservan el recorrido hacia el checkout. El registro iniciado desde la compra intenta iniciar sesión automáticamente y volver al checkout; si falla el login, permite ingresar sin repetir el registro. |
| Prevención de acciones repetidas | Los formularios de autenticación y las mutaciones deshabilitan acciones durante su procesamiento. Los cambios de estado y las bajas cuentan con confirmación cuando corresponde. Las reglas definitivas permanecen en el servidor. |
| Edición parcial | `AdminProductosPage` envía únicamente los campos modificados respecto del formulario original. Así, editar una descripción o precio no reenvía innecesariamente un valor anterior de stock. |
| Interfaz y recursos visuales | Diseño adaptable mediante Tailwind, componentes compartidos, indicadores de carga y mensajes de error. `ProductoCard.tsx` presenta una alternativa visual cuando no hay imagen o la URL falla y limita la acción de agregar según el stock mostrado. |

Estas mejoras mantienen el alcance académico: no se incorporan pasarelas de pago, direcciones guardadas, categorías múltiples, gráficos ni historial de estados.

## Recorrido sugerido para verificar el funcionamiento

1. Ejecutar el seed dos veces sobre una base local nueva. Comprobar que se conservan los registros iniciales sin duplicados.
2. Consultar el catálogo sin sesión, buscar un producto, aplicar un filtro y agregar unidades al carrito. Recargar y comprobar que se conserva.
3. Continuar hacia el checkout, crear una cuenta o iniciar sesión, ingresar dirección y forma de pago y confirmar. Consultar el detalle en Mis pedidos.
4. Ingresar como administrador y verificar el stock descontado. Crear, editar o dar de baja categorías y productos; gestionar disponibilidad y usuarios.
5. Avanzar el pedido a preparación y cancelarlo. Comprobar que se restituye exactamente la cantidad comprada y que no puede volver a cancelarse. En otro pedido, avanzar hasta entregado y verificar los indicadores del resumen.
6. Comprobar casos negativos: registro duplicado (409), credenciales inválidas (401), cuenta desactivada (400), acceso no autorizado (403), producto inexistente (404), stock insuficiente o transición inválida (400) y datos que no cumplen los schemas (422).
7. Revisar `/docs` y `/redoc` y ejecutar `pnpm build` para comprobar los tipos y la compilación de producción.

## Entrega

El proyecto incluye los dos archivos `.env.example`, las dependencias fijadas, el diagrama UML y las instrucciones de ejecución en este README. No se deben distribuir los `.env` privados, entornos virtuales, dependencias instaladas, bases de datos locales ni archivos de compilación. El repositorio y el video se enlazan al inicio de este documento.