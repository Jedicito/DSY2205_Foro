package cl.duoc.foros.usuarios.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

/**
 * Datos para modificar un usuario. Todos los campos son opcionales:
 * solo se cambian los que vienen en el JSON.
 * El nombre de usuario no se puede modificar.
 * rol y activo solo los puede cambiar un ADMIN.
 */
public record ActualizarUsuarioRequest(

        @Email(message = "El email no tiene un formato válido")
        @Pattern(regexp = ".*\\S.*", message = "El email no puede estar vacío")
        @Size(max = 120, message = "El email admite máximo 120 caracteres")
        String email,

        @Size(min = 8, max = 72, message = "La clave debe tener entre 8 y 72 caracteres")
        String password,

        @Pattern(regexp = ".*\\S.*", message = "El nombre completo no puede estar vacío")
        @Size(max = 100, message = "El nombre completo admite máximo 100 caracteres")
        String nombreCompleto,

        @Pattern(regexp = "USUARIO|ADMIN", message = "El rol debe ser USUARIO o ADMIN")
        String rol,

        Boolean activo
) {

    public boolean estaVacio() {
        return email == null && password == null && nombreCompleto == null && rol == null && activo == null;
    }
}
