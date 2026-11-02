package cl.duoc.foros.foro.error;

import java.util.LinkedHashMap;
import java.util.Map;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.http.converter.HttpMessageNotReadableException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.HttpMediaTypeNotSupportedException;
import org.springframework.web.HttpRequestMethodNotSupportedException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.MissingServletRequestParameterException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;
import org.springframework.web.method.annotation.MethodArgumentTypeMismatchException;
import org.springframework.web.server.ResponseStatusException;
import org.springframework.web.servlet.resource.NoResourceFoundException;

import jakarta.servlet.http.HttpServletRequest;

/**
 * Manejo global de excepciones: todos los controladores responden sus
 * errores con el mismo formato JSON (ErrorRespuesta).
 */
@RestControllerAdvice
public class ManejadorErrores {

    private static final Logger log = LoggerFactory.getLogger(ManejadorErrores.class);

    /** Errores de negocio lanzados por los servicios (404, 409, 400...). */
    @ExceptionHandler(ResponseStatusException.class)
    public ResponseEntity<ErrorRespuesta> errorDeNegocio(ResponseStatusException ex, HttpServletRequest peticion) {
        HttpStatus status = HttpStatus.valueOf(ex.getStatusCode().value());
        String mensaje = ex.getReason() != null ? ex.getReason() : status.getReasonPhrase();
        return responder(status, mensaje, peticion, null);
    }

    /** Datos del JSON que no cumplen las validaciones (@Valid). */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ErrorRespuesta> validacion(MethodArgumentNotValidException ex, HttpServletRequest peticion) {
        Map<String, String> detalles = new LinkedHashMap<>();
        ex.getBindingResult().getFieldErrors()
                .forEach(e -> detalles.putIfAbsent(e.getField(), e.getDefaultMessage()));
        return responder(HttpStatus.BAD_REQUEST, "Los datos enviados no son válidos", peticion, detalles);
    }

    /** Sin permisos para la acción (por ejemplo, modificar algo ajeno). */
    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ErrorRespuesta> sinPermiso(AccessDeniedException ex, HttpServletRequest peticion) {
        return responder(HttpStatus.FORBIDDEN, ex.getMessage(), peticion, null);
    }

    @ExceptionHandler(HttpMessageNotReadableException.class)
    public ResponseEntity<ErrorRespuesta> jsonInvalido(HttpMessageNotReadableException ex, HttpServletRequest peticion) {
        return responder(HttpStatus.BAD_REQUEST,
                "El cuerpo de la petición no es un JSON válido o tiene valores de tipo incorrecto", peticion, null);
    }

    @ExceptionHandler(MissingServletRequestParameterException.class)
    public ResponseEntity<ErrorRespuesta> faltaParametro(MissingServletRequestParameterException ex,
                                                         HttpServletRequest peticion) {
        return responder(HttpStatus.BAD_REQUEST,
                "Falta el parámetro '" + ex.getParameterName() + "'", peticion, null);
    }

    @ExceptionHandler(MethodArgumentTypeMismatchException.class)
    public ResponseEntity<ErrorRespuesta> tipoIncorrecto(MethodArgumentTypeMismatchException ex,
                                                         HttpServletRequest peticion) {
        return responder(HttpStatus.BAD_REQUEST,
                "El valor '" + ex.getValue() + "' no es válido para '" + ex.getName() + "'", peticion, null);
    }

    @ExceptionHandler(NoResourceFoundException.class)
    public ResponseEntity<ErrorRespuesta> rutaInexistente(NoResourceFoundException ex, HttpServletRequest peticion) {
        return responder(HttpStatus.NOT_FOUND, "La ruta solicitada no existe", peticion, null);
    }

    @ExceptionHandler(HttpRequestMethodNotSupportedException.class)
    public ResponseEntity<ErrorRespuesta> metodoNoPermitido(HttpRequestMethodNotSupportedException ex,
                                                            HttpServletRequest peticion) {
        return responder(HttpStatus.METHOD_NOT_ALLOWED,
                "El método " + ex.getMethod() + " no está permitido en esta ruta", peticion, null);
    }

    @ExceptionHandler(HttpMediaTypeNotSupportedException.class)
    public ResponseEntity<ErrorRespuesta> formatoNoSoportado(HttpMediaTypeNotSupportedException ex,
                                                             HttpServletRequest peticion) {
        return responder(HttpStatus.UNSUPPORTED_MEDIA_TYPE,
                "El cuerpo de la petición debe enviarse como JSON", peticion, null);
    }

    /** Restricción de la base de datos (por ejemplo, un valor único repetido). */
    @ExceptionHandler(DataIntegrityViolationException.class)
    public ResponseEntity<ErrorRespuesta> restriccionBaseDatos(DataIntegrityViolationException ex,
                                                               HttpServletRequest peticion) {
        log.warn("Restricción de base de datos en {}: {}", peticion.getRequestURI(), ex.getMostSpecificCause().getMessage());
        return responder(HttpStatus.CONFLICT,
                "La operación no cumple una restricción de la base de datos", peticion, null);
    }

    /** Cualquier otro error: se registra en el log y no se exponen detalles internos. */
    @ExceptionHandler(Exception.class)
    public ResponseEntity<ErrorRespuesta> errorInesperado(Exception ex, HttpServletRequest peticion) {
        log.error("Error inesperado en {} {}", peticion.getMethod(), peticion.getRequestURI(), ex);
        return responder(HttpStatus.INTERNAL_SERVER_ERROR, "Ocurrió un error inesperado", peticion, null);
    }

    private ResponseEntity<ErrorRespuesta> responder(HttpStatus status, String mensaje,
                                                     HttpServletRequest peticion, Map<String, String> detalles) {
        return ResponseEntity.status(status)
                .body(ErrorRespuesta.de(status, mensaje, peticion.getRequestURI(), detalles));
    }
}
