package ${package}.error;

import java.time.LocalDateTime;
import java.util.Map;

import org.springframework.http.HttpStatus;

/**
 * Formato común de todos los errores de la API.
 *
 * Ejemplo:
 * {
 *   "timestamp": "2026-11-02T10:15:30",
 *   "status": 404,
 *   "error": "Not Found",
 *   "mensaje": "No existe un tema con id 99",
 *   "ruta": "/api/temas/99",
 *   "detalles": null
 * }
 *
 * "detalles" solo se llena en errores de validación: campo -> problema.
 */
public record ErrorRespuesta(
        LocalDateTime timestamp,
        int status,
        String error,
        String mensaje,
        String ruta,
        Map<String, String> detalles
) {

    public static ErrorRespuesta de(HttpStatus status, String mensaje, String ruta, Map<String, String> detalles) {
        return new ErrorRespuesta(LocalDateTime.now(), status.value(), status.getReasonPhrase(), mensaje, ruta, detalles);
    }
}
