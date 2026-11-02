package cl.duoc.foros.foro.controller;

import java.util.List;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import cl.duoc.foros.foro.dto.CategoriaResponse;
import cl.duoc.foros.foro.dto.TemaResponse;
import cl.duoc.foros.foro.service.CategoriaService;
import cl.duoc.foros.foro.service.TemaService;

/**
 * Categorías (catálogo de solo lectura, acceso público).
 *
 *  GET /api/categorias              Listar categorías
 *  GET /api/categorias/{id}         Ver una categoría
 *  GET /api/categorias/{id}/temas   Consulta: temas de una categoría
 */
@RestController
@RequestMapping("/api/categorias")
public class CategoriaController {

    private final CategoriaService categoriaService;
    private final TemaService temaService;

    public CategoriaController(CategoriaService categoriaService, TemaService temaService) {
        this.categoriaService = categoriaService;
        this.temaService = temaService;
    }

    @GetMapping
    public List<CategoriaResponse> listar() {
        return categoriaService.listar();
    }

    @GetMapping("/{id}")
    public CategoriaResponse obtener(@PathVariable Long id) {
        return categoriaService.obtener(id);
    }

    @GetMapping("/{id}/temas")
    public List<TemaResponse> temasDeCategoria(@PathVariable Long id) {
        return temaService.listarPorCategoria(id);
    }
}
