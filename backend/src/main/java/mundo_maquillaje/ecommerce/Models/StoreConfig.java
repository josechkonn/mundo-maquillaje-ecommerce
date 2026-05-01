package mundo_maquillaje.ecommerce.Models;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;
import java.util.UUID;

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

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
