package cl.duoc.foros.foro.controller;

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

import cl.duoc.foros.foro.dto.ComentarioRequest;
import cl.duoc.foros.foro.dto.ComentarioResponse;
import cl.duoc.foros.foro.service.ComentarioService;
import jakarta.validation.Valid;

/**
 * Comentarios de los temas.
 *
 *  GET    /api/temas/{temaId}/comentarios   Comentarios de un tema (público)
 *  POST   /api/temas/{temaId}/comentarios   Comentar un tema (autenticado)
 *  GET    /api/comentarios/{id}             Ver un comentario (público)
 *  PUT    /api/comentarios/{id}             Modificar (solo el autor)
 *  DELETE /api/comentarios/{id}             Eliminar, no borra (autor o ADMIN)
 */
@RestController
@RequestMapping("/api")
public class ComentarioController {

    private final ComentarioService comentarioService;

    public ComentarioController(ComentarioService comentarioService) {
        this.comentarioService = comentarioService;
    }

    @GetMapping("/temas/{temaId}/comentarios")
    public List<ComentarioResponse> listarPorTema(@PathVariable Long temaId) {
        return comentarioService.listarPorTema(temaId);
    }

    @PostMapping("/temas/{temaId}/comentarios")
    public ResponseEntity<ComentarioResponse> crear(@PathVariable Long temaId,
                                                    @Valid @RequestBody ComentarioRequest datos,
                                                    Authentication autenticacion) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(comentarioService.crear(temaId, datos, autenticacion));
    }

    @GetMapping("/comentarios/{id}")
    public ComentarioResponse obtener(@PathVariable Long id) {
        return comentarioService.obtener(id);
    }

    @PutMapping("/comentarios/{id}")
    public ComentarioResponse actualizar(@PathVariable Long id,
                                         @Valid @RequestBody ComentarioRequest datos,
                                         Authentication autenticacion) {
        return comentarioService.actualizar(id, datos, autenticacion);
    }

    @DeleteMapping("/comentarios/{id}")
    public ComentarioResponse eliminar(@PathVariable Long id, Authentication autenticacion) {
        return comentarioService.eliminar(id, autenticacion);
    }
}
