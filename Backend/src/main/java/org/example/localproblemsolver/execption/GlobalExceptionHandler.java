package org.example.localproblemsolver.execption;



import org.example.localproblemsolver.dto.ApiResponse;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

@RestControllerAdvice
public class GlobalExceptionHandler {

    @ExceptionHandler(DuplicateEmailException.class)
    public ResponseEntity<ApiResponse> handleDuplicateEmail(
            DuplicateEmailException exception
    ) {

        return ResponseEntity
                .status(HttpStatus.CONFLICT)
                .body(new ApiResponse(
                        false,
                        exception.getMessage()
                ));
    }
    @ExceptionHandler(NotAuthorizeException.class)
    public ResponseEntity<ApiResponse> handleUnauthorizeException(
            NotAuthorizeException exception
    ) {

        return ResponseEntity
                .status(HttpStatus.UNAUTHORIZED)
                .body(new ApiResponse(
                        false,
                        exception.getMessage()
                ));
    }

    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiResponse> handleValidationError(
            MethodArgumentNotValidException exception
    ) {

        String message = exception
                .getBindingResult()
                .getFieldErrors()
                .get(0)
                .getDefaultMessage();

        return ResponseEntity
                .status(HttpStatus.BAD_REQUEST)
                .body(new ApiResponse(
                        false,
                        message
                ));
    }
    @ExceptionHandler(InvalidCredentialsException.class)
    public ResponseEntity<ApiResponse> handleInvalidCredentials(
            InvalidCredentialsException exception ) {
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                        .body(new
                                ApiResponse( false, exception.getMessage() ));
    }
    @ExceptionHandler(AiServiceException.class)
    public ResponseEntity<ApiResponse> handleAiServiceException( AiServiceException exception ) {
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(new ApiResponse( false, exception.getMessage() ));
    }
}