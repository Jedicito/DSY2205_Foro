package cl.duoc.foros.moderacion.model;

import org.hibernate.annotations.Immutable;
import org.hibernate.type.NumericBooleanConverter;

import jakarta.persistence.Column;
import jakarta.persistence.Convert;
import jakarta.persistence.Entity;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Usuario del foro. Tabla del microservicio de usuarios:
 * aquí solo se lee (@Immutable) para autenticar y para mostrar autores.
 */
@Entity
@Immutable
@Table(name = "USR_USUARIO")
public class Usuario {

    @Id
    @Column(name = "ID")
    private Long id;

    @Column(name = "NOMBRE_USUARIO")
    private String nombreUsuario;

    @Column(name = "PASSWORD_HASH")
    private String passwordHash;

    @Column(name = "NOMBRE_COMPLETO")
    private String nombreCompleto;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "ROL_ID")
    private Rol rol;

    // En Oracle es NUMBER(1): 1 = activo, 0 = deshabilitado
    @Convert(converter = NumericBooleanConverter.class)
    @Column(name = "ACTIVO")
    private boolean activo;

    public Long getId() {
        return id;
    }

    public String getNombreUsuario() {
        return nombreUsuario;
    }

    public String getPasswordHash() {
        return passwordHash;
    }

    public String getNombreCompleto() {
        return nombreCompleto;
    }

    public Rol getRol() {
        return rol;
    }

    public boolean isActivo() {
        return activo;
    }
}
