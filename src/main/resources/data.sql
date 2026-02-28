-- Categories
INSERT INTO categories (name, description, icon) VALUES ('Dogs', 'Man''s best friend', '🐶');
INSERT INTO categories (name, description, icon) VALUES ('Cats', 'Independent and curious companions', '🐱');
INSERT INTO categories (name, description, icon) VALUES ('Birds', 'Colorful and melodic friends', '🦜');
INSERT INTO categories (name, description, icon) VALUES ('Fish', 'Peaceful aquatic companions', '🐠');
INSERT INTO categories (name, description, icon) VALUES ('Rabbits', 'Fluffy and gentle friends', '🐰');
INSERT INTO categories (name, description, icon) VALUES ('Reptiles', 'Fascinating scaly friends', '🦎');

-- Pets
INSERT INTO pets (name, species, breed, age, price, description, image_url, status, category_id)
VALUES ('Buddy', 'Dog', 'Golden Retriever', 2, 850.00,
        'Buddy is a friendly and energetic Golden Retriever who loves to play fetch and cuddle. Great with kids!',
        'https://images.unsplash.com/photo-1587300003388-59208cc962cb?w=400', 'AVAILABLE', 1);

INSERT INTO pets (name, species, breed, age, price, description, image_url, status, category_id)
VALUES ('Max', 'Dog', 'German Shepherd', 3, 950.00,
        'Max is a loyal and intelligent German Shepherd. Fully trained and great for active families.',
        'https://images.unsplash.com/photo-1589941013453-ec89f33b5e95?w=400', 'AVAILABLE', 1);

INSERT INTO pets (name, species, breed, age, price, description, image_url, status, category_id)
VALUES ('Luna', 'Dog', 'Husky', 1, 1100.00,
        'Luna is a beautiful Siberian Husky puppy with striking blue eyes. Full of energy and love.',
        'https://images.unsplash.com/photo-1617895153857-82fe0c43621b?w=400', 'AVAILABLE', 1);

INSERT INTO pets (name, species, breed, age, price, description, image_url, status, category_id)
VALUES ('Whiskers', 'Cat', 'Persian', 4, 600.00,
        'Whiskers is a calm and affectionate Persian cat. Loves to be groomed and sit on laps.',
        'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=400', 'AVAILABLE', 2);

INSERT INTO pets (name, species, breed, age, price, description, image_url, status, category_id)
VALUES ('Shadow', 'Cat', 'Black Domestic Shorthair', 2, 200.00,
        'Shadow is a sleek, mysterious black cat who is very playful and loves laser pointers.',
        'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=400', 'AVAILABLE', 2);

INSERT INTO pets (name, species, breed, age, price, description, image_url, status, category_id)
VALUES ('Nala', 'Cat', 'Maine Coon', 3, 750.00,
        'Nala is a majestic Maine Coon with a gorgeous fluffy coat. Very gentle and dog-friendly.',
        'https://images.unsplash.com/photo-1568702846914-96b305d2aaeb?w=400', 'PENDING', 2);

INSERT INTO pets (name, species, breed, age, price, description, image_url, status, category_id)
VALUES ('Polly', 'Bird', 'African Grey Parrot', 5, 1500.00,
        'Polly is a highly intelligent African Grey who knows over 50 words. Incredible companion!',
        'https://images.unsplash.com/photo-1552728089-57bdde30beb3?w=400', 'AVAILABLE', 3);

INSERT INTO pets (name, species, breed, age, price, description, image_url, status, category_id)
VALUES ('Tweety', 'Bird', 'Canary', 1, 80.00,
        'Tweety is a cheerful yellow canary with a beautiful singing voice. Perfect for any home.',
        'https://images.unsplash.com/photo-1444464666168-49d633b86797?w=400', 'AVAILABLE', 3);

INSERT INTO pets (name, species, breed, age, price, description, image_url, status, category_id)
VALUES ('Nemo', 'Fish', 'Clownfish', 1, 25.00,
        'Just like in the movie! Nemo is a vibrant Clownfish who thrives in a saltwater tank.',
        'https://images.unsplash.com/photo-1535591273668-578e31182c4f?w=400', 'AVAILABLE', 4);

INSERT INTO pets (name, species, breed, age, price, description, image_url, status, category_id)
VALUES ('Bubbles', 'Fish', 'Betta Fish', 1, 15.00,
        'Bubbles is a stunning blue and red Betta fish with flowing fins. Easy to care for.',
        'https://images.unsplash.com/photo-1522069169874-c58ec4b76be5?w=400', 'AVAILABLE', 4);

INSERT INTO pets (name, species, breed, age, price, description, image_url, status, category_id)
VALUES ('Thumper', 'Rabbit', 'Holland Lop', 1, 150.00,
        'Thumper is an adorable Holland Lop rabbit with floppy ears. Loves to hop and explore.',
        'https://images.unsplash.com/photo-1585110396000-c9ffd4e4b308?w=400', 'AVAILABLE', 5);

INSERT INTO pets (name, species, breed, age, price, description, image_url, status, category_id)
VALUES ('Rex', 'Reptile', 'Bearded Dragon', 2, 300.00,
        'Rex is a friendly Bearded Dragon who loves being handled. Great beginner reptile!',
        'https://images.unsplash.com/photo-1570042225831-d98fa7577f1e?w=400', 'AVAILABLE', 6);
