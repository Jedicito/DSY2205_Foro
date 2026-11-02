package cl.duoc.foros.foro.repository;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.duoc.foros.foro.model.Categoria;

/** Solo lectura: las categorías se cargan con el script SQL. */
public interface CategoriaRepository extends JpaRepository<Categoria, Long> {
}
