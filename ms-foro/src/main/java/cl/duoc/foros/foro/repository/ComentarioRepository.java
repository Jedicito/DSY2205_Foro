package cl.duoc.foros.foro.repository;

import java.util.Collection;
import java.util.List;
import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import cl.duoc.foros.foro.model.Comentario;
import cl.duoc.foros.foro.model.EstadoPublicacion;

public interface ComentarioRepository extends JpaRepository<Comentario, Long> {

    // Comentarios visibles de un tema, del más antiguo al más reciente
    List<Comentario> findByTemaIdAndEstadoOrderByFechaCreacionAsc(Long temaId, EstadoPublicacion estado);

    // Un comentario, solo si está en el estado indicado
    Optional<Comentario> findByIdAndEstado(Long id, EstadoPublicacion estado);

    // Cantidad de comentarios visibles de varios temas en una sola consulta
    @Query("""
            select c.tema.id as temaId, count(c.id) as cantidad
            from Comentario c
            where c.estado = :estado
              and c.tema.id in :temaIds
            group by c.tema.id
            """)
    List<ConteoComentarios> contarPorTemas(@Param("temaIds") Collection<Long> temaIds,
                                           @Param("estado") EstadoPublicacion estado);
}
