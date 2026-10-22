package org.example.localproblemsolver.controller;


import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/protected")
    public String protectedEndpoint() {
        return "You are authenticated!";
    }

    @GetMapping("/user")
    public String userEndpoint() {
        return "USER access granted!";
    }

//    @PreAuthorize("hasRole('DEPARTMENT_ADMIN')")
    @GetMapping("/department-admin")
    public String departmentAdminEndpoint() {
        return "DEPARTMENT_ADMIN access granted!";
    }

    @GetMapping("/super-admin")
    public String superAdminEndpoint() {
        return "SUPER_ADMIN access granted!";
    }

    @GetMapping("/me")
    public String currentUser() {

        Authentication authentication =
                SecurityContextHolder
                        .getContext()
                        .getAuthentication();

        return "Logged in as: " + authentication.getName();
    }


}


