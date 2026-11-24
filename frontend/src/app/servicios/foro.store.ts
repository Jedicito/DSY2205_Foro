import { Injectable, signal } from '@angular/core';
import { CATEGORIAS, COMENTARIOS_INICIALES, TEMAS_INICIALES } from '../datos/datos-iniciales';
import { Categoria, Comentario, EstadoPublicacion, Tema } from '../modelos/modelos';

/**
 * Store del foro (patrón Observer con signals): categorías, temas y comentarios.
 * Cada cambio crea una lista nueva, así todas las vistas que la observan se actualizan solas.
 */
@Injectable({ providedIn: 'root' })
export class ForoStore {

  readonly categorias: readonly Categoria[] = CATEGORIAS;

  private readonly _temas = signal<Tema[]>(structuredClone(TEMAS_INICIALES));
  private readonly _comentarios = signal<Comentario[]>(structuredClone(COMENTARIOS_INICIALES));

  readonly temas = this._temas.asReadonly();
  readonly comentarios = this._comentarios.asReadonly();

  agregarTema(datos: Pick<Tema, 'titulo' | 'contenido' | 'categoriaId' | 'autorId'>): Tema {
    const nuevo: Tema = {
      ...datos,
      id: Math.max(0, ...this._temas().map(t => t.id)) + 1,
      estado: 'ACTIVO',
      fechaCreacion: new Date(),
    };
    this._temas.update(lista => [nuevo, ...lista]);
    return nuevo;
  }

  agregarComentario(datos: Pick<Comentario, 'temaId' | 'autorId' | 'contenido'>): Comentario {
    const nuevo: Comentario = {
      ...datos,
      id: Math.max(0, ...this._comentarios().map(c => c.id)) + 1,
      estado: 'ACTIVO',
      fechaCreacion: new Date(),
    };
    this._comentarios.update(lista => [...lista, nuevo]);
    return nuevo;
  }

  cambiarEstadoTema(id: number, estado: EstadoPublicacion): void {
    this._temas.update(lista => lista.map(t => (t.id === id ? { ...t, estado } : t)));
  }

  cambiarEstadoComentario(id: number, estado: EstadoPublicacion): void {
    this._comentarios.update(lista => lista.map(c => (c.id === id ? { ...c, estado } : c)));
  }
}
