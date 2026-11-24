package ${package}.model;

import org.hibernate.annotations.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Rol de un usuario. Tabla del microservicio de usuarios:
 * aquí solo se lee (@Immutable), nunca se modifica.
 */
@Entity
@Immutable
@Table(name = "USR_ROL")
public class Rol {

    public static final String ADMIN = "ADMIN";

    @Id
    @Column(name = "ID")
    private Long id;

    @Column(name = "NOMBRE")
    private String nombre;

    public Long getId() {
        return id;
    }

    public String getNombre() {
        return nombre;
    }
}
