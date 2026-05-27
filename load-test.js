import http from 'k6/http';
import { check, sleep } from 'k6';

/**
 * Enterprise k6 Load Test Script for MotoShare.
 * Simulates high-traffic user volumes querying availability slots and creating bookings.
 * Showcase this script on your resume as proof of Performance & Scale Engineering.
 */
export const options = {
    stages: [
        { duration: '15s', target: 50 },  // Ramp up to 50 concurrent virtual users (VUs)
        { duration: '30s', target: 100 }, // Spike up to 100 concurrent VUs
        { duration: '30s', target: 100 }, // Hold 100 VUs (stress test)
        { duration: '15s', target: 0 },   // Ramp down to 0 VUs (cool down)
    ],
    thresholds: {
        http_req_duration: ['p(95)<500', 'p(99)<1500'], // 95% of requests must complete under 500ms; 99% under 1.5s
        http_req_failed: ['rate<0.05'],                 // Failure rate must be under 5%
    },
};

const BASE_URL = __ENV.API_URL || 'http://localhost:8080/api';

export default function () {
    const params = {
        headers: {
            'Content-Type': 'application/json',
        },
    };

    // Scenario 1: Search available bikes in Delhi (Highly concurrent Read operation)
    const searchRes = http.get(
        `${BASE_URL}/bikers/available?city=Delhi&now=2026-05-27T10:00:00&maxDate=2026-06-03T10:00:00`,
        params
    );
    
    check(searchRes, {
        'Search successful (HTTP 200)': (r) => r.status === 200,
        'Search latency < 200ms': (r) => r.timings.duration < 200,
    });

    sleep(1); // Simulate user thinking time before next action

    // Scenario 2: Simulate Booking creation attempt (Write operation under concurrency)
    // We attempt to book a bike (Simulating a flash sale request)
    const bookingPayload = JSON.stringify({
        slotId: '478043b8-9432-4e3b-a37b-0163af550d76', // Mock UUID representation
        startTime: '2026-05-27T11:00:00',
        endTime: '2026-05-27T13:00:00',
        userId: 1,
    });

    const bookingRes = http.post(
        `${BASE_URL}/bookings/book`,
        bookingPayload,
        params
    );

    // Some booking requests will fail due to locking/slots being taken (HTTP 400 or 500 depends on DB state),
    // and some will succeed (HTTP 200). We assert that the server handles them without crashing (not returning HTTP 500).
    check(bookingRes, {
        'Booking handled (HTTP 200, 400, or 429)': (r) => 
            r.status === 200 || r.status === 400 || r.status === 429,
        'No server crash (HTTP 500 count is zero)': (r) => r.status !== 500,
    });

    sleep(2); // Simulate user cool down
}
