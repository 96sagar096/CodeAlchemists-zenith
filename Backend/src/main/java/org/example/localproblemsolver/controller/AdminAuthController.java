package org.example.localproblemsolver.controller;

import jakarta.validation.Valid;
import org.example.localproblemsolver.Service.AdminAuthService;

import org.example.localproblemsolver.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/admin")
@CrossOrigin("*")
public class AdminAuthController {
    private final AdminAuthService adminAuthService;

    public AdminAuthController(AdminAuthService adminAuthService) {
        this.adminAuthService = adminAuthService;
    }


    @PostMapping("/login")
    public ResponseEntity<AdminLoginResponse> login(
            @Valid @RequestBody AdminLoginRequest request ) {

        AdminLoginResponse response = adminAuthService.login(request);
        return ResponseEntity.ok(response);

    }

}
