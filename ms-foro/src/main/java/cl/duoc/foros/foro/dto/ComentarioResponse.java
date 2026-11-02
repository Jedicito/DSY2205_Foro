package cl.duoc.foros.foro.dto;

import java.time.LocalDateTime;

import cl.duoc.foros.foro.model.Comentario;

public record ComentarioResponse(
        Long id,
        Long temaId,
        String contenido,
        String autor,
        String estado,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaModificacion
) {

    public static ComentarioResponse desde(Comentario comentario) {
        return new ComentarioResponse(
                comentario.getId(),
                comentario.getTema().getId(),
                comentario.getContenido(),
                comentario.getAutor().getNombreUsuario(),
                comentario.getEstado().name(),
                comentario.getFechaCreacion(),
                comentario.getFechaModificacion());
    }
}
