package cl.duoc.foros.moderacion.service;

import cl.duoc.foros.moderacion.dto.PublicacionModeradaResponse;
import cl.duoc.foros.moderacion.dto.ResumenModeracionResponse;
import cl.duoc.foros.moderacion.model.Comentario;
import cl.duoc.foros.moderacion.model.EstadoPublicacion;
import cl.duoc.foros.moderacion.model.Tema;
import cl.duoc.foros.moderacion.repository.ComentarioRepository;
import cl.duoc.foros.moderacion.repository.TemaRepository;
import java.time.LocalDateTime;
import java.util.List;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

/**
 * Reglas de moderación:
 *  - Solo se banea lo que está ACTIVO (lo ELIMINADO ya no es visible).
 *  - Solo se restaura lo que está BANEADO.
 *  - Nada se borra de la base: solo cambia el estado.
 */
@Service
public class ModeracionService {

    private static final Logger log = LoggerFactory.getLogger(ModeracionService.class);

    private final TemaRepository temaRepository;
    private final ComentarioRepository comentarioRepository;

    public ModeracionService(TemaRepository temaRepository, ComentarioRepository comentarioRepository) {
        this.temaRepository = temaRepository;
        this.comentarioRepository = comentarioRepository;
    }

    @Transactional(readOnly = true)
    public List<PublicacionModeradaResponse> listarTemas(EstadoPublicacion estado) {
        return temaRepository.findByEstadoOrderByIdDesc(estado).stream()
                .map(PublicacionModeradaResponse::desde)
                .toList();
    }

    @Transactional(readOnly = true)
    public List<PublicacionModeradaResponse> listarComentarios(EstadoPublicacion estado) {
        return comentarioRepository.findByEstadoOrderByIdDesc(estado).stream()
                .map(PublicacionModeradaResponse::desde)
                .toList();
    }

    @Transactional
    public PublicacionModeradaResponse banearTema(Long id, String admin) {
        Tema tema = buscarTema(id);
        exigirEstado(tema.getEstado(), EstadoPublicacion.ACTIVO, "el tema", "banear");
        tema.setEstado(EstadoPublicacion.BANEADO);
        tema.setFechaModificacion(LocalDateTime.now());
        log.info("Tema {} baneado por {}", id, admin);
        return PublicacionModeradaResponse.desde(temaRepository.save(tema));
    }

    @Transactional
    public PublicacionModeradaResponse restaurarTema(Long id, String admin) {
        Tema tema = buscarTema(id);
        exigirEstado(tema.getEstado(), EstadoPublicacion.BANEADO, "el tema", "restaurar");
        tema.setEstado(EstadoPublicacion.ACTIVO);
        tema.setFechaModificacion(LocalDateTime.now());
        log.info("Tema {} restaurado por {}", id, admin);
        return PublicacionModeradaResponse.desde(temaRepository.save(tema));
    }

    @Transactional
    public PublicacionModeradaResponse banearComentario(Long id, String admin) {
        Comentario comentario = buscarComentario(id);
        exigirEstado(comentario.getEstado(), EstadoPublicacion.ACTIVO, "el comentario", "banear");
        comentario.setEstado(EstadoPublicacion.BANEADO);
        comentario.setFechaModificacion(LocalDateTime.now());
        log.info("Comentario {} baneado por {}", id, admin);
        return PublicacionModeradaResponse.desde(comentarioRepository.save(comentario));
    }

    @Transactional
    public PublicacionModeradaResponse restaurarComentario(Long id, String admin) {
        Comentario comentario = buscarComentario(id);
        exigirEstado(comentario.getEstado(), EstadoPublicacion.BANEADO, "el comentario", "restaurar");
        comentario.setEstado(EstadoPublicacion.ACTIVO);
        comentario.setFechaModificacion(LocalDateTime.now());
        log.info("Comentario {} restaurado por {}", id, admin);
        return PublicacionModeradaResponse.desde(comentarioRepository.save(comentario));
    }

    @Transactional(readOnly = true)
    public ResumenModeracionResponse resumen() {
        return new ResumenModeracionResponse(
                temaRepository.countByEstado(EstadoPublicacion.ACTIVO),
                temaRepository.countByEstado(EstadoPublicacion.BANEADO),
                comentarioRepository.countByEstado(EstadoPublicacion.ACTIVO),
                comentarioRepository.countByEstado(EstadoPublicacion.BANEADO));
    }

    private Tema buscarTema(Long id) {
        return temaRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND, "No existe un tema con id " + id));
    }

    private Comentario buscarComentario(Long id) {
        return comentarioRepository.findById(id)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No existe un comentario con id " + id));
    }

    private void exigirEstado(EstadoPublicacion actual, EstadoPublicacion esperado, String que, String accion) {
        if (actual != esperado) {
            throw new ResponseStatusException(HttpStatus.CONFLICT,
                    "No se puede " + accion + " " + que + ": su estado es " + actual + " y debe ser " + esperado);
        }
    }
}
