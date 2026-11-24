package ${package}.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import ${package}.model.Usuario;

/** Solo lectura: la tabla de usuarios pertenece a ms-usuarios. */
public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByNombreUsuario(String nombreUsuario);

    boolean existsByNombreUsuario(String nombreUsuario);
}
