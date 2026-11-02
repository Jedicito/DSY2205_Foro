package cl.duoc.foros.usuarios.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Datos para registrar un usuario nuevo.
 * El rol no se recibe: todo registro queda como USUARIO.
 */
public record RegistroUsuarioRequest(

        @NotBlank(message = "El nombre de usuario es obligatorio")
        @Size(min = 3, max = 50, message = "El nombre de usuario debe tener entre 3 y 50 caracteres")
        @Pattern(regexp = "^[a-zA-Z0-9._-]+$",
                 message = "El nombre de usuario solo admite letras, números, punto, guion y guion bajo")
        String nombreUsuario,

        @NotBlank(message = "El email es obligatorio")
        @Email(message = "El email no tiene un formato válido")
        @Size(max = 120, message = "El email admite máximo 120 caracteres")
        String email,

        // BCrypt solo considera los primeros 72 bytes de la clave
        @NotBlank(message = "La clave es obligatoria")
        @Size(min = 8, max = 72, message = "La clave debe tener entre 8 y 72 caracteres")
        String password,

        @NotBlank(message = "El nombre completo es obligatorio")
        @Size(max = 100, message = "El nombre completo admite máximo 100 caracteres")
        String nombreCompleto
) {
}
