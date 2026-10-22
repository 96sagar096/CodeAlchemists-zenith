package org.example.localproblemsolver.Service;

import org.example.localproblemsolver.dto.AdminLoginRequest;
import org.example.localproblemsolver.dto.AdminLoginResponse;
import org.example.localproblemsolver.entity.Admin;
import org.example.localproblemsolver.execption.InvalidCredentialsException;
import org.example.localproblemsolver.repository.AdminRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AdminAuthService {
    private final AdminRepository adminRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    public AdminAuthService(AdminRepository adminRepository,
                            PasswordEncoder passwordEncoder,
                            JwtService jwtService){
        this.adminRepository = adminRepository;
        this.jwtService = jwtService;
        this.passwordEncoder = passwordEncoder;
    }

    public AdminLoginResponse login(AdminLoginRequest request) {

        Admin admin = adminRepository.findById(request.getId()).orElseThrow(
                () -> new RuntimeException("Invalid credentials") );
//        boolean passwordMatches = passwordEncoder.matches( request.getPassword(), admin.getPasswordHash());
//        if (!passwordMatches) {
//            throw new InvalidCredentialsException("Invalid credentials");
//        }
        String token = jwtService.generateToken(admin.getId() , admin.getDepartment().getId());
        return new AdminLoginResponse( true, "Login successful", token );
    }

}
