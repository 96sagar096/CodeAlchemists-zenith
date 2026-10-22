package org.example.localproblemsolver.config;



import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;

import org.example.localproblemsolver.Service.JwtService;
import org.example.localproblemsolver.dto.Principal;
import org.example.localproblemsolver.entity.Admin;
import org.example.localproblemsolver.entity.User;
import org.example.localproblemsolver.repository.AdminRepository;
import org.example.localproblemsolver.repository.UserRepository;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    private final AdminRepository adminRepository;

    public JwtAuthenticationFilter(
            JwtService jwtService,
            UserRepository userRepository,
            AdminRepository adminRepository
    ) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
        this.adminRepository = adminRepository;
    }

    @Override
    protected void doFilterInternal(
            HttpServletRequest request,
            HttpServletResponse response,
            FilterChain filterChain
    ) throws ServletException, IOException {

        String authorizationHeader =
                request.getHeader("Authorization");

        if (authorizationHeader == null ||
                !authorizationHeader.startsWith("Bearer ")) {

            filterChain.doFilter(request, response);
            return;
        }

        String token = authorizationHeader.substring(7);

        try {



            String role = jwtService.extractRole(token);


            if (SecurityContextHolder.getContext()
                    .getAuthentication() == null) {
                if ("DEPARTMENT_ADMIN".equals(role)) {

                    Long adminId = jwtService.extractId(token);

                    Admin admin = adminRepository
                            .findById(adminId)
                            .orElse(null);

                    if (admin != null &&
                            jwtService.isAdminTokenValid(
                                    token,
                                    admin.getId()
                            )) {

                        Principal principal = new Principal(
                                admin.getId(),
                                admin.getDepartment().getId()
                        );

                        UsernamePasswordAuthenticationToken authentication =
                                new UsernamePasswordAuthenticationToken(
                                        principal,
                                        null,
                                        List.of(
                                                new SimpleGrantedAuthority(
                                                        "ROLE_DEPARTMENT_ADMIN"
                                                )
                                        )
                                );

                        authentication.setDetails(
                                new WebAuthenticationDetailsSource()
                                        .buildDetails(request)
                        );

                        SecurityContextHolder.getContext()
                                .setAuthentication(authentication);

                        System.out.println("ADMIN AUTHENTICATED");
                        System.out.println(
                                "Principal: " +
                                        authentication.getPrincipal()
                        );
                        System.out.println(
                                "Authorities: " +
                                        authentication.getAuthorities()
                        );
                    }
                }

                // =========================
                // NORMAL USER
                // =========================
                else {

                    String email = jwtService.extractEmail(token);

                    if (email != null) {

                        User user = userRepository
                                .findByEmail(email)
                                .orElse(null);

                        if (user != null &&
                                jwtService.isTokenValid(
                                        token,
                                        user.getEmail()
                                )) {

                            UsernamePasswordAuthenticationToken authentication =
                                    new UsernamePasswordAuthenticationToken(
                                            user.getEmail(),
                                            null,
                                            List.of(
                                                    new SimpleGrantedAuthority(
                                                            "ROLE_USER"
                                                    )
                                            )

                                    );

                            authentication.setDetails(
                                    new WebAuthenticationDetailsSource()
                                            .buildDetails(request)
                            );

                            SecurityContextHolder.getContext()
                                    .setAuthentication(authentication);
                        }
                    }
                }
            }

        } catch (Exception exception) {
            System.out.println("JWT authentication failed: "
                    + exception.getMessage());
            exception.printStackTrace();
            // Invalid JWT.
            // Continue the request without authentication.
        }

        filterChain.doFilter(request, response);
    }
}
