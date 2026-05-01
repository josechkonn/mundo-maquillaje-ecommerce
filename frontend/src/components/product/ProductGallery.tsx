import { useState, useEffect, useRef } from "react";
import { type ProductImage } from "../../services/productService";
import { ChevronLeftIcon, ChevronRightIcon } from "@heroicons/react/24/outline";

interface ProductGalleryProps {
  images: ProductImage[];
  previewImageUrl?: string | null;
}

const ProductGallery = ({ images, previewImageUrl }: ProductGalleryProps) => {
  const [activeImage, setActiveImage] = useState<string>("");
  const [zoomPos, setZoomPos] = useState({ x: 0, y: 0, show: false });
  const containerRef = useRef<HTMLDivElement>(null);

  // Whenever the images list changes (variation switch), reset to the first image
  useEffect(() => {
    if (images.length > 0) {
      const main = images.find(img => img.isMain) || images[0];
      setActiveImage(main.urlImage);
    } else {
      setActiveImage("");
    }
  }, [images]);

  const handlePrev = () => {
    const currentIndex = images.findIndex(img => img.urlImage === activeImage);
    const prevIndex = (currentIndex - 1 + images.length) % images.length;
    setActiveImage(images[prevIndex].urlImage);
  };

  const handleNext = () => {
    const currentIndex = images.findIndex(img => img.urlImage === activeImage);
    const nextIndex = (currentIndex + 1) % images.length;
    setActiveImage(images[nextIndex].urlImage);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!containerRef.current) return;
    const { left, top, width, height } = containerRef.current.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setZoomPos({ x, y, show: true });
  };

  return (
    <div className="flex flex-col-reverse md:flex-row gap-8 lg:gap-24 items-center justify-center">
      {/* Thumbnails - Hidden or smaller on mobile if dots are preferred */}
      <div className="hidden md:flex md:flex-col gap-4 overflow-x-auto md:overflow-y-auto scrollbar-hide md:max-h-[600px] py-2 items-center">
        {images.map((img, idx) => (
          <button
            key={img.id || idx}
            onClick={() => setActiveImage(img.urlImage)}
            className={`flex-shrink-0 w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all bg-white relative ${activeImage === img.urlImage
              ? "border-brand-400 shadow-md ring-2 ring-brand-100"
              : "border-transparent opacity-60 hover:opacity-100"
              }`}
          >
            <img
              src={img.urlImage}
              alt={img.altText || "Product Thumbnail"}
              className="w-full h-full object-cover"
            />
          </button>
        ))}
      </div>

      {/* Main Image with Outside Arrows */}
      <div className="relative flex-1 w-full max-w-[500px]">
        <div
          ref={containerRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={() => setZoomPos(prev => ({ ...prev, show: false }))}
          className="relative aspect-square bg-[#fdf2f4] rounded-[32px] overflow-hidden cursor-zoom-in flex items-center justify-center  lg:p-12 group"
        >
          {activeImage ? (
            <img
              src={activeImage}
              alt="Main product"
              className={`w-full h-full object-contain transition-all duration-200 ${zoomPos.show || previewImageUrl ? 'opacity-0' : 'opacity-100'}`}
            />
          ) : (
            <div className="w-full h-full flex items-center justify-center bg-gray-50 text-gray-400 rounded-[32px]">
              <span className="text-sm">Sin imagen</span>
            </div>
          )}

          {/* Preview de variante al hacer hover — overlay temporal con fade */}
          {previewImageUrl && !zoomPos.show && (
            <div
              className="absolute inset-0 pointer-events-none"
              style={{
                backgroundImage: `url(${previewImageUrl})`,
                backgroundSize: 'contain',
                backgroundPosition: 'center',
                backgroundRepeat: 'no-repeat',
              }}
            />
          )}

          {zoomPos.show && (
            <div
              className="absolute inset-0 pointer-events-none bg-no-repeat"
              style={{
                backgroundImage: `url(${activeImage})`,
                backgroundPosition: `${zoomPos.x}% ${zoomPos.y}%`,
                backgroundSize: '250%',
              }}
            />
          )}
        </div>

        {/* Navigation Arrows (Desktop) */}
        <button
          onClick={handlePrev}
          className="absolute -left-16 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#F79EAF] text-white rounded-full items-center justify-center shadow-lg hover:bg-brand-500 transition-all active:scale-90 z-20 hidden lg:flex"
        >
          <ChevronLeftIcon className="w-5 h-5 stroke-[3px]" />
        </button>
        <button
          onClick={handleNext}
          className="absolute -right-16 top-1/2 -translate-y-1/2 w-10 h-10 bg-[#F79EAF] text-white rounded-full items-center justify-center shadow-lg hover:bg-brand-500 transition-all active:scale-90 z-20 hidden lg:flex"
        >
          <ChevronRightIcon className="w-5 h-5 stroke-[3px]" />
        </button>

        {/* Pagination Dots (Mobile) */}
        {images.length > 1 && (
          <div className="flex lg:hidden justify-center gap-3 mt-6 items-center">
            {images.map((img, idx) => (
              <button
                key={img.id || idx}
                onClick={() => setActiveImage(img.urlImage)}
                className={`rounded-full transition-all duration-300 ${activeImage === img.urlImage ? "w-3 h-3 bg-[#F79EAF] shadow-sm" : "w-2 h-2 bg-[#D1D1D1] hover:bg-[#a0a0a0]"
                  }`}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductGallery;
