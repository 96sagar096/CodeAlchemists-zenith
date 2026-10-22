package org.example.localproblemsolver.Service;



import org.example.localproblemsolver.dto.RegisterResponse;
import org.example.localproblemsolver.execption.InvalidCredentialsException;
import org.example.localproblemsolver.dto.LoginRequest;
import org.example.localproblemsolver.dto.LoginResponse;
import org.example.localproblemsolver.dto.RegisterRequest;
import org.example.localproblemsolver.entity.User;
import org.example.localproblemsolver.entity.UserRole;
import org.example.localproblemsolver.execption.DuplicateEmailException;
import org.example.localproblemsolver.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class UserAuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;

    public UserAuthService(
            UserRepository userRepository,
            PasswordEncoder passwordEncoder,
            JwtService jwtService

    ) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
    }

    public RegisterResponse register(RegisterRequest request) {

        if (userRepository.findByEmail(request.getEmail()).isPresent()) {
            throw new DuplicateEmailException("Email is already registered");
        }

        String passwordHash =
                passwordEncoder.encode(request.getPassword());

        User user = new User(
                request.getName(),
                request.getEmail(),
                passwordHash,
                UserRole.USER
        );

        userRepository.save(user);
        String token = jwtService.generateUserToken(request.getEmail());
        return new RegisterResponse(request.getName() , token , true);
    }
    public LoginResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.getEmail()).orElseThrow(
                () -> new RuntimeException("Invalid email or password") );
        boolean passwordMatches = passwordEncoder.matches( request.getPassword(), user.getPasswordHash() );
        if (!passwordMatches) {
            throw new InvalidCredentialsException("Invalid email or password");
        }
        String token = jwtService.generateUserToken(user.getEmail());
        return new LoginResponse( true, "Login successful", token );
    }
}
