package com.petstore.model;

import jakarta.persistence.*;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Entity
@Table(name = "pets")
public class Pet {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false)
    private String name;

    @NotBlank
    private String species;

    private String breed;

    @Min(0)
    private int age;

    @DecimalMin("0.0")
    private double price;

    @Column(length = 1000)
    private String description;

    private String imageUrl;

    @Enumerated(EnumType.STRING)
    private PetStatus status = PetStatus.AVAILABLE;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "category_id")
    private Category category;
}
