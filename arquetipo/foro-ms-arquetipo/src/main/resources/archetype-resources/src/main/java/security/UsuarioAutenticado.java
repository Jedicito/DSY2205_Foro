package ${package}.security;

import org.springframework.http.HttpStatus;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Component;
import org.springframework.web.server.ResponseStatusException;

import ${package}.model.Rol;
import ${package}.model.Usuario;
import ${package}.repository.UsuarioRepository;

/** Obtiene el usuario que hace la petición y su rol. */
@Component
public class UsuarioAutenticado {

    private final UsuarioRepository usuarioRepository;

    public UsuarioAutenticado(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    public Usuario obtener(Authentication autenticacion) {
        return usuarioRepository.findByNombreUsuario(autenticacion.getName())
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.UNAUTHORIZED,
                        "El usuario autenticado no existe"));
    }

    public boolean esAdmin(Authentication autenticacion) {
        return autenticacion.getAuthorities().stream()
                .anyMatch(a -> ("ROLE_" + Rol.ADMIN).equals(a.getAuthority()));
    }
}
