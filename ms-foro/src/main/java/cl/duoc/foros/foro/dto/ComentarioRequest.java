package cl.duoc.foros.foro.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

/** Datos para publicar o modificar un comentario. */
public record ComentarioRequest(

        @NotBlank(message = "El contenido es obligatorio")
        @Size(max = 1000, message = "El comentario admite máximo 1000 caracteres")
        String contenido
) {
}
