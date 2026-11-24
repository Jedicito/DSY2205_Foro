package cl.duoc.foros.moderacion.dto;

/** Totales para el panel del administrador. */
public record ResumenModeracionResponse(
        long temasActivos,
        long temasBaneados,
        long comentariosActivos,
        long comentariosBaneados
) {
}
