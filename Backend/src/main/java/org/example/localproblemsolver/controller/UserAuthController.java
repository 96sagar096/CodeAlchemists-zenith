package org.example.localproblemsolver.controller;


import jakarta.validation.Valid;

import org.example.localproblemsolver.Service.UserAuthService;
import org.example.localproblemsolver.dto.*;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
@CrossOrigin("*")
public class UserAuthController {

    private final UserAuthService userAuthService;

    public UserAuthController(UserAuthService userAuthService) {
        this.userAuthService = userAuthService;
    }

    @PostMapping("/register")
    public ResponseEntity<RegisterResponse> register(
            @Valid @RequestBody RegisterRequest request
    ) {

         RegisterResponse registerResponse = userAuthService.register(request);


        return ResponseEntity
                .status(HttpStatus.CREATED)
                .body(registerResponse
                );
    }
    @PostMapping("/login")
    public ResponseEntity<LoginResponse> login(
            @Valid @RequestBody LoginRequest request ) {

        LoginResponse response = userAuthService.login(request);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/test")
    public boolean test() {
        return true;
    }
}
