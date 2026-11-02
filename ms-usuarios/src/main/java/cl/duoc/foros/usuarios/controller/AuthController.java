package cl.duoc.foros.usuarios.controller;

import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.foros.usuarios.dto.UsuarioResponse;
import cl.duoc.foros.usuarios.service.UsuarioService;

/**
 * Inicio de sesión.
 * Con HTTP Basic las credenciales viajan en cada petición: si este endpoint
 * responde 200, el usuario y la clave son válidos y el usuario está activo.
 * Devuelve los datos del usuario, incluido su rol.
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final UsuarioService usuarioService;

    public AuthController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @GetMapping("/login")
    public UsuarioResponse login(Authentication autenticacion) {
        return usuarioService.obtenerPorNombreUsuario(autenticacion.getName());
    }
}
