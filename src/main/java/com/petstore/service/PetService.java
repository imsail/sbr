package com.petstore.service;

import com.petstore.dto.PetRequest;
import com.petstore.model.Category;
import com.petstore.model.Pet;
import com.petstore.model.PetStatus;
import com.petstore.repository.CategoryRepository;
import com.petstore.repository.PetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PetService {

    private final PetRepository petRepository;
    private final CategoryRepository categoryRepository;

    /** Unpaginated — used by the homepage featured section. */
    public List<Pet> findAll() {
        return petRepository.findAll();
    }

    /** Paginated listing with optional status / category filters. */
    public Page<Pet> findFiltered(PetStatus status, Long categoryId, Pageable pageable) {
        if (status != null && categoryId != null) {
            return petRepository.findByStatusAndCategoryId(status, categoryId, pageable);
        } else if (status != null) {
            return petRepository.findByStatus(status, pageable);
        } else if (categoryId != null) {
            return petRepository.findByCategoryId(categoryId, pageable);
        }
        return petRepository.findAll(pageable);
    }

    /** Paginated full-text search by name. */
    public Page<Pet> search(String name, Pageable pageable) {
        return petRepository.findByNameContainingIgnoreCase(name, pageable);
    }

    public Pet findById(Long id) {
        return petRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pet not found: " + id));
    }

    public Pet create(PetRequest request) {
        return petRepository.save(mapToPet(new Pet(), request));
    }

    public Pet update(Long id, PetRequest request) {
        return petRepository.save(mapToPet(findById(id), request));
    }

    public void delete(Long id) {
        petRepository.deleteById(id);
    }

    private Pet mapToPet(Pet pet, PetRequest req) {
        pet.setName(req.getName());
        pet.setSpecies(req.getSpecies());
        pet.setBreed(req.getBreed());
        pet.setAge(req.getAge());
        pet.setPrice(req.getPrice());
        pet.setDescription(req.getDescription());
        pet.setImageUrl(req.getImageUrl());
        if (req.getStatus() != null) {
            pet.setStatus(req.getStatus());
        }
        if (req.getCategoryId() != null) {
            Category category = categoryRepository.findById(req.getCategoryId())
                    .orElseThrow(() -> new RuntimeException("Category not found: " + req.getCategoryId()));
            pet.setCategory(category);
        }
        return pet;
    }
}
