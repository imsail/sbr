package com.petstore.controller;

import com.petstore.dto.PetRequest;
import com.petstore.model.Pet;
import com.petstore.model.PetStatus;
import com.petstore.service.PetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pets")
@RequiredArgsConstructor
public class PetController {

    private final PetService petService;

    @GetMapping
    public List<Pet> getAll(
            @RequestParam(required = false) PetStatus status,
            @RequestParam(required = false) Long categoryId) {
        return petService.findFiltered(status, categoryId);
    }

    @GetMapping("/search")
    public List<Pet> search(@RequestParam String name) {
        return petService.search(name);
    }

    @GetMapping("/{id}")
    public ResponseEntity<Pet> getById(@PathVariable Long id) {
        return ResponseEntity.ok(petService.findById(id));
    }

    @PostMapping
    public ResponseEntity<Pet> create(@Valid @RequestBody PetRequest request) {
        return ResponseEntity.ok(petService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Pet> update(@PathVariable Long id, @Valid @RequestBody PetRequest request) {
        return ResponseEntity.ok(petService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        petService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
