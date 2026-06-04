package com.example.MotoShare.error;

/**
 * Thrown when a business rule or domain invariant is violated.
 * Maps to HTTP 409 (Conflict).
 *
 * WHY: Business rules like "slot already booked", "KYC not approved",
 * "cancellation window expired" are NOT server errors (500) and NOT
 * missing resources (404). They are domain-level conflicts that the
 * client can understand and react to (e.g., show a specific UI message).
 *
 * HTTP 409 is the correct status: "The request conflicts with the current
 * state of the target resource."
 */
public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }
}
