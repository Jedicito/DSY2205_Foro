package ${package}.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;

import ${package}.error.RespuestasSeguridad;

/**
 * Seguridad común de los microservicios del foro:
 * HTTP Basic, sin sesiones, CSRF desactivado y claves con BCrypt.
 * Cada microservicio define qué rutas son públicas y qué rol exige cada una.
 */
@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http, RespuestasSeguridad respuestas) throws Exception {
        http
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(sesion -> sesion.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .authorizeHttpRequests(auth -> auth
                // Página de error interna de Spring (para que los errores lleguen como JSON)
                .requestMatchers("/error").permitAll()
                // Plantilla: todo requiere iniciar sesión. Cada microservicio ajusta sus reglas aquí.
                .anyRequest().authenticated())
            // Errores 401 y 403 con el mismo formato JSON que el resto de la API
            .httpBasic(basic -> basic.authenticationEntryPoint(respuestas))
            .exceptionHandling(errores -> errores
                .authenticationEntryPoint(respuestas)
                .accessDeniedHandler(respuestas));

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }
}
