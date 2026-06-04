package com.example.MotoShare.error;

/**
 * Thrown when a requested resource does not exist in the database.
 * Maps to HTTP 404 (Not Found).
 *
 * WHY: Generic RuntimeException makes it impossible for the frontend to distinguish
 * "slot not found" (404) from "slot already booked" (409). With a typed exception,
 * GlobalExceptionHandler can return the correct HTTP status code automatically.
 */
public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String message) {
        super(message);
    }

    public ResourceNotFoundException(String resourceName, Object identifier) {
        super(resourceName + " not found with identifier: " + identifier);
    }
}
