package cl.duoc.foros.usuarios.controller;

import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.foros.usuarios.dto.ActualizarUsuarioRequest;
import cl.duoc.foros.usuarios.dto.RegistroUsuarioRequest;
import cl.duoc.foros.usuarios.dto.UsuarioResponse;
import cl.duoc.foros.usuarios.service.UsuarioService;
import jakarta.validation.Valid;

/**
 * CRUD de usuarios.
 *
 *  POST   /api/usuarios        Registro (público)
 *  GET    /api/usuarios        Listar todos (ADMIN)
 *  GET    /api/usuarios/{id}   Ver uno (el propio usuario o ADMIN)
 *  PUT    /api/usuarios/{id}   Modificar (el propio usuario o ADMIN)
 *  DELETE /api/usuarios/{id}   Deshabilitar, no borra (ADMIN)
 */
@RestController
@RequestMapping("/api/usuarios")
public class UsuarioController {

    private final UsuarioService usuarioService;

    public UsuarioController(UsuarioService usuarioService) {
        this.usuarioService = usuarioService;
    }

    @PostMapping
    public ResponseEntity<UsuarioResponse> registrar(@Valid @RequestBody RegistroUsuarioRequest datos) {
        return ResponseEntity.status(HttpStatus.CREATED).body(usuarioService.registrar(datos));
    }

    @GetMapping
    public List<UsuarioResponse> listar() {
        return usuarioService.listar();
    }

    @GetMapping("/{id}")
    public UsuarioResponse obtener(@PathVariable Long id, Authentication autenticacion) {
        return usuarioService.obtener(id, autenticacion);
    }

    @PutMapping("/{id}")
    public UsuarioResponse actualizar(@PathVariable Long id,
                                      @Valid @RequestBody ActualizarUsuarioRequest datos,
                                      Authentication autenticacion) {
        return usuarioService.actualizar(id, datos, autenticacion);
    }

    @DeleteMapping("/{id}")
    public UsuarioResponse deshabilitar(@PathVariable Long id, Authentication autenticacion) {
        return usuarioService.deshabilitar(id, autenticacion);
    }
}
