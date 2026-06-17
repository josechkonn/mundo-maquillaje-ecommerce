import HomeBanner from "../components/home/HomeBanner";
import CategorySection from "../components/home/CategorySection";
import BestSellers from "../components/home/BestSellers";
import BrandsCarousel from "../components/home/BrandsCarousel";
import ShoppingSteps from "../components/home/ShoppingSteps";
import NewProducts from "../components/home/NewProducts";
import CollectionsSection from "../components/home/CollectionsSection";

const HomePage = () => {
  return (
    <div className="flex flex-col w-full min-h-screen bg-transparent">
      {/* Sección del Banner (40vh) */}
      <HomeBanner />

      {/* Sección de Categorías Reales */}
      <CategorySection />

      {/* Sección de Productos Más Vendidos (Slider Infinito) */}
      <BestSellers />

      {/* Sección de Nuestras Marcas (Fondo Inspirado y Slider) */}
      <BrandsCarousel />

      {/* Nueva Sección: Cómo funciona las compras */}
      <ShoppingSteps />

      {/* Nueva Sección: Productos Recién Llegados */}
      <NewProducts />

      {/* Nueva Sección: Conoce Nuestras Colecciones */}
      <CollectionsSection />

      {/* Otras secciones que vendrán después */}
      <section className="container mx-auto px-4 py-4 md:py-12">
        {/* Futuros componentes */}
      </section>
    </div>
  );
};

export default HomePage;
