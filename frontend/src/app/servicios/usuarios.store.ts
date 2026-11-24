import { Injectable, computed, signal } from '@angular/core';
import { USUARIOS_INICIALES } from '../datos/datos-iniciales';
import { Rol, Usuario } from '../modelos/modelos';

/**
 * Store de usuarios (patrón Observer con signals).
 * Guarda la lista de usuarios y la sesión actual; los componentes no lo usan
 * directamente, sino a través de ForoFacade.
 */
@Injectable({ providedIn: 'root' })
export class UsuariosStore {

  private readonly _usuarios = signal<Usuario[]>(structuredClone(USUARIOS_INICIALES));
  private readonly _sesionId = signal<number | null>(null);

  readonly usuarios = this._usuarios.asReadonly();

  readonly sesion = computed(() => {
    const id = this._sesionId();
    return id === null ? null : this._usuarios().find(u => u.id === id) ?? null;
  });

  buscarPorNombre(nombreUsuario: string): Usuario | undefined {
    const nombre = nombreUsuario.trim().toLowerCase();
    return this._usuarios().find(u => u.nombreUsuario === nombre);
  }

  buscarPorEmail(email: string): Usuario | undefined {
    const correo = email.trim().toLowerCase();
    return this._usuarios().find(u => u.email === correo);
  }

  buscarPorId(id: number): Usuario | undefined {
    return this._usuarios().find(u => u.id === id);
  }

  agregar(datos: Omit<Usuario, 'id' | 'fechaRegistro' | 'activo' | 'rol' | 'bio'>): Usuario {
    const nuevo: Usuario = {
      ...datos,
      id: Math.max(0, ...this._usuarios().map(u => u.id)) + 1,
      rol: 'USUARIO',
      activo: true,
      bio: '',
      fechaRegistro: new Date(),
    };
    this._usuarios.update(lista => [...lista, nuevo]);
    return nuevo;
  }

  actualizar(id: number, cambios: Partial<Usuario>): void {
    this._usuarios.update(lista => lista.map(u => (u.id === id ? { ...u, ...cambios } : u)));
  }

  cambiarRol(id: number, rol: Rol): void {
    this.actualizar(id, { rol });
  }

  iniciarSesion(id: number): void {
    this._sesionId.set(id);
  }

  cerrarSesion(): void {
    this._sesionId.set(null);
  }
}
