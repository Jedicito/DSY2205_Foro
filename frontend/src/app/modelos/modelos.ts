/**
 * Modelos del frontend. Reflejan las tablas de la base Oracle
 * (USR_USUARIO, FOR_CATEGORIA, FOR_TEMA, FOR_COMENTARIO), pero en esta
 * entrega los datos viven en listas estáticas de Angular.
 */

export type Rol = 'USUARIO' | 'ADMIN';

export type EstadoPublicacion = 'ACTIVO' | 'ELIMINADO' | 'BANEADO';

export interface Usuario {
  id: number;
  nombreUsuario: string;
  nombreCompleto: string;
  email: string;
  password: string;
  rol: Rol;
  activo: boolean;
  bio: string;
  fechaRegistro: Date;
}

export interface Categoria {
  id: number;
  nombre: string;
  descripcion: string;
  area: 'Informática' | 'Tecnología';
  icono: string;
}

export interface Tema {
  id: number;
  titulo: string;
  contenido: string;
  categoriaId: number;
  autorId: number;
  estado: EstadoPublicacion;
  fechaCreacion: Date;
}

export interface Comentario {
  id: number;
  temaId: number;
  autorId: number;
  contenido: string;
  estado: EstadoPublicacion;
  fechaCreacion: Date;
}

/** Tema con los datos que necesita la vista (autor, categoría y cantidad de comentarios). */
export interface TemaVista extends Tema {
  autor: string;
  categoria: string;
  cantidadComentarios: number;
}

export interface ComentarioVista extends Comentario {
  autor: string;
  temaTitulo: string;
}

/** Resultado de una operación del facade: éxito o mensaje de error para la vista. */
export interface Resultado {
  ok: boolean;
  mensaje: string;
}
