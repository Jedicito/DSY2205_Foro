package cl.duoc.foros.foro.service;

import java.time.LocalDateTime;
import java.util.List;

import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import cl.duoc.foros.foro.dto.ComentarioRequest;
import cl.duoc.foros.foro.dto.ComentarioResponse;
import cl.duoc.foros.foro.model.Comentario;
import cl.duoc.foros.foro.model.EstadoPublicacion;
import cl.duoc.foros.foro.model.Usuario;
import cl.duoc.foros.foro.repository.ComentarioRepository;
import cl.duoc.foros.foro.security.UsuarioAutenticado;

/**
 * Reglas de negocio de los comentarios.
 *
 *  - Solo se muestran comentarios ACTIVOS de temas ACTIVOS.
 *  - Cualquier usuario autenticado puede comentar.
 *  - Solo el autor puede modificar su comentario.
 *  - El autor o un ADMIN pueden eliminarlo (queda como ELIMINADO, no se borra).
 */
@Service
public class ComentarioService {

    private static final EstadoPublicacion ACTIVO = EstadoPublicacion.ACTIVO;

    private final ComentarioRepository comentarioRepository;
    private final TemaService temaService;
    private final UsuarioAutenticado usuarioAutenticado;

    public ComentarioService(ComentarioRepository comentarioRepository,
                             TemaService temaService,
                             UsuarioAutenticado usuarioAutenticado) {
        this.comentarioRepository = comentarioRepository;
        this.temaService = temaService;
        this.usuarioAutenticado = usuarioAutenticado;
    }

    @Transactional(readOnly = true)
    public List<ComentarioResponse> listarPorTema(Long temaId) {
        temaService.buscarActivo(temaId);   // 404 si el tema no existe o fue eliminado
        return comentarioRepository.findByTemaIdAndEstadoOrderByFechaCreacionAsc(temaId, ACTIVO).stream()
                .map(ComentarioResponse::desde)
                .toList();
    }

    @Transactional(readOnly = true)
    public ComentarioResponse obtener(Long id) {
        return ComentarioResponse.desde(buscarActivo(id));
    }

    @Transactional
    public ComentarioResponse crear(Long temaId, ComentarioRequest datos, Authentication autenticacion) {
        Comentario comentario = new Comentario();
        comentario.setTema(temaService.buscarActivo(temaId));
        comentario.setAutor(usuarioAutenticado.obtener(autenticacion));
        comentario.setContenido(datos.contenido().trim());
        comentario.setEstado(ACTIVO);
        comentario.setFechaCreacion(LocalDateTime.now());

        return ComentarioResponse.desde(comentarioRepository.save(comentario));
    }

    @Transactional
    public ComentarioResponse actualizar(Long id, ComentarioRequest datos, Authentication autenticacion) {
        Comentario comentario = buscarActivo(id);
        Usuario actual = usuarioAutenticado.obtener(autenticacion);
        if (!esAutor(comentario, actual)) {
            throw new AccessDeniedException("Solo el autor puede modificar este comentario");
        }
        comentario.setContenido(datos.contenido().trim());
        comentario.setFechaModificacion(LocalDateTime.now());

        return ComentarioResponse.desde(comentarioRepository.save(comentario));
    }

    /** Eliminación lógica: el comentario queda ELIMINADO y deja de ser visible. */
    @Transactional
    public ComentarioResponse eliminar(Long id, Authentication autenticacion) {
        Comentario comentario = buscarActivo(id);
        Usuario actual = usuarioAutenticado.obtener(autenticacion);
        if (!esAutor(comentario, actual) && !usuarioAutenticado.esAdmin(autenticacion)) {
            throw new AccessDeniedException("Solo el autor o un administrador pueden eliminar este comentario");
        }
        comentario.setEstado(EstadoPublicacion.ELIMINADO);
        comentario.setFechaModificacion(LocalDateTime.now());

        return ComentarioResponse.desde(comentarioRepository.save(comentario));
    }

    /** Un comentario visible (y de un tema visible); si no, responde 404. */
    private Comentario buscarActivo(Long id) {
        return comentarioRepository.findByIdAndEstado(id, ACTIVO)
                .filter(c -> c.getTema().getEstado() == ACTIVO)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No existe un comentario con id " + id));
    }

    private boolean esAutor(Comentario comentario, Usuario usuario) {
        return comentario.getAutor().getId().equals(usuario.getId());
    }
}
