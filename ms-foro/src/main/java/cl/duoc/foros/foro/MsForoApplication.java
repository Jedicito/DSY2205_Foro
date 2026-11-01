package cl.duoc.foros.foro;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Microservicio de foro del Sistema de Foros en Línea.
 * Responsable de categorías, temas y comentarios, y de las consultas sobre ellos.
 */
@SpringBootApplication
public class MsForoApplication {

    public static void main(String[] args) {
        SpringApplication.run(MsForoApplication.class, args);
    }
}
