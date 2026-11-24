package cl.duoc.foros.moderacion.repository;

import cl.duoc.foros.moderacion.model.Comentario;
import cl.duoc.foros.moderacion.model.EstadoPublicacion;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface ComentarioRepository extends JpaRepository<Comentario, Long> {

    // Comentarios en un estado, del más reciente al más antiguo
    List<Comentario> findByEstadoOrderByIdDesc(EstadoPublicacion estado);

    long countByEstado(EstadoPublicacion estado);
}
