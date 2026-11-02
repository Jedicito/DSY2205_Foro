package cl.duoc.foros.foro.service;

import java.util.List;

import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import cl.duoc.foros.foro.dto.CategoriaResponse;
import cl.duoc.foros.foro.model.Categoria;
import cl.duoc.foros.foro.repository.CategoriaRepository;

/** Categorías: catálogo de solo lectura. */
@Service
public class CategoriaService {

    private final CategoriaRepository categoriaRepository;

    public CategoriaService(CategoriaRepository categoriaRepository) {
        this.categoriaRepository = categoriaRepository;
    }

    @Transactional(readOnly = true)
    public List<CategoriaResponse> listar() {
        return categoriaRepository.findAll(Sort.by("id")).stream()
                .map(CategoriaResponse::desde)
                .toList();
    }

    @Transactional(readOnly = true)
    public CategoriaResponse obtener(Long id) {
        return CategoriaResponse.desde(buscar(id));
    }

    public Categoria buscar(Long id) {
        return categoriaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No existe una categoría con id " + id));
    }
}
