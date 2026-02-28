package com.petstore.service;

import com.petstore.dto.PetRequest;
import com.petstore.model.Category;
import com.petstore.model.Pet;
import com.petstore.model.PetStatus;
import com.petstore.repository.CategoryRepository;
import com.petstore.repository.PetRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class PetService {

    private final PetRepository petRepository;
    private final CategoryRepository categoryRepository;

    public List<Pet> findAll() {
        return petRepository.findAll();
    }

    public List<Pet> findFiltered(PetStatus status, Long categoryId) {
        if (status != null && categoryId != null) {
            return petRepository.findByStatusAndCategoryId(status, categoryId);
        } else if (status != null) {
            return petRepository.findByStatus(status);
        } else if (categoryId != null) {
            return petRepository.findByCategoryId(categoryId);
        }
        return petRepository.findAll();
    }

    public Pet findById(Long id) {
        return petRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Pet not found: " + id));
    }

    public List<Pet> search(String name) {
        return petRepository.findByNameContainingIgnoreCase(name);
    }

    public Pet create(PetRequest request) {
        Pet pet = mapToPet(new Pet(), request);
        return petRepository.save(pet);
    }

    public Pet update(Long id, PetRequest request) {
        Pet pet = findById(id);
        mapToPet(pet, request);
        return petRepository.save(pet);
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
