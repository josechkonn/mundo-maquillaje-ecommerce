package mundo_maquillaje.ecommerce;

import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.condition.EnabledIfEnvironmentVariable;
import org.springframework.boot.test.context.SpringBootTest;

// Requiere una base de datos real: solo corre si DB_URL esta definida.
@EnabledIfEnvironmentVariable(named = "DB_URL", matches = ".+")
@SpringBootTest
class EcommerceApplicationTests {

	@Test
	void contextLoads() {
	}

}
