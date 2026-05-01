package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.Banner;
import mundo_maquillaje.ecommerce.Repositories.BannerRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class BannerService {

    private final BannerRepository bannerRepository;

    public List<Banner> getActiveBanners() {
        return bannerRepository.findByIsActiveOrderByDisplayOrderAsc(true);
    }

    public List<Banner> getAllBanners() {
        return bannerRepository.findAll();
    }

    public Banner getBannerById(UUID id) {
        return bannerRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Banner not found"));
    }

    @Transactional
    public Banner createBanner(Banner banner) {
        return bannerRepository.save(banner);
    }

    @Transactional
    public Banner updateBanner(UUID id, Banner details) {
        Banner banner = getBannerById(id);

        banner.setImageUrl(details.getImageUrl());
        banner.setTitle(details.getTitle());
        banner.setLinkUrl(details.getLinkUrl());
        banner.setDisplayOrder(details.getDisplayOrder());
        banner.setIsActive(details.getIsActive());

        return bannerRepository.save(banner);
    }

    @Transactional
    public void deleteBanner(UUID id) {
        Banner banner = getBannerById(id);
        bannerRepository.delete(banner);
    }
}
