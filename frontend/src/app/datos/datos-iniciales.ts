import { Categoria, Comentario, Tema, Usuario } from '../modelos/modelos';

/**
 * Datos iniciales en listas estáticas (los mismos registros de prueba del
 * script sql/01_esquema_y_datos.sql). En esta entrega el frontend no se
 * comunica con los microservicios: trabaja sobre estas colecciones.
 */

export const USUARIOS_INICIALES: Usuario[] = [
  { id: 1, nombreUsuario: 'admin', nombreCompleto: 'Administrador del Foro', email: 'admin@tecnoforo.cl',
    password: 'Admin#2026', rol: 'ADMIN', activo: true, bio: 'Moderador general de TecnoForo.',
    fechaRegistro: new Date(2026, 9, 1) },
  { id: 2, nombreUsuario: 'jperez', nombreCompleto: 'Juan Pérez', email: 'jperez@correo.cl',
    password: 'Usuario#2026', rol: 'USUARIO', activo: true, bio: 'Estudiante de Ingeniería en Informática.',
    fechaRegistro: new Date(2026, 9, 5) },
  { id: 3, nombreUsuario: 'mgonzalez', nombreCompleto: 'María González', email: 'mgonzalez@correo.cl',
    password: 'Usuario#2026', rol: 'USUARIO', activo: true, bio: 'Desarrolladora web y fan de Angular.',
    fechaRegistro: new Date(2026, 9, 8) },
  { id: 4, nombreUsuario: 'csoto', nombreCompleto: 'Carlos Soto', email: 'csoto@correo.cl',
    password: 'Usuario#2026', rol: 'USUARIO', activo: true, bio: 'Armo PCs los fines de semana.',
    fechaRegistro: new Date(2026, 9, 12) },
  { id: 5, nombreUsuario: 'rmunoz', nombreCompleto: 'Rosa Muñoz', email: 'rmunoz@correo.cl',
    password: 'Usuario#2026', rol: 'USUARIO', activo: false, bio: '',
    fechaRegistro: new Date(2026, 9, 15) },
];

export const CATEGORIAS: Categoria[] = [
  { id: 1, nombre: 'Programación', descripcion: 'Lenguajes, algoritmos y buenas prácticas de código',
    area: 'Informática', icono: 'bi-code-slash' },
  { id: 2, nombre: 'Bases de datos', descripcion: 'Diseño de modelos, consultas SQL y motores de bases de datos',
    area: 'Informática', icono: 'bi-database' },
  { id: 3, nombre: 'Desarrollo web', descripcion: 'Frontend, backend, frameworks y servicios web',
    area: 'Informática', icono: 'bi-globe2' },
  { id: 4, nombre: 'Redes y ciberseguridad', descripcion: 'Configuración de redes, protocolos y seguridad informática',
    area: 'Tecnología', icono: 'bi-shield-lock' },
  { id: 5, nombre: 'Inteligencia artificial', descripcion: 'Aprendizaje automático, modelos de lenguaje y sus aplicaciones',
    area: 'Tecnología', icono: 'bi-cpu' },
  { id: 6, nombre: 'Hardware y armado de PC', descripcion: 'Componentes, armado, diagnóstico y mantenimiento de equipos',
    area: 'Tecnología', icono: 'bi-motherboard' },
];

export const TEMAS_INICIALES: Tema[] = [
  { id: 1, titulo: '¿Java o Python para empezar a programar?', categoriaId: 1, autorId: 2, estado: 'ACTIVO',
    contenido: 'Estoy comenzando la carrera y no sé con qué lenguaje partir. ¿Qué me recomiendan y por qué?',
    fechaCreacion: new Date(2026, 10, 2, 10, 15) },
  { id: 2, titulo: 'Buenas prácticas para nombrar variables', categoriaId: 1, autorId: 3, estado: 'ACTIVO',
    contenido: 'Comparto algunas reglas que me han servido: nombres descriptivos, evitar abreviaturas y mantener un mismo idioma en todo el código.',
    fechaCreacion: new Date(2026, 10, 3, 18, 40) },
  { id: 3, titulo: '¿Cómo selecciono registros entre dos fechas en MySQL?', categoriaId: 2, autorId: 4, estado: 'ACTIVO',
    contenido: 'Tengo una tabla de ventas con una columna DATETIME y necesito las del último mes. ¿Uso BETWEEN o comparo con mayor y menor?',
    fechaCreacion: new Date(2026, 10, 4, 9, 5) },
  { id: 4, titulo: '¿Conviene aprender React o Angular primero?', categoriaId: 3, autorId: 2, estado: 'ACTIVO',
    contenido: 'Ya manejo HTML, CSS y JavaScript. Quiero aprender un framework de frontend y no sé cuál tiene mejor salida laboral.',
    fechaCreacion: new Date(2026, 10, 5, 21, 30) },
  { id: 5, titulo: 'Cómo configurar un firewall básico en casa', categoriaId: 4, autorId: 4, estado: 'ACTIVO',
    contenido: 'Quiero proteger mi red doméstica. ¿Basta con el firewall del router o conviene agregar algo más?',
    fechaCreacion: new Date(2026, 10, 6, 12, 0) },
  { id: 6, titulo: 'Herramientas de IA para estudiar programación', categoriaId: 5, autorId: 3, estado: 'ACTIVO',
    contenido: '¿Qué asistentes de IA usan para estudiar? Me interesa que expliquen el código y no solo que lo escriban.',
    fechaCreacion: new Date(2026, 10, 7, 16, 20) },
  { id: 7, titulo: 'Mi PC se apaga sola cuando juego', categoriaId: 6, autorId: 2, estado: 'ACTIVO',
    contenido: 'Funciona bien en tareas normales, pero con juegos exigentes se apaga sin aviso a los pocos minutos. ¿Fuente de poder o temperatura?',
    fechaCreacion: new Date(2026, 10, 8, 23, 10) },
  { id: 8, titulo: 'VENDO CUENTAS BARATAS, ESCRÍBEME AL PRIVADO', categoriaId: 6, autorId: 4, estado: 'BANEADO',
    contenido: 'Publicación de spam que fue baneada por un administrador por incumplir las normas del foro.',
    fechaCreacion: new Date(2026, 10, 9, 3, 33) },
];

export const COMENTARIOS_INICIALES: Comentario[] = [
  { id: 1, temaId: 1, autorId: 3, estado: 'ACTIVO', fechaCreacion: new Date(2026, 10, 2, 11, 0),
    contenido: 'Python tiene una sintaxis más simple para partir, pero Java te obliga a entender tipos y objetos desde el inicio.' },
  { id: 2, temaId: 1, autorId: 4, estado: 'ACTIVO', fechaCreacion: new Date(2026, 10, 2, 12, 30),
    contenido: 'Yo partí con Python y después Java se me hizo mucho más fácil.' },
  { id: 3, temaId: 3, autorId: 2, estado: 'ACTIVO', fechaCreacion: new Date(2026, 10, 4, 10, 0),
    contenido: 'BETWEEN incluye ambos extremos; ojo con la hora del último día.' },
  { id: 4, temaId: 4, autorId: 3, estado: 'ACTIVO', fechaCreacion: new Date(2026, 10, 5, 22, 0),
    contenido: 'Angular es muy usado en empresas grandes y trae todo integrado: rutas, formularios y HTTP.' },
  { id: 5, temaId: 7, autorId: 4, estado: 'ACTIVO', fechaCreacion: new Date(2026, 10, 9, 8, 15),
    contenido: 'Revisa las temperaturas con un monitor de hardware; si pasa de 90 °C es el disipador.' },
  { id: 6, temaId: 7, autorId: 3, estado: 'BANEADO', fechaCreacion: new Date(2026, 10, 9, 9, 0),
    contenido: 'Comentario ofensivo baneado por el administrador.' },
];
