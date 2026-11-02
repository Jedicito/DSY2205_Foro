package cl.duoc.foros.usuarios.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import cl.duoc.foros.usuarios.dto.ActualizarUsuarioRequest;
import cl.duoc.foros.usuarios.dto.RegistroUsuarioRequest;
import cl.duoc.foros.usuarios.dto.UsuarioResponse;
import cl.duoc.foros.usuarios.model.Rol;
import cl.duoc.foros.usuarios.model.Usuario;
import cl.duoc.foros.usuarios.repository.RolRepository;
import cl.duoc.foros.usuarios.repository.UsuarioRepository;

/**
 * Reglas de negocio de los usuarios.
 *
 * Privilegios:
 *  - USUARIO: ve y modifica solo su propia cuenta.
 *  - ADMIN: ve y modifica cualquier cuenta, cambia roles y deshabilita usuarios.
 */
@Service
public class UsuarioService {

    private final UsuarioRepository usuarioRepository;
    private final RolRepository rolRepository;
    private final PasswordEncoder passwordEncoder;

    public UsuarioService(UsuarioRepository usuarioRepository,
                          RolRepository rolRepository,
                          PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.rolRepository = rolRepository;
        this.passwordEncoder = passwordEncoder;
    }

    // ------------------------------------------------------------------
    // Registro (público)
    // ------------------------------------------------------------------
    @Transactional
    public UsuarioResponse registrar(RegistroUsuarioRequest datos) {
        String nombreUsuario = normalizar(datos.nombreUsuario());
        String email = normalizar(datos.email());

        if (usuarioRepository.existsByNombreUsuario(nombreUsuario)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El nombre de usuario '" + nombreUsuario + "' ya está en uso");
        }
        if (usuarioRepository.existsByEmail(email)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "El email '" + email + "' ya está registrado");
        }

        Usuario usuario = new Usuario();
        usuario.setNombreUsuario(nombreUsuario);
        usuario.setEmail(email);
        usuario.setPasswordHash(passwordEncoder.encode(datos.password()));
        usuario.setNombreCompleto(datos.nombreCompleto().trim());
        usuario.setRol(buscarRol(Rol.USUARIO));
        usuario.setActivo(true);
        usuario.setFechaRegistro(LocalDateTime.now());

        return UsuarioResponse.desde(usuarioRepository.save(usuario));
    }

    // ------------------------------------------------------------------
    // Consultas
    // ------------------------------------------------------------------
    @Transactional(readOnly = true)
    public UsuarioResponse obtenerPorNombreUsuario(String nombreUsuario) {
        return UsuarioResponse.desde(buscarPorNombreUsuario(nombreUsuario));
    }

    @Transactional(readOnly = true)
    public List<UsuarioResponse> listar() {
        return usuarioRepository.findAll(Sort.by("id")).stream()
                .map(UsuarioResponse::desde)
                .toList();
    }

    @Transactional(readOnly = true)
    public UsuarioResponse obtener(Long id, Authentication autenticacion) {
        verificarPropioOAdmin(id, autenticacion);
        return UsuarioResponse.desde(buscarPorId(id));
    }

    // ------------------------------------------------------------------
    // Modificación
    // ------------------------------------------------------------------
    @Transactional
    public UsuarioResponse actualizar(Long id, ActualizarUsuarioRequest datos, Authentication autenticacion) {
        if (datos.estaVacio()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Debes enviar al menos un campo para modificar");
        }
        verificarPropioOAdmin(id, autenticacion);

        boolean esAdmin = esAdmin(autenticacion);
        if (!esAdmin && (datos.rol() != null || datos.activo() != null)) {
            throw new AccessDeniedException("Solo un administrador puede cambiar el rol o el estado de un usuario");
        }

        Usuario usuario = buscarPorId(id);

        if (datos.email() != null) {
            String email = normalizar(datos.email());
            if (usuarioRepository.existsByEmailAndIdNot(email, id)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "El email '" + email + "' ya está registrado");
            }
            usuario.setEmail(email);
        }
        if (datos.nombreCompleto() != null) {
            usuario.setNombreCompleto(datos.nombreCompleto().trim());
        }
        if (datos.password() != null) {
            usuario.setPasswordHash(passwordEncoder.encode(datos.password()));
        }
        if (datos.rol() != null) {
            usuario.setRol(buscarRol(datos.rol()));
        }
        if (datos.activo() != null) {
            if (!datos.activo() && esLaPropiaCuenta(usuario, autenticacion)) {
                throw new ResponseStatusException(HttpStatus.CONFLICT,
                        "No puedes deshabilitar tu propia cuenta");
            }
            usuario.setActivo(datos.activo());
        }

        return UsuarioResponse.desde(usuarioRepository.save(usuario));
    }

    // ------------------------------------------------------------------
    // "Eliminación": se deshabilita, no se borra (solo ADMIN)
    // ------------------------------------------------------------------
    @Transactional
    public UsuarioResponse deshabilitar(Long id, Authentication autenticacion) {
        Usuario usuario = buscarPorId(id);
        if (esLaPropiaCuenta(usuario, autenticacion)) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No puedes deshabilitar tu propia cuenta");
        }
        usuario.setActivo(false);
        return UsuarioResponse.desde(usuarioRepository.save(usuario));
    }

    // ------------------------------------------------------------------
    // Apoyo
    // ------------------------------------------------------------------
    private Usuario buscarPorId(Long id) {
        return usuarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No existe un usuario con id " + id));
    }

    private Usuario buscarPorNombreUsuario(String nombreUsuario) {
        return usuarioRepository.findByNombreUsuario(nombreUsuario)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No existe el usuario '" + nombreUsuario + "'"));
    }

    private Rol buscarRol(String nombre) {
        return rolRepository.findByNombre(nombre)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.INTERNAL_SERVER_ERROR,
                        "El rol " + nombre + " no existe en la base de datos"));
    }

    /** Un USUARIO solo puede operar sobre su propia cuenta; un ADMIN, sobre cualquiera. */
    private void verificarPropioOAdmin(Long id, Authentication autenticacion) {
        if (esAdmin(autenticacion)) {
            return;
        }
        Usuario actual = buscarPorNombreUsuario(autenticacion.getName());
        if (!actual.getId().equals(id)) {
            throw new AccessDeniedException("Solo puedes acceder a tu propia cuenta");
        }
    }

    private boolean esAdmin(Authentication autenticacion) {
        return autenticacion.getAuthorities().stream()
                .anyMatch(a -> ("ROLE_" + Rol.ADMIN).equals(a.getAuthority()));
    }

    private boolean esLaPropiaCuenta(Usuario usuario, Authentication autenticacion) {
        return usuario.getNombreUsuario().equals(autenticacion.getName());
    }

    /** Nombres de usuario y emails se guardan sin espacios y en minúsculas. */
    private String normalizar(String texto) {
        return texto.trim().toLowerCase(Locale.ROOT);
    }
}
