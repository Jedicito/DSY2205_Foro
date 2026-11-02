package cl.duoc.foros.foro.dto;

import cl.duoc.foros.foro.model.Categoria;

public record CategoriaResponse(Long id, String nombre, String descripcion) {

    public static CategoriaResponse desde(Categoria categoria) {
        return new CategoriaResponse(categoria.getId(), categoria.getNombre(), categoria.getDescripcion());
    }
}
