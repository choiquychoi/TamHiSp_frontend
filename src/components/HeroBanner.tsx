import React, { useState, useEffect } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay, EffectFade } from 'swiper/modules';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from "@/components/ui/button";
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
      buttonText: 'MUA NGAY',
      link: '/'
    }
  ];

  const slides = banners.length > 0 ? banners : defaultSlides;

  if (loading && banners.length === 0) return <div className="h-screen w-full bg-zinc-900 animate-pulse flex items-center justify-center text-white font-black uppercase tracking-[0.5em]">Loading Hero...</div>;

  return (
    <section className="h-screen w-full relative overflow-hidden">
      <Swiper
        modules={[Navigation, Pagination, Autoplay, EffectFade]}
        effect="fade"
        fadeEffect={{ crossFade: true }}
        speed={1000}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ 
          clickable: true,
          renderBullet: (index, className) => {
            return `<span class="${className} !w-3 !h-3 !bg-white/50 !opacity-100 [&.swiper-pagination-bullet-active]:!bg-destructive [&.swiper-pagination-bullet-active]:!w-8 [&.swiper-pagination-bullet-active]:!rounded-full transition-all duration-300"></span>`;
          }
        }}
        autoplay={{ delay: 6000, disableOnInteraction: false }}
        loop={slides.length > 1}
        className="w-full h-full [&_.swiper-button-next]:!text-white [&_.swiper-button-prev]:!text-white [&_.swiper-button-next]:after:!text-2xl [&_.swiper-button-prev]:after:!text-2xl"
      >
        {slides.map((slide) => (
          <SwiperSlide key={slide._id}>
            {({ isActive }) => (
              <div className="w-full h-full relative flex items-center bg-zinc-900">
                {/* Background Image with Overlay */}
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-[10000ms] ease-linear"
                  style={{ 
                    backgroundImage: `url(${slide.image})`,
                    transform: isActive ? 'scale(1.1)' : 'scale(1)'
                  }}
                />
                <div className="absolute inset-0 bg-black/40" />

                <div className="container mx-auto px-4 relative z-10 pt-20">
                  <div className="max-width-[700px] text-white">
                    <motion.h1 
                      initial={{ opacity: 0, y: 30 }}
                      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                      transition={{ duration: 0.8, delay: 0.2 }}
                      className="text-5xl md:text-7xl lg:text-8xl font-black mb-6 uppercase tracking-tighter leading-[0.9] drop-shadow-2xl"
                    >
                      {slide.title}
                    </motion.h1>
                    <motion.p 
                      initial={{ opacity: 0, y: 20 }}
                      animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                      transition={{ duration: 0.8, delay: 0.4 }}
                      className="text-lg md:text-xl font-medium mb-10 max-w-xl opacity-90 drop-shadow-lg"
                    >
                      {slide.subtitle}
                    </motion.p>
                  </div>
                </div>
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </section>
  );
};

export default HeroBanner;
