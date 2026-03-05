package com.example.MotoShare.controller;

import com.example.MotoShare.dto.CreateUserRequestDto;
import com.example.MotoShare.dto.LoginRequestDto;
import com.example.MotoShare.service.AuthService;
import com.example.MotoShare.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserService userService;
    private final AuthService authService;

//    @Autowired
//    private AuthenticationManager authenticationManager;

    // 🔹 CREATE USER (Signup)
    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody CreateUserRequestDto request) {

        userService.createUser(request);

        return ResponseEntity.ok("User created successfully");
    }


    // 🔹 LOGIN (Token only)
    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody LoginRequestDto request) {

//        authenticationManager.authenticate(
//                new UsernamePasswordAuthenticationToken(
//                        request.getEmail(),
//                        request.getPassword()
//                )
//        );

        String token = authService.authenticate(
                request.getEmail(),
                request.getPassword()
        );

        return ResponseEntity.ok(token);
    }
}
