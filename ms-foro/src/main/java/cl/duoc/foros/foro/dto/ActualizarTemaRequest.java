package cl.duoc.foros.foro.dto;

import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Positive;
import jakarta.validation.constraints.Size;

/** Datos para modificar un tema. Todos opcionales: solo se cambian los que vienen. */
public record ActualizarTemaRequest(

        @Pattern(regexp = "(?s).*\\S.*", message = "El título no puede estar vacío")
        @Size(max = 150, message = "El título admite máximo 150 caracteres")
        String titulo,

        @Pattern(regexp = "(?s).*\\S.*", message = "El contenido no puede estar vacío")
        @Size(max = 2000, message = "El contenido admite máximo 2000 caracteres")
        String contenido,

        @Positive(message = "La categoría no es válida")
        Long categoriaId
) {

    public boolean estaVacio() {
        return titulo == null && contenido == null && categoriaId == null;
    }
}
