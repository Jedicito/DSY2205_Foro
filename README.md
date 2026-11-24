# Sistema de Foros en Línea

Aplicación Full Stack para un foro de **Informática**: frontend en **Angular** y backend en microservicios
Spring Boot con Oracle Autonomous Database (Oracle Cloud).

Asignatura: Desarrollo Full Stack III (DSY2205) — Evaluación Sumativa 2 (continúa la Sumativa 1).

## Microservicios

| Microservicio | Puerto | Responsabilidad |
|---|---|---|
| `ms-usuarios` | 8081 | Registro, modificación, deshabilitación y login de usuarios |
| `ms-foro` | 8082 | Búsqueda, visualización, publicación y comentarios de temas |
| `ms-moderacion` | 8083 | Solo ADMIN: banear y restaurar temas y comentarios que incumplen las normas |

Los tres comparten una misma base de datos Oracle. Las tablas se separan por prefijo:
`USR_*` pertenecen a usuarios y `FOR_*` al foro.

## Tecnologías

- Java 21 (compatible con JDK 21 o superior)
- Spring Boot 4.1 (Web MVC, Data JPA, Security, Validation)
- Oracle Autonomous Database (Transaction Processing) con conexión por Wallet
- Maven Wrapper (no requiere instalar Maven)

## Estructura del repositorio

```
foros-en-linea/
├── config/
│   └── oracle.properties.example       # Plantilla de conexión
├── sql/
│   ├── 00_crear_usuario_app.sql.example # Plantilla: crea el usuario FORO_APP
│   └── 01_esquema_y_datos.sql           # Tablas y datos de prueba
├── postman/
│   └── Foros-en-Linea.postman_collection.json
├── arquetipo/foro-ms-arquetipo/         # Arquetipo Maven de los microservicios
├── ms-usuarios/                         # Microservicio de usuarios
├── ms-foro/                             # Microservicio de foro
├── ms-moderacion/                       # Microservicio de moderación (generado con el arquetipo)
└── frontend/                            # Aplicación Angular (TecnoForo)
```

Cada microservicio sigue la misma organización por capas:

| Paquete | Contenido |
|---|---|
| `controller` | Endpoints REST |
| `service` | Reglas de negocio y permisos por autor o rol |
| `repository` | Acceso a Oracle con Spring Data JPA, incluidas las consultas |
| `model` | Entidades JPA mapeadas a las tablas |
| `dto` | Datos de entrada (con validaciones) y de salida en JSON |
| `security` | Spring Security: HTTP Basic, BCrypt y roles |
| `error` | Manejo global de errores en formato JSON |

## Modelo de datos

**Categoría → Tema → Comentario**: cada tema pertenece a una categoría y recibe comentarios de los usuarios.

| Tabla | Descripción | Datos de prueba |
|---|---|---|
| `USR_ROL` | Catálogo de roles: `USUARIO` y `ADMIN` | 2 |
| `USR_USUARIO` | Usuarios, con su rol y estado activo/deshabilitado | 5 |
| `FOR_CATEGORIA` | Catálogo de categorías de temas | 6 |
| `FOR_TEMA` | Temas publicados, con categoría, autor y estado | 7 |
| `FOR_COMENTARIO` | Comentarios de cada tema, con autor y estado | 12 |

Relaciones (todas de uno a muchos):

- Un rol tiene muchos usuarios.
- Un usuario publica muchos temas y muchos comentarios.
- Una categoría agrupa muchos temas.
- Un tema tiene muchos comentarios.

Categorías: Programación, Bases de datos, Desarrollo web, Redes y ciberseguridad, Inteligencia artificial, y Hardware y armado de PC.

### Eliminación lógica

La aplicación nunca borra registros, los desactiva:

- **Usuarios:** `ACTIVO = 0`. No pueden iniciar sesión, pero su contenido se conserva.
- **Temas y comentarios:** `ESTADO = 'ELIMINADO'`. Dejan de ser visibles en la API, pero permanecen en la base.

El estado `BANEADO` queda reservado para un futuro microservicio de moderación.

## Roles

| Rol | Privilegios |
|---|---|
| `USUARIO` | Publica y comenta temas; edita y elimina solo su propio contenido |
| `ADMIN` | Además administra usuarios y puede eliminar temas y comentarios de cualquiera |

## Seguridad

- Autenticación **HTTP Basic**: usuario y clave en cada petición (en Postman, pestaña *Authorization → Basic Auth*).
- Sin sesiones en el servidor; CSRF desactivado por ser una API REST.
- Claves almacenadas con **BCrypt**.
- Un usuario deshabilitado no puede autenticarse, aunque su clave sea correcta.

## Endpoints

### ms-usuarios (puerto 8081)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `POST` | `/api/usuarios` | Público | Registro; el usuario nuevo siempre queda con rol `USUARIO` |
| `GET` | `/api/auth/login` | Autenticado | Valida las credenciales y devuelve los datos y el rol del usuario |
| `GET` | `/api/usuarios` | ADMIN | Lista todos los usuarios, incluidos los deshabilitados |
| `GET` | `/api/usuarios/{id}` | El propio usuario o ADMIN | Ver un usuario |
| `PUT` | `/api/usuarios/{id}` | El propio usuario o ADMIN | Modificar email, nombre o clave; solo ADMIN cambia `rol` y `activo` |
| `DELETE` | `/api/usuarios/{id}` | ADMIN | Deshabilita el usuario (no lo borra) |

Ejemplo de registro:

```json
{
  "nombreUsuario": "pvaldes",
  "email": "pvaldes@correo.cl",
  "password": "Clave#2026",
  "nombreCompleto": "Pedro Valdés"
}
```

Ejemplo de modificación (todos los campos son opcionales):

```json
{
  "nombreCompleto": "Pedro Valdés Rojas",
  "rol": "ADMIN",
  "activo": true
}
```

El hash de la clave nunca se incluye en las respuestas.

### ms-foro (puerto 8082)

Leer el foro es público; publicar, modificar y eliminar requiere iniciar sesión.

**Categorías** (catálogo de solo lectura)

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/categorias` | Público | Listar categorías |
| `GET` | `/api/categorias/{id}` | Público | Ver una categoría |
| `GET` | `/api/categorias/{id}/temas` | Público | **Consulta:** temas de una categoría |

**Temas**

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/temas` | Público | Listar temas, del más reciente al más antiguo |
| `GET` | `/api/temas/{id}` | Público | Ver un tema |
| `GET` | `/api/temas/buscar?texto=...` | Público | **Consulta:** búsqueda por palabra clave en título o contenido |
| `GET` | `/api/temas/autor/{nombreUsuario}` | Público | **Consulta:** temas publicados por un usuario |
| `GET` | `/api/temas/mas-comentados?limite=5` | Público | **Consulta:** ranking de temas con más comentarios |
| `POST` | `/api/temas` | Autenticado | Publicar un tema |
| `PUT` | `/api/temas/{id}` | Solo el autor | Modificar título, contenido o categoría |
| `DELETE` | `/api/temas/{id}` | Autor o ADMIN | Eliminar (queda como `ELIMINADO`, no se borra) |

**Comentarios**

| Método | Ruta | Acceso | Descripción |
|---|---|---|---|
| `GET` | `/api/temas/{temaId}/comentarios` | Público | Comentarios de un tema |
| `POST` | `/api/temas/{temaId}/comentarios` | Autenticado | Comentar un tema |
| `GET` | `/api/comentarios/{id}` | Público | Ver un comentario |
| `PUT` | `/api/comentarios/{id}` | Solo el autor | Modificar el comentario |
| `DELETE` | `/api/comentarios/{id}` | Autor o ADMIN | Eliminar (queda como `ELIMINADO`, no se borra) |

Ejemplo para publicar un tema:

```json
{
  "titulo": "¿Qué IDE recomiendan para Java?",
  "contenido": "Estoy entre IntelliJ y VS Code. ¿Cuál usan ustedes?",
  "categoriaId": 1
}
```

Ejemplo para comentar:

```json
{
  "contenido": "VS Code con el Extension Pack for Java funciona muy bien."
}
```

Un tema o comentario eliminado deja de aparecer en todos los listados y consultas, y su `GET` responde 404. En Oracle sigue existiendo con `ESTADO = 'ELIMINADO'`.

## Manejo de errores

Todos los errores, incluidos los de seguridad, responden con el mismo formato JSON:

```json
{
  "timestamp": "2026-11-02T10:15:30",
  "status": 400,
  "error": "Bad Request",
  "mensaje": "Los datos enviados no son válidos",
  "ruta": "/api/usuarios",
  "detalles": {
    "email": "El email no tiene un formato válido",
    "password": "La clave debe tener entre 8 y 72 caracteres"
  }
}
```

| Código | Cuándo |
|---|---|
| 400 | Datos inválidos, JSON mal formado o parámetro faltante |
| 401 | Sin credenciales, credenciales incorrectas o usuario deshabilitado |
| 403 | El rol no tiene permiso, o el recurso pertenece a otro usuario |
| 404 | El recurso no existe o fue eliminado |
| 409 | Nombre de usuario o email ya registrado |
| 500 | Error inesperado (se registra en el log sin exponer detalles internos) |

## Pruebas con Postman

`postman/Foros-en-Linea.postman_collection.json` contiene 34 peticiones en tres carpetas: `ms-usuarios`, lecturas y consultas del foro, y escritura y roles del foro.

- Importar en Postman con **Import** y seleccionar el archivo.
- Cada petición ya trae su usuario (Basic Auth) y su JSON.
- Cada petición verifica automáticamente el código de respuesta esperado (pestaña *Test Results*).
- Los ids de lo que se crea (usuario, tema, comentario) se guardan solos en variables de la colección.
- Para ejecutarla completa: clic derecho en la colección → **Run**. Debe partir con los datos recién cargados por `sql/01_esquema_y_datos.sql`, porque algunas pruebas crean registros que no se pueden repetir.

## Puesta en marcha

### 1. Base de datos

En Oracle Cloud, abrir la base de datos → **Database actions → SQL** como `ADMIN`.
Pegar cada script en el editor y ejecutarlo con **Run Script** (F5):

1. `sql/00_crear_usuario_app.sql` — se obtiene copiando la plantilla `.example` y escribiendo la clave real. Está excluido del repositorio.
2. `sql/01_esquema_y_datos.sql` — al final muestra la cantidad de registros por tabla.

Los microservicios se conectan con el usuario `FORO_APP`, que solo puede conectarse y trabajar sobre sus propias tablas. No se usa `ADMIN` desde la aplicación.

### 2. Conexión

1. Descargar el Wallet de la base (*Database connection → Download wallet*) y descomprimirlo dentro de `config/`.
2. Copiar `config/oracle.properties.example` como `config/oracle.properties`.
3. Completar el nombre del servicio (`_tp` del archivo `tnsnames.ora`), el nombre de la carpeta del Wallet y la clave de `FORO_APP`.

`config/oracle.properties`, el Wallet y `sql/00_crear_usuario_app.sql` están excluidos del repositorio por `.gitignore`.

> **Revisión de la entrega:** en el archivo comprimido entregado, `config/oracle.properties` y el Wallet ya vienen incluidos y apuntan a la base en Oracle Cloud, con los datos cargados. Basta con ejecutar los microservicios (paso 3).

### 3. Ejecución

Cada microservicio se ejecuta **desde su propia carpeta** (la ruta al Wallet es relativa a ella):

```bash
cd ms-usuarios          # o ms-foro

# Windows
mvnw.cmd spring-boot:run

# Linux / macOS
./mvnw spring-boot:run
```

En VS Code, abrir la carpeta del microservicio y usar **Run** sobre la clase principal.

## Usuarios de prueba

| Usuario | Clave | Rol | Estado |
|---|---|---|---|
| `admin` | `Admin#2026` | ADMIN | Activo |
| `jperez` | `Usuario#2026` | USUARIO | Activo |
| `mgonzalez` | `Usuario#2026` | USUARIO | Activo |
| `csoto` | `Usuario#2026` | USUARIO | Activo |
| `rmunoz` | `Usuario#2026` | USUARIO | Deshabilitado |

Las claves se guardan en la base como hash BCrypt.

---

# Sumativa 2: arquetipo, moderación y frontend

## Arquetipo Maven `foro-ms-arquetipo`

Plantilla común de los microservicios, en `arquetipo/foro-ms-arquetipo`. Se construyó a partir de la
estructura que ya compartían `ms-usuarios` y `ms-foro`, y genera un microservicio listo para trabajar con:

- `pom.xml` con Spring Boot 4.1, Java 21, Web MVC, Data JPA, Security, Validation y drivers de Oracle (ojdbc11 + oraclepki).
- Capas `controller / service / repository / model / dto` bajo el paquete elegido.
- `error/`: formato JSON común de errores (`ErrorRespuesta`), `@RestControllerAdvice` y respuestas 401/403 en JSON.
- `security/`: HTTP Basic sin sesión, BCrypt y autenticación contra `USR_USUARIO` (roles `USUARIO` y `ADMIN`).
- `application.properties` que lee las credenciales de `config/oracle.properties` y se conecta con el Wallet.
- Maven Wrapper.

Propiedades del arquetipo: `groupId`, `artifactId`, `version`, `package`, `puerto` y `descripcion`.

```bash
# 1. Instalar el arquetipo en el repositorio local de Maven
cd arquetipo/foro-ms-arquetipo
mvn install

# 2. Generar un microservicio nuevo (así se generó ms-moderacion)
cd ../..
mvn archetype:generate -DarchetypeGroupId=cl.duoc.foros -DarchetypeArtifactId=foro-ms-arquetipo \
    -DarchetypeVersion=1.0.0 -DgroupId=cl.duoc.foros -DartifactId=ms-moderacion -Dversion=0.1.0 \
    -Dpackage=cl.duoc.foros.moderacion -Dpuerto=8083 -DinteractiveMode=false
```

## ms-moderacion (puerto 8083, solo ADMIN)

Generado con el arquetipo. Cambia el estado de temas y comentarios a `BANEADO` (o los restaura a `ACTIVO`).
Nada se borra de la base. Usa las mismas tablas `FOR_TEMA` y `FOR_COMENTARIO`, que ya tenían el estado `BANEADO`.

| Método | Ruta | Descripción |
|---|---|---|
| GET | `/api/moderacion/resumen` | Totales de temas y comentarios activos y baneados |
| GET | `/api/moderacion/temas?estado=BANEADO` | Temas por estado (`ACTIVO`, `ELIMINADO`, `BANEADO`) |
| GET | `/api/moderacion/comentarios?estado=BANEADO` | Comentarios por estado |
| PUT | `/api/moderacion/temas/{id}/banear` | Banea un tema activo (409 si no está activo) |
| PUT | `/api/moderacion/temas/{id}/restaurar` | Restaura un tema baneado |
| PUT | `/api/moderacion/comentarios/{id}/banear` | Banea un comentario activo |
| PUT | `/api/moderacion/comentarios/{id}/restaurar` | Restaura un comentario baneado |

Un USUARIO recibe 403 y una petición sin credenciales recibe 401. La carpeta **4. ms-moderacion (ADMIN)**
de la colección de Postman prueba todos los casos.

```bash
cd ms-moderacion
./mvnw spring-boot:run      # Windows: mvnw.cmd spring-boot:run
```

## Frontend Angular: TecnoForo

En `frontend/`. Angular 22 + Bootstrap 5 + Bootstrap Icons. En esta entrega **no se comunica con los
microservicios**: los datos viven en listas estáticas de Angular (`src/app/datos/datos-iniciales.ts`),
con los mismos registros de prueba del script SQL.

```bash
cd frontend
npm install
npm start        # http://localhost:4200
```

Usuarios de prueba: `admin` / `Admin#2026` (ADMIN) y `jperez` / `Usuario#2026` (USUARIO).
`rmunoz` está deshabilitado y no puede entrar.

### Pantallas

| Pantalla | Ruta | Acceso |
|---|---|---|
| Inicio (categorías, recientes, más comentados, buscador) | `/` | Público |
| Temas por categoría y búsqueda | `/temas?categoria=&q=` | Público |
| Detalle de tema y comentarios | `/temas/:id` | Público (comentar requiere sesión) |
| Publicar tema | `/temas/nuevo` | USUARIO y ADMIN |
| Inicio de sesión | `/login` | Sin sesión |
| Registro de usuarios | `/registro` | Sin sesión |
| Recuperar contraseña (2 pasos, correo simulado) | `/recuperar` | Sin sesión |
| Modificación de perfil y cambio de contraseña | `/perfil` | USUARIO y ADMIN |
| Moderación: banear y restaurar | `/admin/moderacion` | Solo ADMIN |
| Gestión de usuarios: habilitar, deshabilitar y cambiar rol | `/admin/usuarios` | Solo ADMIN |

### Roles

- **USUARIO**: publica temas, comenta, elimina sus propios temas y comentarios, y edita su perfil.
- **ADMIN**: todo lo anterior, más eliminar o banear cualquier tema o comentario, restaurar lo baneado
  y gestionar usuarios. Las rutas de administración están protegidas con `adminGuard`.

### Validaciones

Todos los formularios usan formularios reactivos con mensajes bajo cada campo.

La contraseña tiene **7 reglas de seguridad**: obligatoria, mínimo 8 caracteres, máximo 20, una mayúscula,
una minúscula, un número y un carácter especial, sin espacios. Se muestran en vivo con la lista de reglas.

Además se valida:

- Nombre de usuario: 3 a 20 caracteres en minúscula, números, punto o guion bajo, sin repetir.
- Nombre completo: solo letras.
- Correo: formato válido y sin repetir.
- Fecha de nacimiento: edad mínima de 14 años y no futura.
- Contraseña: la confirmación debe coincidir.
- Aceptar las normas del foro.
- Título del tema: entre 10 y 150 caracteres. Contenido: entre 20 y 4000.
- Comentario: entre 2 y 2000 caracteres.
- Ningún texto puede contener solo espacios.
- Código de recuperación: 6 dígitos.

### Diseño responsivo

Grid de 12 columnas de Bootstrap con tres tamaños de pantalla: móvil (`col-12`), tablet (`col-sm-*` / `col-md-*`)
y escritorio (`col-lg-*` / `col-xl-*`). El menú se colapsa en móvil, las columnas secundarias de las
tablas se ocultan en pantallas pequeñas (`d-none d-md-table-cell`) y hay ajustes con `@media` en `styles.css`.

### Patrones de diseño

- **Facade** (`src/app/facade/foro.facade.ts`): los componentes solo hablan con `ForoFacade`, que concentra
  la lógica de negocio (sesión, permisos por rol, publicar, comentar, moderar). Los componentes no conocen
  las listas ni los stores. Cuando el frontend se conecte al backend, solo cambiará el interior del facade.
  Sus métodos se agrupan igual que los microservicios: usuarios, foro y moderación.
- **Observer** (`src/app/servicios/*.store.ts`): los stores guardan las listas en *signals*. Cada cambio
  crea una lista nueva y todas las vistas que la observan se actualizan solas: contadores, listados y
  panel de moderación.
- **Singleton**: los stores y el facade son servicios `providedIn: 'root'`, con una sola instancia en
  toda la aplicación.
- **Guard** (`src/app/guards/guards.ts`): controla el acceso a las rutas según la sesión y el rol.

```
Componentes (páginas) ──> ForoFacade ──> UsuariosStore / ForoStore (signals) ──> datos-iniciales.ts
```

## Estrategia de ramas

Se usa **Trunk Based Development**: `main` es la rama principal y cada cambio se hace en una rama corta
`feature/*` que se integra a `main` con merge (`feature/arquetipo`, `feature/ms-moderacion`, `feature/frontend`).
