package cl.duoc.foros.foro.model;

/**
 * Estado de un tema o comentario.
 *  ACTIVO    -> visible en el foro.
 *  ELIMINADO -> eliminado por su autor o por un ADMIN (sigue en la base).
 *  BANEADO   -> reservado para un futuro microservicio de moderación.
 */
public enum EstadoPublicacion {
    ACTIVO,
    ELIMINADO,
    BANEADO
}
