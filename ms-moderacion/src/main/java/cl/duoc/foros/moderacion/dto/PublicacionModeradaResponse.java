package cl.duoc.foros.moderacion.dto;

import cl.duoc.foros.moderacion.model.Comentario;
import cl.duoc.foros.moderacion.model.EstadoPublicacion;
import cl.duoc.foros.moderacion.model.Tema;
import java.time.LocalDateTime;

/** Tema o comentario visto desde moderación. */
public record PublicacionModeradaResponse(
        String tipo,
        Long id,
        String resumen,
        String autor,
        Long temaId,
        EstadoPublicacion estado,
        LocalDateTime fechaModificacion
) {

    public static PublicacionModeradaResponse desde(Tema tema) {
        return new PublicacionModeradaResponse("TEMA", tema.getId(), tema.getTitulo(),
                tema.getAutor() != null ? tema.getAutor().getNombreUsuario() : null,
                tema.getId(), tema.getEstado(), tema.getFechaModificacion());
    }

    public static PublicacionModeradaResponse desde(Comentario comentario) {
        String texto = comentario.getContenido();
        String resumen = texto != null && texto.length() > 80 ? texto.substring(0, 80) + "..." : texto;
        return new PublicacionModeradaResponse("COMENTARIO", comentario.getId(), resumen,
                comentario.getAutor() != null ? comentario.getAutor().getNombreUsuario() : null,
                comentario.getTema() != null ? comentario.getTema().getId() : null,
                comentario.getEstado(), comentario.getFechaModificacion());
    }
}
