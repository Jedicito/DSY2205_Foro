# Sistema de Foros en Línea

Backend basado en microservicios para un foro de **Informática**.
Desarrollado con Spring Boot y Oracle Autonomous Database (Oracle Cloud).

Asignatura: Desarrollo Full Stack III (DSY2205) — Evaluación Sumativa 1.

## Microservicios

| Microservicio | Puerto | Responsabilidad |
|---|---|---|
| `ms-usuarios` | 8081 | Registro, modificación, deshabilitación y login de usuarios |
| `ms-foro` | 8082 | Búsqueda, visualización, publicación y comentarios de temas |

Ambos comparten una misma base de datos Oracle. Las tablas se separan por prefijo:
`USR_*` pertenecen a usuarios y `FOR_*` al foro.

## Tecnologías

- Java 21 (compatible con JDK 21 o superior)
- Spring Boot 4.1 (Web MVC, Data JPA, Validation)
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
├── ms-usuarios/                         # Microservicio de usuarios
└── ms-foro/                             # Microservicio de foro
```

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
