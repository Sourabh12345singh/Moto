package com.example.MotoShare.error;

import io.jsonwebtoken.JwtException;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.orm.ObjectOptimisticLockingFailureException;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.AuthenticationException;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.web.bind.MethodArgumentNotValidException;
import org.springframework.web.bind.annotation.ExceptionHandler;
import org.springframework.web.bind.annotation.RestControllerAdvice;

import java.util.stream.Collectors;

/**
 * Centralized exception-to-HTTP-status mapping.
 *
 * WHY typed exception handlers instead of one generic catch-all?
 * Because the frontend needs different HTTP status codes to decide what to show:
 *   - 400 → "Please fix your input" (validation errors)
 *   - 401 → "Please log in again"
 *   - 403 → "You don't have permission"
 *   - 404 → "This resource doesn't exist"
 *   - 409 → "This action conflicts with current state" (e.g., slot already booked)
 *   - 500 → "Something went wrong on our end"
 *
 * Without this, every error was a vague 500.
 */
@RestControllerAdvice
public class GlobalExceptionHandler {

    // ============ DOMAIN EXCEPTIONS ============

    /**
     * Resource not found → HTTP 404.
     * Examples: Slot not found, User not found, Booking not found.
     */
    @ExceptionHandler(ResourceNotFoundException.class)
    public ResponseEntity<ApiError> handleResourceNotFound(ResourceNotFoundException ex) {
        ApiError apiError = new ApiError(ex.getMessage(), HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(apiError, HttpStatus.NOT_FOUND);
    }

    /**
     * Business rule violation → HTTP 409 (Conflict).
     * Examples: Slot already booked, KYC not approved, cancellation window expired.
     *
     * WHY 409 and not 400?
     * 400 = "your request is malformed" (bad syntax).
     * 409 = "your request is valid, but it conflicts with the current state of the resource."
     * This distinction matters: the frontend can show "This slot was just booked by someone else"
     * instead of a generic "Bad Request."
     */
    @ExceptionHandler(BusinessRuleException.class)
    public ResponseEntity<ApiError> handleBusinessRuleException(BusinessRuleException ex) {
        ApiError apiError = new ApiError(ex.getMessage(), HttpStatus.CONFLICT);
        return new ResponseEntity<>(apiError, HttpStatus.CONFLICT);
    }

    /**
     * Optimistic locking conflict → HTTP 409 (Conflict).
     *
     * WHY handle this separately?
     * When two admins try to update the same user's KYC simultaneously,
     * JPA detects the version mismatch and throws this. We turn it into a
     * user-friendly "someone else modified this, please refresh" instead
     * of a cryptic 500 error with a Hibernate stack trace.
     */
    @ExceptionHandler(ObjectOptimisticLockingFailureException.class)
    public ResponseEntity<ApiError> handleOptimisticLock(ObjectOptimisticLockingFailureException ex) {
        ApiError apiError = new ApiError(
                "This record was modified by another user. Please refresh and try again.",
                HttpStatus.CONFLICT
        );
        return new ResponseEntity<>(apiError, HttpStatus.CONFLICT);
    }

    // ============ VALIDATION EXCEPTIONS ============

    /**
     * Bean Validation failure → HTTP 400 (Bad Request).
     *
     * WHY add this?
     * Without it, sending { "email": "" } to /register returns a 500 with a
     * cryptic Hibernate constraint violation. With this, the user gets a clean
     * 400: "email: must not be blank".
     *
     * This is the "fail-fast" principle: reject bad input at the API boundary,
     * not deep in the database layer.
     */
    @ExceptionHandler(MethodArgumentNotValidException.class)
    public ResponseEntity<ApiError> handleValidation(MethodArgumentNotValidException ex) {
        String errors = ex.getBindingResult().getFieldErrors().stream()
                .map(fe -> fe.getField() + ": " + fe.getDefaultMessage())
                .collect(Collectors.joining("; "));
        ApiError apiError = new ApiError(errors, HttpStatus.BAD_REQUEST);
        return new ResponseEntity<>(apiError, HttpStatus.BAD_REQUEST);
    }

    // ============ SECURITY EXCEPTIONS ============

    @ExceptionHandler(UsernameNotFoundException.class)
    public ResponseEntity<ApiError> handleUsernameNotFoundException(UsernameNotFoundException ex) {
        ApiError apiError = new ApiError("Username not found with username: "+ex.getMessage(), HttpStatus.NOT_FOUND);
        return new ResponseEntity<>(apiError, apiError.getStatusCode());
    }

    @ExceptionHandler(AuthenticationException.class)
    public ResponseEntity<ApiError> handleAuthenticationException(AuthenticationException ex) {
        ApiError apiError = new ApiError("Authentication failed: " + ex.getMessage(), HttpStatus.UNAUTHORIZED);
        return new ResponseEntity<>(apiError, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(JwtException.class)
    public ResponseEntity<ApiError> handleJwtException(JwtException ex) {
        ApiError apiError = new ApiError("Invalid JWT token: " + ex.getMessage(), HttpStatus.UNAUTHORIZED);
        return new ResponseEntity<>(apiError, HttpStatus.UNAUTHORIZED);
    }

    @ExceptionHandler(AccessDeniedException.class)
    public ResponseEntity<ApiError> handleAccessDeniedException(AccessDeniedException ex) {
        ApiError apiError = new ApiError("Access denied: Insufficient permissions", HttpStatus.FORBIDDEN);
        return new ResponseEntity<>(apiError, HttpStatus.FORBIDDEN);
    }

    // ============ CATCH-ALL ============

    @ExceptionHandler(Exception.class)
    public ResponseEntity<ApiError> handleGenericException(Exception ex) {
        ApiError apiError = new ApiError("An unexpected error occurred: " + ex.getMessage(), HttpStatus.INTERNAL_SERVER_ERROR);
        return new ResponseEntity<>(apiError, HttpStatus.INTERNAL_SERVER_ERROR);
    }
}
