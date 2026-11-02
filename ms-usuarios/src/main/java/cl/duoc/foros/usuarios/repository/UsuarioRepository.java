package cl.duoc.foros.usuarios.repository;

import java.util.Optional;

import org.springframework.data.jpa.repository.JpaRepository;

import cl.duoc.foros.usuarios.model.Usuario;

public interface UsuarioRepository extends JpaRepository<Usuario, Long> {

    Optional<Usuario> findByNombreUsuario(String nombreUsuario);

    boolean existsByNombreUsuario(String nombreUsuario);

    boolean existsByEmail(String email);

    // Para validar que el email no lo use OTRO usuario al modificar
    boolean existsByEmailAndIdNot(String email, Long id);
}
