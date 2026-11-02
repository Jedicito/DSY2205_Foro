package cl.duoc.foros.foro.model;

import java.time.LocalDateTime;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import jakarta.persistence.FetchType;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

/**
 * Comentario de un tema. Nunca se borra de la base: se marca como ELIMINADO.
 */
@Entity
@Table(name = "FOR_COMENTARIO")
public class Comentario {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "ID")
    private Long id;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "TEMA_ID", nullable = false, updatable = false)
    private Tema tema;

    @ManyToOne(fetch = FetchType.EAGER, optional = false)
    @JoinColumn(name = "AUTOR_ID", nullable = false, updatable = false)
    private Usuario autor;

    @Column(name = "CONTENIDO", nullable = false, length = 2000)
    private String contenido;

    @Enumerated(EnumType.STRING)
    @Column(name = "ESTADO", nullable = false, length = 10)
    private EstadoPublicacion estado = EstadoPublicacion.ACTIVO;

    @Column(name = "FECHA_CREACION", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;

    @Column(name = "FECHA_MODIFICACION")
    private LocalDateTime fechaModificacion;

    public Long getId() {
        return id;
    }

    public Tema getTema() {
        return tema;
    }

    public void setTema(Tema tema) {
        this.tema = tema;
    }

    public Usuario getAutor() {
        return autor;
    }

    public void setAutor(Usuario autor) {
        this.autor = autor;
    }

    public String getContenido() {
        return contenido;
    }

    public void setContenido(String contenido) {
        this.contenido = contenido;
    }

    public EstadoPublicacion getEstado() {
        return estado;
    }

    public void setEstado(EstadoPublicacion estado) {
        this.estado = estado;
    }

    public LocalDateTime getFechaCreacion() {
        return fechaCreacion;
    }

    public void setFechaCreacion(LocalDateTime fechaCreacion) {
        this.fechaCreacion = fechaCreacion;
    }

    public LocalDateTime getFechaModificacion() {
        return fechaModificacion;
    }

    public void setFechaModificacion(LocalDateTime fechaModificacion) {
        this.fechaModificacion = fechaModificacion;
    }
}
