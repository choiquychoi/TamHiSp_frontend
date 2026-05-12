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

  if (loading && banners.length === 0) return (
    <div className="w-full aspect-[16/7] md:aspect-[21/7] bg-zinc-900 animate-pulse flex items-center justify-center text-white font-black uppercase tracking-[0.5em]">
      Loading Hero...
    </div>
  );

  return (
    <section className="relative w-full bg-zinc-900 overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1000}
        slidesPerView={1}
        autoHeight={false}
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
        className="w-full"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide._id}>
            {({ isActive }) => (
              <div className="w-full relative aspect-[16/8] md:aspect-[21/7] min-h-[250px] md:min-h-[400px]">
                {/* Background Image with Fixed Size */}
                <img 
                  src={slide.image} 
                  alt={slide.title}
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Darker Overlay for better contrast and depth */}
                <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/20 to-transparent flex items-center">
                  <div className="container mx-auto px-6 md:px-12 relative z-10">
                    <div className="max-w-[280px] sm:max-w-xl md:max-w-2xl lg:max-w-4xl text-white">
                      <motion.div
                        initial={{ opacity: 0, x: -30 }}
                        animate={isActive ? { opacity: 1, x: 0 } : { opacity: 0, x: -30 }}
                        transition={{ duration: 0.8, delay: 0.3 }}
                      >
                        <h1 className="text-2xl sm:text-5xl md:text-7xl lg:text-8xl font-black mb-2 md:mb-6 uppercase tracking-tighter leading-[0.9] drop-shadow-[0_10px_10px_rgba(0,0,0,0.5)]">
                          {slide.title}
                        </h1>
                      </motion.div>
                      
                      <motion.p 
                        initial={{ opacity: 0, y: 20 }}
                        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.8, delay: 0.5 }}
                        className="text-[10px] sm:text-base md:text-xl font-bold max-w-[200px] sm:max-w-md md:max-w-xl opacity-90 uppercase tracking-widest leading-tight border-l-4 border-destructive pl-3 md:pl-6"
                      >
                        {slide.subtitle}
                      </motion.p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </SwiperSlide>
        ))}

        {/* Custom Navigation Arrows for Desktop */}
        <div className="absolute inset-0 z-10 pointer-events-none hidden md:block">
          <div className="container mx-auto h-full relative">
            <button className="swiper-button-prev !static !w-12 !h-12 !bg-white/10 hover:!bg-destructive !text-white rounded-full !mt-0 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-auto transition-all border border-white/20">
            </button>
            <button className="swiper-button-next !static !w-12 !h-12 !bg-white/10 hover:!bg-destructive !text-white rounded-full !mt-0 absolute right-4 top-1/2 -translate-y-1/2 pointer-events-auto transition-all border border-white/20">
            </button>
          </div>
        </div>

        {/* Pagination Dots */}
        <div className="absolute bottom-6 left-0 w-full z-20 flex justify-center md:hidden">
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
