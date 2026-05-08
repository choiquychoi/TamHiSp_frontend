import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import hero_banner from '@/assets/hero_banner.jpg';
import api from '@/lib/axios';

const HeroBanner = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const { data } = await api.get('/banners');
        setBanners(data);
      } catch (error) {
        console.error('Lỗi khi tải banners:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchBanners();
  }, []);

  const defaultSlides = [
    {
      _id: 'default1',
      image: hero_banner,
      title: 'CHINH PHỤC ĐỈNH CAO',
      subtitle: 'Trang bị ngay những siêu phẩm cầu lông mới nhất 2026',
    }
  ];

  const slides = banners.length > 0 ? banners : defaultSlides;

  if (loading && banners.length === 0) return <div className="w-full aspect-video bg-zinc-900 animate-pulse flex items-center justify-center text-white font-black uppercase tracking-[0.5em]">Loading Hero...</div>;

  return (
    <section className="relative w-full bg-zinc-900 overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1000}
        slidesPerView={1}
        autoHeight={true}
        navigation={{
          nextEl: '.swiper-button-next',
          prevEl: '.swiper-button-prev',
        }}
        pagination={{ 
          clickable: true,
          el: '.swiper-pagination-custom',
          renderBullet: (index, className) => {
            return `<span class="${className} !w-1.5 !h-1.5 md:!w-2.5 md:!h-2.5 !bg-white/30 !opacity-100 transition-all duration-300"></span>`;
          }
        }}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        loop={slides.length > 1}
        className="w-full h-auto"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide._id}>
            {({ isActive }) => (
              <div className="w-full relative">
                {/* Full Image Display - No Cropping */}
                <img 
                  src={slide.image} 
                  alt={slide.title}
                  className="w-full h-auto block"
                />
                
                {/* Light Overlay for text readability if text exists */}
                {(slide.title || slide.subtitle) && (
                  <div className="absolute inset-0 bg-gradient-to-r from-black/50 via-transparent to-transparent flex items-center">
                    <div className="container mx-auto px-6 md:px-12 relative z-10 pt-4 md:pt-0">
                      <div className="max-w-[200px] sm:max-w-xl md:max-w-2xl lg:max-w-4xl text-white">
                        <motion.div
                          initial={{ opacity: 0, x: -20 }}
                          animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -20 }}
                          transition={{ duration: 0.8, delay: 0.3 }}
                        >
                          <h1 className="text-xl sm:text-4xl md:text-6xl lg:text-7xl font-black mb-1 md:mb-4 uppercase tracking-tighter leading-tight drop-shadow-2xl">
                            {slide.title}
                          </h1>
                        </motion.div>
                        
                        <motion.p 
                          initial={{ opacity: 0, y: 15 }}
                          animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 15 }}
                          transition={{ duration: 0.8, delay: 0.5 }}
                          className="text-[8px] sm:text-sm md:text-lg font-bold max-w-[160px] sm:max-w-md md:max-w-xl opacity-90 uppercase tracking-widest leading-tight border-l-2 border-destructive pl-2 md:pl-4"
                        >
                          {slide.subtitle}
                        </motion.p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </SwiperSlide>
        ))}

        {/* Navigation Overlays */}
        <div className="absolute bottom-4 left-0 w-full z-20 flex justify-center md:hidden">
          <div className="swiper-pagination-custom flex gap-2"></div>
        </div>
      </Swiper>
      
      <div className="absolute bottom-8 left-12 z-20 hidden md:flex">
        <div className="swiper-pagination-custom flex gap-3"></div>
      </div>

      <style dangerouslySetInnerHTML={{ __html: `
        .swiper-pagination-custom .swiper-pagination-bullet-active {
          background-color: #ef4444 !important;
          width: 25px !important;
          border-radius: 2px !important;
        }
      `}} />
    </section>
  );
};

export default HeroBanner;
