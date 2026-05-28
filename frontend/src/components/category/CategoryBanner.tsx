
interface CategoryBannerProps {
  name: string;
  bannerUrl?: string;
}

const CategoryBanner = ({ name, bannerUrl }: CategoryBannerProps) => {
  return (
    <section className="w-full h-[30vh] md:h-[60vh] relative overflow-hidden bg-brand-50">
      {bannerUrl ? (
        <img
          src={bannerUrl}
          alt={name}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full bg-gradient-to-r from-brand-100 to-brand-50 flex items-center justify-center">
           {/* Fallback elegante */}
        </div>
      )}
    </section>
  );
};

export default CategoryBanner;
