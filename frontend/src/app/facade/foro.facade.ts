import { Injectable, computed, inject } from '@angular/core';
import {
  Categoria, ComentarioVista, EstadoPublicacion, Resultado, Rol, TemaVista, Usuario,
} from '../modelos/modelos';
import { ForoStore } from '../servicios/foro.store';
import { UsuariosStore } from '../servicios/usuarios.store';

/**
 * PATRÓN FACADE
 * Única puerta de entrada de los componentes a la lógica de negocio.
 * Los componentes no conocen los stores ni las listas: solo llaman a estos
 * métodos y leen sus signals. Cuando el frontend se conecte a los microservicios,
 * solo cambia el interior del facade (ms-usuarios, ms-foro y ms-moderacion),
 * no los componentes.
 *
 * Los métodos se agrupan igual que los microservicios del backend:
 *  - Usuarios   -> ms-usuarios
 *  - Foro       -> ms-foro
 *  - Moderación -> ms-moderacion (solo ADMIN)
 */
@Injectable({ providedIn: 'root' })
export class ForoFacade {

  private readonly usuariosStore = inject(UsuariosStore);
  private readonly foroStore = inject(ForoStore);

  // ---------------------------------------------------------------
  // Sesión y roles
  // ---------------------------------------------------------------
  readonly sesion = this.usuariosStore.sesion;
  readonly autenticado = computed(() => this.sesion() !== null);
  readonly esAdmin = computed(() => this.sesion()?.rol === 'ADMIN');

  // ---------------------------------------------------------------
  // Usuarios (ms-usuarios)
  // ---------------------------------------------------------------
  login(nombreUsuario: string, password: string): Resultado {
    const usuario = this.usuariosStore.buscarPorNombre(nombreUsuario);
    if (!usuario || usuario.password !== password) {
      return { ok: false, mensaje: 'Usuario o contraseña incorrectos.' };
    }
    if (!usuario.activo) {
      return { ok: false, mensaje: 'Tu cuenta está deshabilitada. Contacta a un administrador.' };
    }
    this.usuariosStore.iniciarSesion(usuario.id);
    return { ok: true, mensaje: `¡Bienvenido, ${usuario.nombreCompleto}!` };
  }

  logout(): void {
    this.usuariosStore.cerrarSesion();
  }

  registrar(datos: { nombreUsuario: string; nombreCompleto: string; email: string; password: string }): Resultado {
    const nombreUsuario = datos.nombreUsuario.trim().toLowerCase();
    const email = datos.email.trim().toLowerCase();
    if (this.usuariosStore.buscarPorNombre(nombreUsuario)) {
      return { ok: false, mensaje: 'El nombre de usuario ya está en uso.' };
    }
    if (this.usuariosStore.buscarPorEmail(email)) {
      return { ok: false, mensaje: 'Ya existe una cuenta con ese correo.' };
    }
    const nuevo = this.usuariosStore.agregar({
      nombreUsuario, email, nombreCompleto: datos.nombreCompleto.trim(), password: datos.password,
    });
    this.usuariosStore.iniciarSesion(nuevo.id);
    return { ok: true, mensaje: 'Cuenta creada correctamente.' };
  }

  /** Paso 1 de recuperar contraseña: genera un código (simulado, se muestra en pantalla). */
  solicitarRecuperacion(email: string): Resultado & { codigo?: string } {
    const usuario = this.usuariosStore.buscarPorEmail(email);
    if (!usuario) {
      return { ok: false, mensaje: 'No existe una cuenta con ese correo.' };
    }
    const codigo = String(Math.floor(100000 + Math.random() * 900000));
    this.codigosRecuperacion.set(usuario.email, codigo);
    return { ok: true, mensaje: `Enviamos un código a ${usuario.email}.`, codigo };
  }

  /** Paso 2 de recuperar contraseña: valida el código y guarda la nueva clave. */
  restablecerPassword(email: string, codigo: string, nuevaPassword: string): Resultado {
    const usuario = this.usuariosStore.buscarPorEmail(email);
    if (!usuario || this.codigosRecuperacion.get(usuario.email) !== codigo.trim()) {
      return { ok: false, mensaje: 'El código no es válido.' };
    }
    this.codigosRecuperacion.delete(usuario.email);
    this.usuariosStore.actualizar(usuario.id, { password: nuevaPassword });
    return { ok: true, mensaje: 'Contraseña actualizada. Ya puedes iniciar sesión.' };
  }

  actualizarPerfil(datos: { nombreCompleto: string; email: string; bio: string }): Resultado {
    const actual = this.sesion();
    if (!actual) {
      return { ok: false, mensaje: 'Debes iniciar sesión.' };
    }
    const email = datos.email.trim().toLowerCase();
    const otro = this.usuariosStore.buscarPorEmail(email);
    if (otro && otro.id !== actual.id) {
      return { ok: false, mensaje: 'Ese correo ya pertenece a otra cuenta.' };
    }
    this.usuariosStore.actualizar(actual.id, {
      nombreCompleto: datos.nombreCompleto.trim(), email, bio: datos.bio.trim(),
    });
    return { ok: true, mensaje: 'Perfil actualizado.' };
  }

  cambiarPassword(actualPassword: string, nuevaPassword: string): Resultado {
    const actual = this.sesion();
    if (!actual) {
      return { ok: false, mensaje: 'Debes iniciar sesión.' };
    }
    if (actual.password !== actualPassword) {
      return { ok: false, mensaje: 'La contraseña actual no es correcta.' };
    }
    this.usuariosStore.actualizar(actual.id, { password: nuevaPassword });
    return { ok: true, mensaje: 'Contraseña cambiada.' };
  }

  // Administración de usuarios (solo ADMIN)
  readonly usuarios = this.usuariosStore.usuarios;

  cambiarEstadoUsuario(id: number, activo: boolean): Resultado {
    if (!this.esAdmin()) return this.sinPermiso();
    if (id === this.sesion()?.id) {
      return { ok: false, mensaje: 'No puedes deshabilitar tu propia cuenta.' };
    }
    this.usuariosStore.actualizar(id, { activo });
    return { ok: true, mensaje: activo ? 'Usuario habilitado.' : 'Usuario deshabilitado.' };
  }

  cambiarRolUsuario(id: number, rol: Rol): Resultado {
    if (!this.esAdmin()) return this.sinPermiso();
    if (id === this.sesion()?.id) {
      return { ok: false, mensaje: 'No puedes cambiar tu propio rol.' };
    }
    this.usuariosStore.cambiarRol(id, rol);
    return { ok: true, mensaje: `Rol cambiado a ${rol}.` };
  }

  // ---------------------------------------------------------------
  // Foro (ms-foro)
  // ---------------------------------------------------------------
  readonly categorias: readonly Categoria[] = this.foroStore.categorias;

  /** Todos los temas con sus datos de vista (incluye los no visibles, para moderación). */
  private readonly todosLosTemas = computed<TemaVista[]>(() => {
    const comentarios = this.foroStore.comentarios();
    return this.foroStore.temas().map(t => ({
      ...t,
      autor: this.nombreDe(t.autorId),
      categoria: this.categorias.find(c => c.id === t.categoriaId)?.nombre ?? '—',
      cantidadComentarios: comentarios.filter(c => c.temaId === t.id && c.estado === 'ACTIVO').length,
    }));
  });

  private readonly todosLosComentarios = computed<ComentarioVista[]>(() => {
    const temas = this.foroStore.temas();
    return this.foroStore.comentarios().map(c => ({
      ...c,
      autor: this.nombreDe(c.autorId),
      temaTitulo: temas.find(t => t.id === c.temaId)?.titulo ?? '—',
    }));
  });

  /** Temas visibles del foro, del más reciente al más antiguo. */
  readonly temasVisibles = computed(() =>
    this.todosLosTemas()
      .filter(t => t.estado === 'ACTIVO')
      .sort((a, b) => b.fechaCreacion.getTime() - a.fechaCreacion.getTime()));

  readonly masComentados = computed(() =>
    [...this.temasVisibles()].sort((a, b) => b.cantidadComentarios - a.cantidadComentarios).slice(0, 3));

  categoria(id: number): Categoria | undefined {
    return this.categorias.find(c => c.id === id);
  }

  cantidadTemasPorCategoria(id: number): number {
    return this.temasVisibles().filter(t => t.categoriaId === id).length;
  }

  /** Búsqueda por palabra clave en título o contenido, opcionalmente dentro de una categoría. */
  buscarTemas(texto: string, categoriaId?: number): TemaVista[] {
    const q = texto.trim().toLowerCase();
    return this.temasVisibles().filter(t =>
      (categoriaId === undefined || t.categoriaId === categoriaId) &&
      (q === '' || t.titulo.toLowerCase().includes(q) || t.contenido.toLowerCase().includes(q)));
  }

  temasDe(autorId: number): TemaVista[] {
    return this.temasVisibles().filter(t => t.autorId === autorId);
  }

  tema(id: number): TemaVista | undefined {
    return this.todosLosTemas().find(t => t.id === id && t.estado === 'ACTIVO');
  }

  comentariosDe(temaId: number): ComentarioVista[] {
    return this.todosLosComentarios()
      .filter(c => c.temaId === temaId && c.estado === 'ACTIVO')
      .sort((a, b) => a.fechaCreacion.getTime() - b.fechaCreacion.getTime());
  }

  publicarTema(datos: { titulo: string; contenido: string; categoriaId: number }): Resultado & { id?: number } {
    const usuario = this.sesion();
    if (!usuario) return { ok: false, mensaje: 'Debes iniciar sesión para publicar.' };
    const tema = this.foroStore.agregarTema({
      titulo: datos.titulo.trim(), contenido: datos.contenido.trim(),
      categoriaId: Number(datos.categoriaId), autorId: usuario.id,
    });
    return { ok: true, mensaje: 'Tema publicado.', id: tema.id };
  }

  comentar(temaId: number, contenido: string): Resultado {
    const usuario = this.sesion();
    if (!usuario) return { ok: false, mensaje: 'Debes iniciar sesión para comentar.' };
    if (!this.tema(temaId)) return { ok: false, mensaje: 'El tema ya no está disponible.' };
    this.foroStore.agregarComentario({ temaId, autorId: usuario.id, contenido: contenido.trim() });
    return { ok: true, mensaje: 'Comentario publicado.' };
  }

  /** El autor o un ADMIN pueden eliminar (queda ELIMINADO, no se borra). */
  eliminarTema(id: number): Resultado {
    const tema = this.tema(id);
    if (!tema) return { ok: false, mensaje: 'El tema no existe.' };
    if (!this.puedeEliminar(tema.autorId)) return this.sinPermiso();
    this.foroStore.cambiarEstadoTema(id, 'ELIMINADO');
    return { ok: true, mensaje: 'Tema eliminado.' };
  }

  eliminarComentario(id: number): Resultado {
    const comentario = this.todosLosComentarios().find(c => c.id === id && c.estado === 'ACTIVO');
    if (!comentario) return { ok: false, mensaje: 'El comentario no existe.' };
    if (!this.puedeEliminar(comentario.autorId)) return this.sinPermiso();
    this.foroStore.cambiarEstadoComentario(id, 'ELIMINADO');
    return { ok: true, mensaje: 'Comentario eliminado.' };
  }

  puedeEliminar(autorId: number): boolean {
    const usuario = this.sesion();
    return !!usuario && (usuario.id === autorId || usuario.rol === 'ADMIN');
  }

  // ---------------------------------------------------------------
  // Moderación (ms-moderacion, solo ADMIN)
  // ---------------------------------------------------------------
  temasPorEstado(estado: EstadoPublicacion): TemaVista[] {
    return this.todosLosTemas().filter(t => t.estado === estado);
  }

  comentariosPorEstado(estado: EstadoPublicacion): ComentarioVista[] {
    return this.todosLosComentarios().filter(c => c.estado === estado);
  }

  readonly resumenModeracion = computed(() => ({
    temasActivos: this.todosLosTemas().filter(t => t.estado === 'ACTIVO').length,
    temasBaneados: this.todosLosTemas().filter(t => t.estado === 'BANEADO').length,
    comentariosActivos: this.todosLosComentarios().filter(c => c.estado === 'ACTIVO').length,
    comentariosBaneados: this.todosLosComentarios().filter(c => c.estado === 'BANEADO').length,
  }));

  banearTema(id: number): Resultado {
    return this.moderar('tema', id, 'ACTIVO', 'BANEADO', 'Tema baneado.');
  }

  restaurarTema(id: number): Resultado {
    return this.moderar('tema', id, 'BANEADO', 'ACTIVO', 'Tema restaurado.');
  }

  banearComentario(id: number): Resultado {
    return this.moderar('comentario', id, 'ACTIVO', 'BANEADO', 'Comentario baneado.');
  }

  restaurarComentario(id: number): Resultado {
    return this.moderar('comentario', id, 'BANEADO', 'ACTIVO', 'Comentario restaurado.');
  }

  // ---------------------------------------------------------------
  // Auxiliares
  // ---------------------------------------------------------------
  private readonly codigosRecuperacion = new Map<string, string>();

  private moderar(tipo: 'tema' | 'comentario', id: number, desde: EstadoPublicacion,
                  hacia: EstadoPublicacion, mensaje: string): Resultado {
    if (!this.esAdmin()) return this.sinPermiso();
    const actual = tipo === 'tema'
      ? this.foroStore.temas().find(t => t.id === id)
      : this.foroStore.comentarios().find(c => c.id === id);
    if (!actual) return { ok: false, mensaje: `No existe el ${tipo}.` };
    if (actual.estado !== desde) {
      return { ok: false, mensaje: `El ${tipo} está ${actual.estado} y debe estar ${desde}.` };
    }
    if (tipo === 'tema') this.foroStore.cambiarEstadoTema(id, hacia);
    else this.foroStore.cambiarEstadoComentario(id, hacia);
    return { ok: true, mensaje };
  }

  private nombreDe(usuarioId: number): string {
    return this.usuariosStore.buscarPorId(usuarioId)?.nombreUsuario ?? 'desconocido';
  }

  private sinPermiso(): Resultado {
    return { ok: false, mensaje: 'No tienes permiso para realizar esta acción.' };
  }

  usuarioPorId(id: number): Usuario | undefined {
    return this.usuariosStore.buscarPorId(id);
  }
}
