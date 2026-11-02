package cl.duoc.foros.usuarios.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Rol de un usuario (USUARIO o ADMIN).
 * Es un catálogo de solo lectura: se carga con el script SQL.
 */
@Entity
@Table(name = "USR_ROL")
public class Rol {

    public static final String USUARIO = "USUARIO";
    public static final String ADMIN = "ADMIN";

    @Id
    @Column(name = "ID")
    private Long id;

    @Column(name = "NOMBRE", nullable = false, length = 20)
    private String nombre;

    @Column(name = "DESCRIPCION", nullable = false, length = 255)
    private String descripcion;

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }

    public String getDescripcion() {
        return descripcion;
    }
}
