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
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.foros.foro.dto.ActualizarTemaRequest;
import cl.duoc.foros.foro.dto.CrearTemaRequest;
import cl.duoc.foros.foro.dto.TemaResponse;
import cl.duoc.foros.foro.service.TemaService;
import jakarta.validation.Valid;

/**
 * Temas del foro.
 *
 *  GET    /api/temas                          Listar temas (público)
 *  GET    /api/temas/{id}                     Ver un tema (público)
 *  GET    /api/temas/buscar?texto=...         Consulta: búsqueda por palabra clave (público)
 *  GET    /api/temas/autor/{nombreUsuario}    Consulta: temas de un autor (público)
 *  GET    /api/temas/mas-comentados?limite=5  Consulta: ranking de más comentados (público)
 *  POST   /api/temas                          Publicar (autenticado)
 *  PUT    /api/temas/{id}                     Modificar (solo el autor)
 *  DELETE /api/temas/{id}                     Eliminar, no borra (autor o ADMIN)
 */
@RestController
@RequestMapping("/api/temas")
public class TemaController {

    private final TemaService temaService;

    public TemaController(TemaService temaService) {
        this.temaService = temaService;
    }

    @GetMapping
    public List<TemaResponse> listar() {
        return temaService.listar();
    }

    @GetMapping("/{id}")
    public TemaResponse obtener(@PathVariable Long id) {
        return temaService.obtener(id);
    }

    @GetMapping("/buscar")
    public List<TemaResponse> buscar(@RequestParam String texto) {
        return temaService.buscar(texto);
    }

    @GetMapping("/autor/{nombreUsuario}")
    public List<TemaResponse> temasDeAutor(@PathVariable String nombreUsuario) {
        return temaService.listarPorAutor(nombreUsuario);
    }

    @GetMapping("/mas-comentados")
    public List<TemaResponse> masComentados(@RequestParam(defaultValue = "5") int limite) {
        return temaService.masComentados(limite);
    }

    @PostMapping
    public ResponseEntity<TemaResponse> crear(@Valid @RequestBody CrearTemaRequest datos,
                                              Authentication autenticacion) {
        return ResponseEntity.status(HttpStatus.CREATED).body(temaService.crear(datos, autenticacion));
    }

    @PutMapping("/{id}")
    public TemaResponse actualizar(@PathVariable Long id,
                                   @Valid @RequestBody ActualizarTemaRequest datos,
                                   Authentication autenticacion) {
        return temaService.actualizar(id, datos, autenticacion);
    }

    @DeleteMapping("/{id}")
    public TemaResponse eliminar(@PathVariable Long id, Authentication autenticacion) {
        return temaService.eliminar(id, autenticacion);
    }
}
