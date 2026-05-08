import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2 } from "lucide-react";
import { motion } from "framer-motion";
import CONFIG from '@/lib/config';

import api from '@/lib/axios';

const FocusProduct = () => {
  const [product, setProduct] = useState<any>(null);

  useEffect(() => {
    const fetchFocusProduct = async () => {
      try {
        const { data } = await api.get('/products');
        // API mới trả về { products: [...] }, chúng ta cần lấy mảng products ra trước
        const productList = data.products || data;
        const focus = Array.isArray(productList) ? productList.find((p: any) => p.isFocus || p.name.includes('Youlong')) : null;
        
        if (focus) {
          setProduct({
            ...focus,
            name: 'Vợt cầu lông Victor Thruster Ryuga Metallic',
            image: 'https://s3-api.n8-workshop.com/internbucket/products/1777341570807-495372463_3760049437475071_4813199914581734053_n.jpg'
          });
        } else {
          setProduct({
            name: 'Vợt cầu lông Victor Thruster Ryuga Metallic',
            description: 'Siêu phẩm vợt tấn công mới Victor Thruster Ryuga Metallic dự kiến sẽ được ra mắt trong thời gian cuối năm nay. Với thiết kế cao cấp cùng nhiều công nghệ trang bị tối tân, nếu bạn là một fan cuồng nhiệt với các cây vợt của dòng Thruster nhà Victor, yêu thích lối chơi cầu tấn công thì chắc chắn không thể bỏ qua sự kiện cực hot này đâu nhé!',
            image: 'https://s3-api.n8-workshop.com/internbucket/products/1777341570807-495372463_3760049437475071_4813199914581734053_n.jpg',
            price: 3450000
          });
        }
      } catch (error) {
        console.error('Error fetching focus product:', error);
        setProduct({
          name: 'Vợt cầu lông Victor Thruster Ryuga Metallic',
          description: 'Siêu phẩm vợt tấn công mới Victor Thruster Ryuga Metallic dự kiến sẽ được ra mắt trong thời gian cuối năm nay. Với thiết kế cao cấp cùng nhiều công nghệ trang bị tối tân, nếu bạn là một fan cuồng nhiệt với các cây vợt của dòng Thruster nhà Victor, yêu thích lối chơi cầu tấn công thì chắc chắn không thể bỏ qua sự kiện cực hot này đâu nhé!',
          image: 'https://s3-api.n8-workshop.com/internbucket/products/1777341570807-495372463_3760049437475071_4813199914581734053_n.jpg',
          price: 3450000
        });
      }
    };
    fetchFocusProduct();
  }, []);

  if (!product) return null;

  return (
    <section className="relative w-full bg-zinc-950 text-white overflow-hidden">
      <div className="grid grid-cols-1 lg:grid-cols-2 min-h-[600px] md:min-h-[800px]">
        {/* Image Side */}
        <motion.div 
          initial={{ opacity: 0, x: -50 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
          className="relative h-[300px] sm:h-[400px] lg:h-auto overflow-hidden group"
        >
          <img 
            src={product.image} 
            alt={product.name} 
            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-transparent to-zinc-950/20" />
        </motion.div>

        {/* Text Side */}
        <div className="flex items-center justify-center p-6 sm:p-10 lg:p-20 bg-zinc-900/50 backdrop-blur-sm">
          <motion.div 
            initial={{ opacity: 0, x: 50 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.2 }}
            className="max-w-xl"
          >
            <Badge className="mb-4 md:mb-6 px-4 py-1 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] bg-destructive hover:bg-destructive text-white border-none rounded-none">
              Siêu phẩm 2026
            </Badge>
            
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-black mb-6 md:mb-8 uppercase tracking-tighter leading-[1] md:leading-[0.9]">
              {product.name}
            </h2>
            
            <p className="text-sm md:text-lg text-zinc-400 mb-8 md:mb-10 leading-relaxed font-medium">
              {product.description}
            </p>
            
            <div className="space-y-3 md:space-y-4 mb-10 md:mb-12">
              {[
                "Thiết kế metallic bóng bẩy, nổi bật",
                "Khung vợt sắc nét, mạnh mẽ",
                "Ngoại hình đậm chất chiến binh"
              ].map((feature, i) => (
                <motion.div 
                  key={i}
                  initial={{ opacity: 0, x: 20 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="flex items-center gap-3 md:gap-4 group"
                >
                  <div className="flex-shrink-0 w-5 h-5 md:w-6 md:h-6 rounded-full bg-destructive/10 flex items-center justify-center group-hover:bg-destructive/20 transition-colors">
                    <CheckCircle2 className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
                  </div>
                  <span className="text-xs md:text-base font-bold text-zinc-200 group-hover:text-white transition-colors">
                    {feature}
                  </span>
                </motion.div>
              ))}
            </div>

            <Button 
              size="lg" 
              className="w-full sm:w-auto h-14 md:h-16 px-10 md:px-12 text-sm md:text-base font-black uppercase tracking-widest bg-white text-black hover:bg-destructive hover:text-white transition-all rounded-none border-none shadow-xl"
            >
              Khám phá chi tiết
            </Button>
          </motion.div>
        </div>
      </div>
      
      {/* Decorative Elements */}
      <div className="absolute top-0 right-0 w-64 h-64 bg-destructive/5 blur-[120px] rounded-full -mr-32 -mt-32" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-destructive/5 blur-[150px] rounded-full -ml-48 -mb-48" />
    </section>
  );
};

export default FocusProduct;
