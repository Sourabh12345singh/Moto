package com.example.MotoShare.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import javax.sql.DataSource;
import java.sql.Connection;

@RestController
public class TestController {

    private final DataSource dataSource;


    public TestController(DataSource dataSource) {
        this.dataSource = dataSource;
    }

    @GetMapping("/test-db")
    public String testDb() {
       try( Connection conn = dataSource.getConnection()){
           // Connection successful
           return " DB Connected Successfully!";

       } catch (Exception e) {
           return "DB Connection Failed: " + e.getMessage();
       }

    }

}




