package com.example.MotoShare.service;


import com.example.MotoShare.dto.AddBikeRequestDto;
import com.example.MotoShare.entity.Bike;
import com.example.MotoShare.entity.Biker;
import com.example.MotoShare.repository.BikeRepository;
import com.example.MotoShare.repository.BikerRepository;
import lombok.AllArgsConstructor;
import org.springframework.stereotype.Service;
@Service
@AllArgsConstructor
public class BikerAddingBikeDetailsService {

    private final BikeRepository bikeRepository;
    private final BikerRepository bikerRepository;

    public Bike addBikeDetails(AddBikeRequestDto dto , Long bikerId) {

        // Normalize the number plate
        String normalizedPlate =
                dto.getBikeNumber().toUpperCase().replaceAll("\\s+", "");

        if (bikeRepository.existsByBikeNumber(normalizedPlate)) {
            throw new RuntimeException("Bike with this number plate already exists");
        }

        Biker biker = bikerRepository.findById(bikerId)
                .orElseThrow(() -> new RuntimeException("Biker not found"));

//        if(!biker.getIsKycCompleted()){
//            throw new RuntimeException("Complete KYC to add bike details");
//        }

        //print rc no. in log for debugging
        System.out.println("RC Number: " + dto.getRcNumber());

        // rc no cant be null or empty
        if (dto.getRcNumber() == null || dto.getRcNumber().trim().isEmpty()) {
            throw new RuntimeException("RC Number cannot be null or empty");
        }

//        Biker biker = bikerRepository.findById(dto.getBikerId())
//                .orElseThrow(() -> new RuntimeException("Biker not found"));

//      Because we are getting biker id from the jwt token after login nd only biker can add bike details
        Bike bike = Bike.builder()
                .biker(biker)
                .company(dto.getCompany())
                .model(dto.getModel())
                .ratePerHour(dto.getRatePerHour())
                .bikeNumber(normalizedPlate)
                .rcNumber(dto.getRcNumber()) // why rcNumber is string ???
                .kms(dto.getKms())
                .build();

        return bikeRepository.save(bike);
    }
}
