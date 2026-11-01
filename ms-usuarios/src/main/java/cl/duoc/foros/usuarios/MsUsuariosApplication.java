package cl.duoc.foros.usuarios;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Microservicio de usuarios del Sistema de Foros en Línea.
 * Responsable del registro, modificación, deshabilitación y login de usuarios.
 */
@SpringBootApplication
public class MsUsuariosApplication {

    public static void main(String[] args) {
        SpringApplication.run(MsUsuariosApplication.class, args);
    }
}
