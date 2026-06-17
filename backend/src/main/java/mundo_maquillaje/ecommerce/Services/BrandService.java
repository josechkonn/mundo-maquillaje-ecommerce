package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Brand;
import mundo_maquillaje.ecommerce.Repositories.BrandRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.text.Normalizer;
import java.util.List;
import java.util.Locale;
import java.util.UUID;
import java.util.regex.Pattern;

@Service
@RequiredArgsConstructor
public class BrandService {

    private final BrandRepository brandRepository;

    public List<Brand> getAllBrands() {
        return brandRepository.findAll();
    }

    public Brand getBrandById(UUID id) {
        return brandRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Brand not found"));
    }

    @Transactional
    public Brand createBrand(Brand brand) {
        if (brand.getSlug() == null || brand.getSlug().isEmpty()) {
            brand.setSlug(generateSlug(brand.getName()));
        }
        return brandRepository.save(brand);
    }

    @Transactional
    public Brand updateBrand(UUID id, Brand brandDetails) {
        Brand brand = getBrandById(id);

        brand.setName(brandDetails.getName());
        brand.setDescription(brandDetails.getDescription());
        brand.setLogoUrl(brandDetails.getLogoUrl());
        brand.setIsActive(brandDetails.getIsActive());

        if (brandDetails.getSlug() != null && !brandDetails.getSlug().isEmpty()) {
            brand.setSlug(brandDetails.getSlug());
        } else {
            brand.setSlug(generateSlug(brandDetails.getName()));
        }

        return brandRepository.save(brand);
    }

    @Transactional
    public void deleteBrand(UUID id) {
        Brand brand = getBrandById(id);
        brandRepository.delete(brand);
    }

    private String generateSlug(String input) {
        if (input == null)
            return "";

        String nowhitespace = Pattern.compile("\\s+").matcher(input).replaceAll("-");
        String normalized = Normalizer.normalize(nowhitespace, Normalizer.Form.NFD);
        String slug = Pattern.compile("[^\\w-]").matcher(normalized).replaceAll("");
        return slug.toLowerCase(Locale.ENGLISH);
    }
}
