package mundo_maquillaje.ecommerce.Repositories;

import mundo_maquillaje.ecommerce.Models.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface CategoryRepository extends JpaRepository<Category, UUID> {
    Optional<Category> findBySlug(String slug);
    List<Category> findByParentId(UUID parentId);
    List<Category> findByParentIdAndIsActive(UUID parentId, Boolean isActive);
    @org.springframework.data.jpa.repository.Query("SELECT c FROM Category c WHERE c.parent IS NULL AND (c.isActive = :isActive OR (:isActive = true AND c.isActive IS NULL))")
    List<Category> findByParentIsNullAndIsActive(@org.springframework.data.repository.query.Param("isActive") Boolean isActive);

    List<Category> findByIsActive(Boolean isActive);
}
