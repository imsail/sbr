package com.petstore.controller;

import com.petstore.dto.PetRequest;
import com.petstore.model.Pet;
import com.petstore.model.PetStatus;
import com.petstore.service.PetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/pets")
@RequiredArgsConstructor
public class PetController {

    private static final List<String> ALLOWED_SORT_FIELDS = List.of("id", "name", "price", "age");
    private static final int MAX_PAGE_SIZE = 50;

    private final PetService petService;

    @GetMapping
    public Page<Pet> getAll(
            @RequestParam(required = false) PetStatus status,
            @RequestParam(required = false) Long categoryId,
            @RequestParam(defaultValue = "0")  int page,
            @RequestParam(defaultValue = "8")  int size,
            @RequestParam(defaultValue = "id") String sort,
            @RequestParam(defaultValue = "asc") String dir) {

        Pageable pageable = PageRequest.of(page, Math.min(size, MAX_PAGE_SIZE), buildSort(sort, dir));
        return petService.findFiltered(status, categoryId, pageable);
    }

    @GetMapping("/search")
    public Page<Pet> search(
            @RequestParam String name,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "8") int size) {

        Pageable pageable = PageRequest.of(page, Math.min(size, MAX_PAGE_SIZE));
        return petService.search(name, pageable);
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

    private Sort buildSort(String field, String dir) {
        String safeField = ALLOWED_SORT_FIELDS.contains(field) ? field : "id";
        Sort.Direction direction = "desc".equalsIgnoreCase(dir) ? Sort.Direction.DESC : Sort.Direction.ASC;
        return Sort.by(direction, safeField);
    }
}
