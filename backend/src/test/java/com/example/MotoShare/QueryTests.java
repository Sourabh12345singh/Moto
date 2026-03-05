package com.example.MotoShare;


import com.example.MotoShare.entity.User;
import com.example.MotoShare.repository.BikerRepository;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;

import java.util.List;

@SpringBootTest
public class QueryTests {
//
//    @Autowired
//    private BikerRepository bikerRepository;
//
//    @Test
//    public void testFindBikerByName() {
//        List<User> biker = bikerRepository.findByName("Neha");
//        for(User b : biker){
//            System.out.println(b.getRole());
//        }
////    System.out.println("Biker found: " + biker);
//
//    }

}
//
//        if (biker != null) {
//            System.out.println("Biker found: " + biker.getName());
//        } else {
//            System.out.println("Biker not found");
//        }
//    }
//
//    @Test
//    public void testFindBikersOver15k() {
//        List<BikerEntity> bikers = bikerRepository.findByKmDrivenGreaterThan(15000);
//
//        System.out.println("Bikers with mileage > 15,000 km:");
//        bikers.forEach(b ->
//                System.out.println(b.getName() + " - " + b.getKmDriven())
//        );
//    }
//}
