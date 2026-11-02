package cl.duoc.foros.usuarios.dto;

import java.time.LocalDateTime;

import cl.duoc.foros.usuarios.model.Usuario;

/**
 * Datos de un usuario que se devuelven en el JSON.
 * Nunca incluye el hash de la clave.
 */
public record UsuarioResponse(
        Long id,
        String nombreUsuario,
        String email,
        String nombreCompleto,
        String rol,
        boolean activo,
        LocalDateTime fechaRegistro
) {

    public static UsuarioResponse desde(Usuario usuario) {
        return new UsuarioResponse(
                usuario.getId(),
                usuario.getNombreUsuario(),
                usuario.getEmail(),
                usuario.getNombreCompleto(),
                usuario.getRol().getNombre(),
                usuario.isActivo(),
                usuario.getFechaRegistro());
    }
}
