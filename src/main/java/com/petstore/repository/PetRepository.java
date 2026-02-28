package com.petstore.repository;

import com.petstore.model.Pet;
import com.petstore.model.PetStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface PetRepository extends JpaRepository<Pet, Long> {

    // Paginated queries (used by main listing)
    Page<Pet> findByStatus(PetStatus status, Pageable pageable);
    Page<Pet> findByCategoryId(Long categoryId, Pageable pageable);
    Page<Pet> findByStatusAndCategoryId(PetStatus status, Long categoryId, Pageable pageable);
    Page<Pet> findByNameContainingIgnoreCase(String name, Pageable pageable);

    // Unpaginated (used by homepage featured section)
    List<Pet> findByStatus(PetStatus status);
}
