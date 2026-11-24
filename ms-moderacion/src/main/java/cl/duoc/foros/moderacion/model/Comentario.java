package cl.duoc.foros.moderacion.model;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;
import java.time.LocalDateTime;

/**
 * Comentario del foro (tabla de ms-foro). Moderación solo cambia su estado.
 */
@Entity
@Table(name = "FOR_COMENTARIO")
public class Comentario {

    @Id
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "TEMA_ID", insertable = false, updatable = false)
    private Tema tema;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "AUTOR_ID", insertable = false, updatable = false)
    private Usuario autor;

    @Column(name = "CONTENIDO", insertable = false, updatable = false)
    private String contenido;

    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO", nullable = false, length = 10)
    private EstadoPublicacion estado;

    @Column(name = "FECHA_MODIFICACION")
    private LocalDateTime fechaModificacion;

    public Long getId() {
        return id;
    }

    public Tema getTema() {
        return tema;
    }

    public Usuario getAutor() {
        return autor;
    }

    public String getContenido() {
        return contenido;
    }

    public EstadoPublicacion getEstado() {
        return estado;
    }

    public void setEstado(EstadoPublicacion estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaModificacion() {
        return fechaModificacion;
    }

    public void setFechaModificacion(LocalDateTime fechaModificacion) {
        this.fechaModificacion = fechaModificacion;
    }
}
