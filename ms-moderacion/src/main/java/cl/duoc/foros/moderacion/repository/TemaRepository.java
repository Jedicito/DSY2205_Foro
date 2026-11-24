package cl.duoc.foros.moderacion.repository;

import cl.duoc.foros.moderacion.model.EstadoPublicacion;
import cl.duoc.foros.moderacion.model.Tema;
import java.util.List;
import org.springframework.data.jpa.repository.JpaRepository;

public interface TemaRepository extends JpaRepository<Tema, Long> {

    // Temas en un estado, del más reciente al más antiguo
    List<Tema> findByEstadoOrderByIdDesc(EstadoPublicacion estado);

    long countByEstado(EstadoPublicacion estado);
}
