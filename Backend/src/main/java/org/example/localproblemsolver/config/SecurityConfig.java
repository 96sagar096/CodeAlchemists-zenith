package org.example.localproblemsolver.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

@Configuration

public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

//






        @Bean
        public SecurityFilterChain securityFilterChain(
                HttpSecurity http
        ) throws Exception {
            // We are building a stateless REST API.
            // JWT is used instead of browser sessions.
                    http.csrf(csrf -> csrf.disable())

                    // Don't create or use HTTP sessions for authentication.
                    .sessionManagement(session ->
                            session.sessionCreationPolicy(
                                    SessionCreationPolicy.STATELESS
                            )
                    )

                    // Endpoint authorization rules.
                    .authorizeHttpRequests(auth -> auth
                            .requestMatchers(
                                    "/api/auth/register",
                                    "/api/auth/login" , "/api/admin/login"
                            ).permitAll()


                                            // USER, DEPARTMENT_ADMIN and SUPER_ADMIN
                                            .requestMatchers("/api/test/user" ).hasRole("USER")



                                            // SUPER_ADMIN only
                                            .requestMatchers("/api/test/super-admin")
                                            .hasRole("SUPER_ADMIN")


                            .anyRequest().authenticated()
                    ).exceptionHandling(exception -> exception
                                    .authenticationEntryPoint(
                                            new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED)
                                    )
                            )

                    // Run our JWT filter before Spring's
                    // username/password authentication filter.
                    .addFilterBefore(
                            jwtAuthenticationFilter,
                            UsernamePasswordAuthenticationFilter.class
                    );

            return http.build();
        }

}
