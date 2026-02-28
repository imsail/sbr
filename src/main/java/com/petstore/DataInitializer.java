package com.petstore;

import com.petstore.model.*;
import com.petstore.repository.CategoryRepository;
import com.petstore.repository.PetRepository;
import com.petstore.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository     userRepository;
    private final CategoryRepository categoryRepository;
    private final PetRepository      petRepository;
    private final PasswordEncoder    passwordEncoder;

    @Override
    public void run(String... args) {
        seedUsers();
        seedCatalog();
    }

    // ── Users ─────────────────────────────────────────────────────────────────

    private void seedUsers() {
        if (userRepository.count() > 0) return;

        User admin = new User();
        admin.setUsername("admin");
        admin.setEmail("admin@pawstore.com");
        admin.setPassword(passwordEncoder.encode("admin123"));
        admin.setRole(Role.ADMIN);
        userRepository.save(admin);

        User customer = new User();
        customer.setUsername("customer");
        customer.setEmail("customer@pawstore.com");
        customer.setPassword(passwordEncoder.encode("customer123"));
        customer.setRole(Role.CUSTOMER);
        userRepository.save(customer);
    }

    // ── Categories + Pets ─────────────────────────────────────────────────────

    private void seedCatalog() {
        if (categoryRepository.count() > 0) return;

        Category dogs     = save(new Category(null, "Dogs",     "Man's best friend",                 "🐶"));
        Category cats     = save(new Category(null, "Cats",     "Independent and curious companions", "🐱"));
        Category birds    = save(new Category(null, "Birds",    "Colorful and melodic friends",       "🦜"));
        Category fish     = save(new Category(null, "Fish",     "Peaceful aquatic companions",        "🐠"));
        Category rabbits  = save(new Category(null, "Rabbits",  "Fluffy and gentle friends",          "🐰"));
        Category reptiles = save(new Category(null, "Reptiles", "Fascinating scaly friends",          "🦎"));

        // Dogs
        pet("Buddy",    "Dog",     "Golden Retriever",        2, 850.00,
            "Buddy is a friendly and energetic Golden Retriever who loves to play fetch and cuddle. Great with kids!",
            "https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400", PetStatus.AVAILABLE, dogs);
        pet("Max",      "Dog",     "German Shepherd",         3, 950.00,
            "Max is a loyal and intelligent German Shepherd. Fully trained and great for active families.",
            "https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400", PetStatus.AVAILABLE, dogs);
        pet("Luna",     "Dog",     "Husky",                   1, 1100.00,
            "Luna is a beautiful Siberian Husky puppy with striking blue eyes. Full of energy and love.",
            "https://images.unsplash.com/photo-1617895153857-82fe0c43621b?w=400", PetStatus.AVAILABLE, dogs);

        // Cats
        pet("Whiskers", "Cat",     "Persian",                 4, 600.00,
            "Whiskers is a calm and affectionate Persian cat. Loves to be groomed and sit on laps.",
            "https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400", PetStatus.AVAILABLE, cats);
        pet("Shadow",   "Cat",     "Black Domestic Shorthair",2, 200.00,
            "Shadow is a sleek, mysterious black cat who is very playful and loves laser pointers.",
            "https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=400", PetStatus.AVAILABLE, cats);
        pet("Nala",     "Cat",     "Maine Coon",              3, 750.00,
            "Nala is a majestic Maine Coon with a gorgeous fluffy coat. Very gentle and dog-friendly.",
            "https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400", PetStatus.PENDING,   cats);

        // Birds
        pet("Polly",    "Bird",    "African Grey Parrot",     5, 1500.00,
            "Polly is a highly intelligent African Grey who knows over 50 words. Incredible companion!",
            "https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400", PetStatus.AVAILABLE, birds);
        pet("Tweety",   "Bird",    "Canary",                  1, 80.00,
            "Tweety is a cheerful yellow canary with a beautiful singing voice. Perfect for any home.",
            "https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400", PetStatus.AVAILABLE, birds);

        // Fish
        pet("Nemo",     "Fish",    "Clownfish",               1, 25.00,
            "Just like in the movie! Nemo is a vibrant Clownfish who thrives in a saltwater tank.",
            "https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400", PetStatus.AVAILABLE, fish);
        pet("Bubbles",  "Fish",    "Betta Fish",              1, 15.00,
            "Bubbles is a stunning blue and red Betta fish with flowing fins. Easy to care for.",
            "https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400", PetStatus.AVAILABLE, fish);

        // Rabbits
        pet("Thumper",  "Rabbit",  "Holland Lop",             1, 150.00,
            "Thumper is an adorable Holland Lop rabbit with floppy ears. Loves to hop and explore.",
            "https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400", PetStatus.AVAILABLE, rabbits);

        // Reptiles
        pet("Rex",      "Reptile", "Bearded Dragon",          2, 300.00,
            "Rex is a friendly Bearded Dragon who loves being handled. Great beginner reptile!",
            "https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400", PetStatus.AVAILABLE, reptiles);
    }

    private Category save(Category c) {
        return categoryRepository.save(c);
    }

    private void pet(String name, String species, String breed, int age, double price,
                     String description, String imageUrl, PetStatus status, Category category) {
        Pet p = new Pet();
        p.setName(name);
        p.setSpecies(species);
        p.setBreed(breed);
        p.setAge(age);
        p.setPrice(price);
        p.setDescription(description);
        p.setImageUrl(imageUrl);
        p.setStatus(status);
        p.setCategory(category);
        petRepository.save(p);
    }
}
