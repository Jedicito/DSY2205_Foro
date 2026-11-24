package cl.duoc.foros.moderacion.security;

import java.util.Locale;

import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import cl.duoc.foros.moderacion.model.Usuario;
import cl.duoc.foros.moderacion.repository.UsuarioRepository;

/**
 * Autentica contra la tabla de usuarios (la misma que administra ms-usuarios).
 * Un usuario deshabilitado (ACTIVO = 0) es rechazado aunque su clave sea correcta.
 */
@Service
public class UsuarioDetailsService implements UserDetailsService {

    private final UsuarioRepository usuarioRepository;

    public UsuarioDetailsService(UsuarioRepository usuarioRepository) {
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    @Transactional(readOnly = true)
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        String nombreUsuario = username.trim().toLowerCase(Locale.ROOT);

        Usuario usuario = usuarioRepository.findByNombreUsuario(nombreUsuario)
                .orElseThrow(() -> new UsernameNotFoundException("Usuario no encontrado: " + nombreUsuario));

        return User.withUsername(usuario.getNombreUsuario())
                .password(usuario.getPasswordHash())
                .roles(usuario.getRol().getNombre())   // USUARIO o ADMIN -> ROLE_USUARIO / ROLE_ADMIN
                .disabled(!usuario.isActivo())
                .build();
    }
}
