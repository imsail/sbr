package com.petstore.repository;

import com.petstore.model.Pet;
import com.petstore.model.PetStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {

    List<Pet> findByStatus(PetStatus status);

    List<Pet> findByCategoryId(Long categoryId);

    List<Pet> findByStatusAndCategoryId(PetStatus status, Long categoryId);

    List<Pet> findByNameContainingIgnoreCase(String name);
}
