import React, { useEffect, useState } from 'react';
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { motion } from "framer-motion";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ShoppingCart, Eye } from "lucide-react";
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

interface IProduct {
  _id: string;
  name: string;
  slug: string;
  mainImage: string;
  price: number;
  salePrice?: number;
  category: string;
  brand: string;
  isFeatured: boolean;
}

import api from '@/lib/axios';

const FeaturedProducts = () => {
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setLoading(true);
        // Gọi đích danh các sản phẩm nổi bật (đã được Backend sắp xếp theo featuredAt)
        const { data } = await api.get('/products?isFeatured=true&limit=20');
        setProducts(data.products);
      } catch (error) {
        console.error('Error fetching featured products:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProducts();
  }, []);

  if (loading) return (
    <div className="py-24 text-center font-bold text-red-600 animate-pulse uppercase tracking-widest">
      Đang tải bộ sưu tập nổi bật...
    </div>
  );

  return (
    <section className="py-12 md:py-24 bg-white overflow-hidden">
      <div className="container mx-auto px-4 md:px-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-8 md:mb-16 gap-4 px-2">
          <div className="space-y-1 md:space-y-2">
            <Badge className="mb-1 md:mb-2 px-2 py-0.5 md:px-3 md:py-1 text-[8px] md:text-xs font-bold uppercase tracking-wider bg-destructive text-white border-none">
              Hot Collection
            </Badge>
            <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic leading-none">
              Sản Phẩm <span className="text-destructive">Nổi Bật</span>
            </h2>
          </div>

        </div>

        <Swiper
          modules={[Navigation, Pagination]}
          spaceBetween={16}
          slidesPerView={2.2}
          pagination={{ 
            clickable: true,
            dynamicBullets: true 
          }}
          breakpoints={{
            640: { slidesPerView: 2.5, spaceBetween: 20 },
            768: { slidesPerView: 3.2, spaceBetween: 30 },
            1024: { slidesPerView: 4, spaceBetween: 40 },
          }}
          className="pb-12 md:pb-16 !px-2 md:!px-0"
        >
          {products.map((product) => {
            const hasSale = product.salePrice && product.salePrice > 0;
            const displayPrice = hasSale ? product.salePrice : product.price;
            const oldPrice = hasSale ? product.price : null;
            const discount = oldPrice ? Math.round(((oldPrice - (displayPrice || 0)) / oldPrice) * 100) : 0;

            return (
              <SwiperSlide key={product._id}>
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.3 }}
                >
                  <Link to={`/product/${product.slug}`}>
                    <Card className="group overflow-hidden border-none shadow-md hover:shadow-xl transition-all duration-300 bg-card cursor-pointer">
                      <CardContent className="p-0 relative aspect-[4/5] overflow-hidden bg-white">
                        <img 
                          src={product.mainImage} 
                          alt={product.name} 
                          className="w-full h-full object-contain p-4 transition-transform duration-500 group-hover:scale-110" 
                        />
                        
                        {/* Hover Actions Overlay */}
                        <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
                          <Button size="icon" variant="secondary" className="rounded-full shadow-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                            <Eye className="h-5 w-5" />
                          </Button>
                          <Button size="icon" className="rounded-full bg-destructive shadow-lg translate-y-4 group-hover:translate-y-0 transition-transform duration-300 delay-75">
                            <ShoppingCart className="h-5 w-5" />
                          </Button>
                        </div>
                        
                        {discount > 0 && (
                          <Badge className="absolute top-4 left-4 bg-destructive font-black px-3 py-1 rounded-lg">
                            -{discount}%
                          </Badge>
                        )}
                      </CardContent>
                      <CardFooter className="flex flex-col items-start p-6">
                        <div className="flex justify-between w-full items-center mb-1">
                          <span className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">
                            {product.brand}
                          </span>
                          <span className="text-[9px] font-bold text-destructive bg-destructive/10 px-2 py-0.5 rounded-full uppercase tracking-tighter">
                            {product.category}
                          </span>
                        </div>
                        <h3 className="font-bold text-lg mb-2 line-clamp-1 group-hover:text-destructive transition-colors uppercase tracking-tight">
                          {product.name}
                        </h3>
                        <div className="flex items-center gap-3">
                          <span className="text-xl font-black text-destructive tracking-tighter">
                            {displayPrice?.toLocaleString('vi-VN')}đ
                          </span>
                          {oldPrice && (
                            <span className="text-sm text-muted-foreground line-through opacity-40 font-bold">
                              {oldPrice.toLocaleString('vi-VN')}đ
                            </span>
                          )}
                        </div>
                      </CardFooter>
                    </Card>
                  </Link>
                </motion.div>
              </SwiperSlide>
            );
          })}
        </Swiper>
      </div>
    </section>
  );
};

export default FeaturedProducts;
