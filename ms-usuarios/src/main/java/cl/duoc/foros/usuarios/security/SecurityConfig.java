package cl.duoc.foros.usuarios.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

/**
 * Seguridad del microservicio:
 *  - Autenticación HTTP Basic (usuario y clave en cada petición).
 *  - Sin sesiones: cada petición se autentica por sí sola.
 *  - CSRF desactivado: es una API REST sin formularios ni cookies de sesión.
 *  - Claves almacenadas con BCrypt.
 *
 * Las reglas por URL cubren lo que depende solo del rol. Las reglas que
 * dependen del dueño del recurso ("solo tu propia cuenta") están en
 * UsuarioService.
 */
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(sesion -> sesion.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Página de error interna de Spring (para que los errores lleguen como JSON)
                .requestMatchers("/error").permitAll()
                // Registro de usuarios: abierto a cualquiera
                .requestMatchers(HttpMethod.POST, "/api/usuarios").permitAll()
                // Solo ADMIN: listar y deshabilitar usuarios
                .requestMatchers(HttpMethod.GET, "/api/usuarios").hasRole("ADMIN")
                .requestMatchers(HttpMethod.DELETE, "/api/usuarios/**").hasRole("ADMIN")
                // Todo lo demás requiere iniciar sesión
                .anyRequest().authenticated())
            .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
