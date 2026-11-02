package cl.duoc.foros.foro.repository;

/**
 * Resultado de las consultas que cuentan comentarios por tema
 * (proyección de Spring Data: los alias de la consulta llenan estos métodos).
 */
public interface ConteoComentarios {

    Long getTemaId();

    Long getCantidad();
}
