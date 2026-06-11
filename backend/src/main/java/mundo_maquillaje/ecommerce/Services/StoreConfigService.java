package mundo_maquillaje.ecommerce.Services;

import lombok.RequiredArgsConstructor;
import mundo_maquillaje.ecommerce.Models.StoreConfig;
import mundo_maquillaje.ecommerce.Models.StorePillar;
import mundo_maquillaje.ecommerce.Repositories.StoreConfigRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;


@Service
@RequiredArgsConstructor
public class StoreConfigService {

    private final StoreConfigRepository storeConfigRepository;

    public StoreConfig getConfig() {
        return storeConfigRepository.findAll().stream().findFirst()
                .orElse(StoreConfig.builder().build());
    }

    @Transactional
    public StoreConfig saveConfig(StoreConfig config) {
        StoreConfig existing = storeConfigRepository.findAll().stream().findFirst().orElse(null);
        if (existing != null) {
            existing.setAddress(config.getAddress());
            existing.setPhone(config.getPhone());
            existing.setWhatsapp(config.getWhatsapp());
            existing.setInstagramUrl(config.getInstagramUrl());
            existing.setTiktokUrl(config.getTiktokUrl());
            existing.setFacebookUrl(config.getFacebookUrl());
            existing.setHoursMonFri(config.getHoursMonFri());
            existing.setHoursSat(config.getHoursSat());
            existing.setHoursSun(config.getHoursSun());
            existing.setGoogleMapsEmbed(config.getGoogleMapsEmbed());
            existing.setOurEssence(config.getOurEssence());
            existing.setShowPillars(config.getShowPillars());
            existing.setPillarsTitle(config.getPillarsTitle());
            existing.setShowMissionVision(config.getShowMissionVision());
            existing.setShowMission(config.getShowMission());
            existing.setMissionTitle(config.getMissionTitle());
            existing.setMissionContent(config.getMissionContent());
            existing.setShowVision(config.getShowVision());
            existing.setVisionTitle(config.getVisionTitle());
            existing.setVisionContent(config.getVisionContent());

            existing.getPillars().clear();
            for (StorePillar pillar : config.getPillars()) {
                pillar.setId(null);
                existing.getPillars().add(pillar);
            }

            return storeConfigRepository.save(existing);
        }

        for (StorePillar pillar : config.getPillars()) {
            pillar.setId(null);
        }
        return storeConfigRepository.save(config);
    }
}
