package cl.duoc.foros.foro.security;

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
 * Seguridad del microservicio de foro (misma configuración que ms-usuarios):
 * HTTP Basic, sin sesiones, CSRF desactivado y claves con BCrypt.
 *
 * Leer el foro es público; publicar, modificar y eliminar requiere iniciar sesión.
 * Las reglas que dependen del autor o del rol están en los servicios.
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
                // Lectura pública del foro
                .requestMatchers(HttpMethod.GET, "/api/categorias/**", "/api/temas/**", "/api/comentarios/**")
                    .permitAll()
                // Publicar, modificar y eliminar requiere iniciar sesión
                .anyRequest().authenticated())
            .httpBasic(Customizer.withDefaults());

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
