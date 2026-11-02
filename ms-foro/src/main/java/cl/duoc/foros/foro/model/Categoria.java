package cl.duoc.foros.foro.model;

import org.hibernate.annotations.Immutable;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.Table;

/**
 * Categoría de temas. Es un catálogo de solo lectura: se carga con el script SQL.
 */
@Entity
@Immutable
@Table(name = "FOR_CATEGORIA")
public class Categoria {

    @Id
    @Column(name = "ID")
    private Long id;

    @Column(name = "NOMBRE")
    private String nombre;

    @Column(name = "DESCRIPCION")
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
