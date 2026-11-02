package cl.duoc.foros.foro.service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Locale;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

import org.springframework.data.domain.PageRequest;
import org.springframework.http.HttpStatus;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.Authentication;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.server.ResponseStatusException;

import cl.duoc.foros.foro.dto.ActualizarTemaRequest;
import cl.duoc.foros.foro.dto.CrearTemaRequest;
import cl.duoc.foros.foro.dto.TemaResponse;
import cl.duoc.foros.foro.model.EstadoPublicacion;
import cl.duoc.foros.foro.model.Tema;
import cl.duoc.foros.foro.model.Usuario;
import cl.duoc.foros.foro.repository.ComentarioRepository;
import cl.duoc.foros.foro.repository.ConteoComentarios;
import cl.duoc.foros.foro.repository.TemaRepository;
import cl.duoc.foros.foro.repository.UsuarioRepository;
import cl.duoc.foros.foro.security.UsuarioAutenticado;

/**
 * Reglas de negocio de los temas.
 *
 *  - Solo se muestran temas ACTIVOS; uno eliminado responde 404.
 *  - Cualquier usuario autenticado puede publicar.
 *  - Solo el autor puede modificar su tema.
 *  - El autor o un ADMIN pueden eliminarlo (queda como ELIMINADO, no se borra).
 */
@Service
public class TemaService {

    private static final EstadoPublicacion ACTIVO = EstadoPublicacion.ACTIVO;
    private static final int LIMITE_MAXIMO_RANKING = 20;

    private final TemaRepository temaRepository;
    private final ComentarioRepository comentarioRepository;
    private final UsuarioRepository usuarioRepository;
    private final CategoriaService categoriaService;
    private final UsuarioAutenticado usuarioAutenticado;

    public TemaService(TemaRepository temaRepository,
                       ComentarioRepository comentarioRepository,
                       UsuarioRepository usuarioRepository,
                       CategoriaService categoriaService,
                       UsuarioAutenticado usuarioAutenticado) {
        this.temaRepository = temaRepository;
        this.comentarioRepository = comentarioRepository;
        this.usuarioRepository = usuarioRepository;
        this.categoriaService = categoriaService;
        this.usuarioAutenticado = usuarioAutenticado;
    }

    // ------------------------------------------------------------------
    // Lectura
    // ------------------------------------------------------------------
    @Transactional(readOnly = true)
    public List<TemaResponse> listar() {
        return aRespuestas(temaRepository.findByEstadoOrderByFechaCreacionDesc(ACTIVO));
    }

    @Transactional(readOnly = true)
    public TemaResponse obtener(Long id) {
        return aRespuestas(List.of(buscarActivo(id))).get(0);
    }

    // ------------------------------------------------------------------
    // Consultas
    // ------------------------------------------------------------------

    /** Temas de una categoría. */
    @Transactional(readOnly = true)
    public List<TemaResponse> listarPorCategoria(Long categoriaId) {
        categoriaService.buscar(categoriaId);   // 404 si la categoría no existe
        return aRespuestas(temaRepository.findByCategoriaIdAndEstadoOrderByFechaCreacionDesc(categoriaId, ACTIVO));
    }

    /** Temas publicados por un usuario. */
    @Transactional(readOnly = true)
    public List<TemaResponse> listarPorAutor(String nombreUsuario) {
        String nombre = nombreUsuario.trim().toLowerCase(Locale.ROOT);
        if (!usuarioRepository.existsByNombreUsuario(nombre)) {
            throw new ResponseStatusException(HttpStatus.NOT_FOUND, "No existe el usuario '" + nombre + "'");
        }
        return aRespuestas(temaRepository.findByAutorNombreUsuarioAndEstadoOrderByFechaCreacionDesc(nombre, ACTIVO));
    }

    /** Búsqueda por palabra clave en el título o el contenido. */
    @Transactional(readOnly = true)
    public List<TemaResponse> buscar(String texto) {
        String limpio = texto == null ? "" : texto.trim();
        if (limpio.length() < 2) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El texto a buscar debe tener al menos 2 caracteres");
        }
        return aRespuestas(temaRepository.buscarPorTexto(limpio, ACTIVO));
    }

    /** Ranking de los temas con más comentarios. */
    @Transactional(readOnly = true)
    public List<TemaResponse> masComentados(int limite) {
        if (limite < 1 || limite > LIMITE_MAXIMO_RANKING) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "El límite debe estar entre 1 y " + LIMITE_MAXIMO_RANKING);
        }
        List<ConteoComentarios> ranking =
                temaRepository.rankingMasComentados(ACTIVO, PageRequest.of(0, limite));

        Map<Long, Tema> temasPorId = temaRepository
                .findAllById(ranking.stream().map(ConteoComentarios::getTemaId).toList())
                .stream()
                .collect(Collectors.toMap(Tema::getId, Function.identity()));

        // Se respeta el orden del ranking
        return ranking.stream()
                .map(fila -> TemaResponse.desde(temasPorId.get(fila.getTemaId()), fila.getCantidad()))
                .toList();
    }

    // ------------------------------------------------------------------
    // Escritura
    // ------------------------------------------------------------------
    @Transactional
    public TemaResponse crear(CrearTemaRequest datos, Authentication autenticacion) {
        Tema tema = new Tema();
        tema.setTitulo(datos.titulo().trim());
        tema.setContenido(datos.contenido().trim());
        tema.setCategoria(categoriaService.buscar(datos.categoriaId()));
        tema.setAutor(usuarioAutenticado.obtener(autenticacion));
        tema.setEstado(ACTIVO);
        tema.setFechaCreacion(LocalDateTime.now());

        return TemaResponse.desde(temaRepository.save(tema), 0);
    }

    @Transactional
    public TemaResponse actualizar(Long id, ActualizarTemaRequest datos, Authentication autenticacion) {
        if (datos.estaVacio()) {
            throw new ResponseStatusException(HttpStatus.BAD_REQUEST,
                    "Debes enviar al menos un campo para modificar");
        }
        Tema tema = buscarActivo(id);
        Usuario actual = usuarioAutenticado.obtener(autenticacion);
        if (!esAutor(tema, actual)) {
            throw new AccessDeniedException("Solo el autor puede modificar este tema");
        }

        if (datos.titulo() != null) {
            tema.setTitulo(datos.titulo().trim());
        }
        if (datos.contenido() != null) {
            tema.setContenido(datos.contenido().trim());
        }
        if (datos.categoriaId() != null) {
            tema.setCategoria(categoriaService.buscar(datos.categoriaId()));
        }
        tema.setFechaModificacion(LocalDateTime.now());

        return aRespuestas(List.of(temaRepository.save(tema))).get(0);
    }

    /** Eliminación lógica: el tema queda ELIMINADO y deja de ser visible. */
    @Transactional
    public TemaResponse eliminar(Long id, Authentication autenticacion) {
        Tema tema = buscarActivo(id);
        Usuario actual = usuarioAutenticado.obtener(autenticacion);
        if (!esAutor(tema, actual) && !usuarioAutenticado.esAdmin(autenticacion)) {
            throw new AccessDeniedException("Solo el autor o un administrador pueden eliminar este tema");
        }
        tema.setEstado(EstadoPublicacion.ELIMINADO);
        tema.setFechaModificacion(LocalDateTime.now());

        return TemaResponse.desde(temaRepository.save(tema), 0);
    }

    // ------------------------------------------------------------------
    // Apoyo
    // ------------------------------------------------------------------

    /** Un tema visible; si no existe o fue eliminado, responde 404. */
    public Tema buscarActivo(Long id) {
        return temaRepository.findByIdAndEstado(id, ACTIVO)
                .orElseThrow(() -> new ResponseStatusException(HttpStatus.NOT_FOUND,
                        "No existe un tema con id " + id));
    }

    private boolean esAutor(Tema tema, Usuario usuario) {
        return tema.getAutor().getId().equals(usuario.getId());
    }

    /** Convierte temas a JSON contando sus comentarios visibles con una sola consulta. */
    private List<TemaResponse> aRespuestas(List<Tema> temas) {
        if (temas.isEmpty()) {
            return List.of();
        }
        Map<Long, Long> conteos = comentarioRepository
                .contarPorTemas(temas.stream().map(Tema::getId).toList(), ACTIVO)
                .stream()
                .collect(Collectors.toMap(ConteoComentarios::getTemaId, ConteoComentarios::getCantidad));

        return temas.stream()
                .map(t -> TemaResponse.desde(t, conteos.getOrDefault(t.getId(), 0L)))
                .toList();
    }
}
