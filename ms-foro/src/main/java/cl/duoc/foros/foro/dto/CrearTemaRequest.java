package cl.duoc.foros.foro.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/** Datos para publicar un tema. El autor es el usuario autenticado. */
public record CrearTemaRequest(

        @NotBlank(message = "El título es obligatorio")
        @Size(max = 150, message = "El título admite máximo 150 caracteres")
        String titulo,

        @NotBlank(message = "El contenido es obligatorio")
        @Size(max = 2000, message = "El contenido admite máximo 2000 caracteres")
        String contenido,

        @NotNull(message = "La categoría es obligatoria")
        @Positive(message = "La categoría no es válida")
        Long categoriaId
) {
}
