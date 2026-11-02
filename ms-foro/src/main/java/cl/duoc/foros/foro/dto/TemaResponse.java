package cl.duoc.foros.foro.dto;

import java.time.LocalDateTime;

import cl.duoc.foros.foro.model.Tema;

/** Datos de un tema que se devuelven en el JSON, con la cantidad de comentarios visibles. */
public record TemaResponse(
        Long id,
        String titulo,
        String contenido,
        Long categoriaId,
        String categoria,
        String autor,
        String estado,
        long cantidadComentarios,
        LocalDateTime fechaCreacion,
        LocalDateTime fechaModificacion
) {

    public static TemaResponse desde(Tema tema, long cantidadComentarios) {
        return new TemaResponse(
                tema.getId(),
                tema.getTitulo(),
                tema.getContenido(),
                tema.getCategoria().getId(),
                tema.getCategoria().getNombre(),
                tema.getAutor().getNombreUsuario(),
                tema.getEstado().name(),
                cantidadComentarios,
                tema.getFechaCreacion(),
                tema.getFechaModificacion());
    }
}
