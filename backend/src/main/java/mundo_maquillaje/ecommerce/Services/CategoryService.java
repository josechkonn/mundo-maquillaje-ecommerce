package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Category;
import mundo_maquillaje.ecommerce.Repositories.CategoryRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class CategoryService {

    private final CategoryRepository categoryRepository;

    public List<Category> getAllCategories() {
        return categoryRepository.findAll();
    }

    public Category getCategoryById(UUID id) {
        return categoryRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Category not found"));
    }

    @Transactional
    public Category createCategory(Category category) {
        if (category.getSlug() == null || category.getSlug().isEmpty()) {
            category.setSlug(generateSlug(category.getName()));
        }
        return categoryRepository.save(category);
    }

    @Transactional
    public Category updateCategory(UUID id, Category details) {
        Category category = getCategoryById(id);

        category.setName(details.getName());
        category.setDescription(details.getDescription());
        category.setLogoUrl(details.getLogoUrl());
        category.setIsActive(details.getIsActive());
        category.setParent(details.getParent());

        if (details.getSlug() != null && !details.getSlug().isEmpty()) {
            category.setSlug(details.getSlug());
        } else {
            category.setSlug(generateSlug(details.getName()));
        }

        return categoryRepository.save(category);
    }

    @Transactional
    public void deleteCategory(UUID id) {
        Category category = getCategoryById(id);
        // Optional: Check if the category has children before deleting
        categoryRepository.delete(category);
    }

    private String generateSlug(String input) {
        if (input == null) return "";
        String nowhitespace = Pattern.compile("\\s+").matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = Pattern.compile("[^\\w-]").matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
