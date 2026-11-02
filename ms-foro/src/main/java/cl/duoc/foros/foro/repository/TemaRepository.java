package cl.duoc.foros.foro.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cl.duoc.foros.foro.model.EstadoPublicacion;
import cl.duoc.foros.foro.model.Tema;

public interface TemaRepository extends JpaRepository<Tema, Long> {

    // Todos los temas visibles, del más reciente al más antiguo
    List<Tema> findByEstadoOrderByFechaCreacionDesc(EstadoPublicacion estado);

    // Un tema, solo si está en el estado indicado
    Optional<Tema> findByIdAndEstado(Long id, EstadoPublicacion estado);

    // Consulta: temas de una categoría
    List<Tema> findByCategoriaIdAndEstadoOrderByFechaCreacionDesc(Long categoriaId, EstadoPublicacion estado);

    // Consulta: temas de un autor
    List<Tema> findByAutorNombreUsuarioAndEstadoOrderByFechaCreacionDesc(String nombreUsuario,
                                                                        EstadoPublicacion estado);

    // Consulta: búsqueda por palabra clave en título o contenido (sin distinguir mayúsculas)
    @Query("""
            select t from Tema t
            where t.estado = :estado
              and (lower(t.titulo) like lower(concat('%', :texto, '%'))
                   or lower(t.contenido) like lower(concat('%', :texto, '%')))
            order by t.fechaCreacion desc
            """)
    List<Tema> buscarPorTexto(@Param("texto") String texto,
                              @Param("estado") EstadoPublicacion estado);

    // Consulta: ranking de temas con más comentarios visibles.
    // LEFT JOIN para incluir también temas sin comentarios (cuentan 0).
    @Query("""
            select t.id as temaId, count(c.id) as cantidad
            from Tema t
              left join Comentario c on c.tema = t and c.estado = :estado
            where t.estado = :estado
            group by t.id
            order by count(c.id) desc, t.id
            """)
    List<ConteoComentarios> rankingMasComentados(@Param("estado") EstadoPublicacion estado,
                                                 Pageable limite);
}
