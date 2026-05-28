package mundo_maquillaje.ecommerce.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;
import java.util.List;
import java.util.ArrayList;

@Entity
@Table(name = "store_configs")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StoreConfig {

    @Id
    @GeneratedValue(strategy = GenerationType.AUTO)
    @Column(name = "id", updatable = false, nullable = false)
    private UUID id;

    // Contact Information
    @Column(name = "address", columnDefinition = "TEXT")
    private String address;

    @Column(name = "phone")
    private String phone;

    @Column(name = "whatsapp")
    private String whatsapp;

    // Social Media
    @Column(name = "instagram_url")
    private String instagramUrl;

    @Column(name = "tiktok_url")
    private String tiktokUrl;

    @Column(name = "facebook_url")
    private String facebookUrl;

    // Store Hours
    @Column(name = "hours_mon_fri")
    private String hoursMonFri;

    @Column(name = "hours_sat")
    private String hoursSat;

    @Column(name = "hours_sun")
    private String hoursSun;

    @Column(name = "google_maps_embed", columnDefinition = "TEXT")
    private String googleMapsEmbed;

    @Column(name = "our_essence", columnDefinition = "TEXT")
    private String ourEssence;

    // Pillars Section Config
    @Column(name = "show_pillars")
    private Boolean showPillars;

    @Column(name = "pillars_title")
    private String pillarsTitle;

    // Dynamic Pillars Relation
    @OneToMany(cascade = CascadeType.ALL, orphanRemoval = true, fetch = FetchType.EAGER)
    @JoinColumn(name = "store_config_id")
    @OrderBy("orderIndex ASC")
    @Builder.Default
    private List<StorePillar> pillars = new ArrayList<>();

    // Mission and Vision Section Config
    @Column(name = "show_mission_vision")
    private Boolean showMissionVision;

    @Column(name = "show_mission")
    private Boolean showMission;

    @Column(name = "mission_title")
    private String missionTitle;

    @Column(name = "mission_content", columnDefinition = "TEXT")
    private String missionContent;

    @Column(name = "show_vision")
    private Boolean showVision;

    @Column(name = "vision_title")
    private String visionTitle;

    @Column(name = "vision_content", columnDefinition = "TEXT")
    private String visionContent;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
