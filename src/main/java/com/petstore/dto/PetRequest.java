package com.petstore.dto;

import com.petstore.model.PetStatus;
import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PetRequest {

    @NotBlank
    private String name;

    @NotBlank
    private String species;

    private String breed;

    @Min(0)
    private int age;

    @DecimalMin("0.0")
    private double price;

    private String description;

    private String imageUrl;

    private PetStatus status;

    private Long categoryId;
}
