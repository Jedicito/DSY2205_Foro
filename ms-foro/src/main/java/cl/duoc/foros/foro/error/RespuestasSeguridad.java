package cl.duoc.foros.foro.error;

import java.io.IOException;

import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.web.AuthenticationEntryPoint;
import org.springframework.security.web.access.AccessDeniedHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import tools.jackson.databind.ObjectMapper;

/**
 * Errores que Spring Security responde antes de llegar a los controladores
 * (credenciales inválidas, usuario deshabilitado, rol insuficiente),
 * con el mismo formato JSON que el resto de la API.
 */
@Component
public class RespuestasSeguridad implements AuthenticationEntryPoint, AccessDeniedHandler {

    private final ObjectMapper objectMapper;

    public RespuestasSeguridad(ObjectMapper objectMapper) {
        this.objectMapper = objectMapper;
    }

    /** 401: no se pudo autenticar. */
    @Override
    public void commence(HttpServletRequest peticion, HttpServletResponse respuesta,
                         AuthenticationException ex) throws IOException {
        String mensaje;
        if (ex instanceof DisabledException) {
            mensaje = "El usuario está deshabilitado";
        } else if (ex instanceof BadCredentialsException) {
            mensaje = "Usuario o clave incorrectos";
        } else {
            mensaje = "Debes iniciar sesión (HTTP Basic) para usar este recurso";
        }
        respuesta.setHeader("WWW-Authenticate", "Basic realm=\"Foros en Linea\"");
        escribir(respuesta, HttpStatus.UNAUTHORIZED, mensaje, peticion);
    }

    /** 403: autenticado, pero su rol no tiene permiso. */
    @Override
    public void handle(HttpServletRequest peticion, HttpServletResponse respuesta,
                       AccessDeniedException ex) throws IOException {
        escribir(respuesta, HttpStatus.FORBIDDEN, "Tu rol no tiene permiso para realizar esta acción", peticion);
    }

    private void escribir(HttpServletResponse respuesta, HttpStatus status, String mensaje,
                          HttpServletRequest peticion) throws IOException {
        respuesta.setStatus(status.value());
        respuesta.setContentType(MediaType.APPLICATION_JSON_VALUE);
        respuesta.setCharacterEncoding("UTF-8");
        respuesta.getWriter().write(objectMapper.writeValueAsString(
                ErrorRespuesta.de(status, mensaje, peticion.getRequestURI(), null)));
    }
}
