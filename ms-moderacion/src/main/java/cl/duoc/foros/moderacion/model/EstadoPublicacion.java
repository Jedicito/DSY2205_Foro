package cl.duoc.foros.moderacion.model;

/**
 * Estado de un tema o comentario (mismos valores que usa ms-foro).
 *  ACTIVO    -> visible en el foro.
 *  ELIMINADO -> eliminado por su autor o por un ADMIN desde ms-foro.
 *  BANEADO   -> ocultado por un ADMIN desde este microservicio por incumplir las normas.
 */
public enum EstadoPublicacion {
    ACTIVO,
    ELIMINADO,
    BANEADO
}
