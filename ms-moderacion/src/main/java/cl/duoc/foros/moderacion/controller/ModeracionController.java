package cl.duoc.foros.moderacion.controller;

import cl.duoc.foros.moderacion.dto.PublicacionModeradaResponse;
import cl.duoc.foros.moderacion.dto.ResumenModeracionResponse;
import cl.duoc.foros.moderacion.model.EstadoPublicacion;
import cl.duoc.foros.moderacion.service.ModeracionService;
import java.util.List;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * API de moderación. Todas las rutas exigen rol ADMIN (ver SecurityConfig).
 *
 *  GET /api/moderacion/resumen
 *  GET /api/moderacion/temas?estado=BANEADO        (ACTIVO, ELIMINADO o BANEADO)
 *  GET /api/moderacion/comentarios?estado=BANEADO
 *  PUT /api/moderacion/temas/{id}/banear
 *  PUT /api/moderacion/temas/{id}/restaurar
 *  PUT /api/moderacion/comentarios/{id}/banear
 *  PUT /api/moderacion/comentarios/{id}/restaurar
 */
@RestController
@RequestMapping("/api/moderacion")
public class ModeracionController {

    private final ModeracionService moderacionService;

    public ModeracionController(ModeracionService moderacionService) {
        this.moderacionService = moderacionService;
    }

    @GetMapping("/resumen")
    public ResumenModeracionResponse resumen() {
        return moderacionService.resumen();
    }

    @GetMapping("/temas")
    public List<PublicacionModeradaResponse> temas(
            @RequestParam(defaultValue = "BANEADO") EstadoPublicacion estado) {
        return moderacionService.listarTemas(estado);
    }

    @GetMapping("/comentarios")
    public List<PublicacionModeradaResponse> comentarios(
            @RequestParam(defaultValue = "BANEADO") EstadoPublicacion estado) {
        return moderacionService.listarComentarios(estado);
    }

    @PutMapping("/temas/{id}/banear")
    public PublicacionModeradaResponse banearTema(@PathVariable Long id, Authentication autenticacion) {
        return moderacionService.banearTema(id, autenticacion.getName());
    }

    @PutMapping("/temas/{id}/restaurar")
    public PublicacionModeradaResponse restaurarTema(@PathVariable Long id, Authentication autenticacion) {
        return moderacionService.restaurarTema(id, autenticacion.getName());
    }

    @PutMapping("/comentarios/{id}/banear")
    public PublicacionModeradaResponse banearComentario(@PathVariable Long id, Authentication autenticacion) {
        return moderacionService.banearComentario(id, autenticacion.getName());
    }

    @PutMapping("/comentarios/{id}/restaurar")
    public PublicacionModeradaResponse restaurarComentario(@PathVariable Long id, Authentication autenticacion) {
        return moderacionService.restaurarComentario(id, autenticacion.getName());
    }
}
