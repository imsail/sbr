package com.petstore.service;

import com.petstore.model.Category;
import com.petstore.repository.CategoryRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> findAll() {
        return categoryRepository.findAll();
    }

    public Category findById(Long id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found: " + id));
    }

    public Category save(Category category) {
        return categoryRepository.save(category);
    }

    public Category update(Long id, Category updated) {
        Category existing = findById(id);
        existing.setName(updated.getName());
        existing.setDescription(updated.getDescription());
        existing.setIcon(updated.getIcon());
        return categoryRepository.save(existing);
    }

    public void delete(Long id) {
        categoryRepository.deleteById(id);
    }
}
