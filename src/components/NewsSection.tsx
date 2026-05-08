import React, { useState, useEffect } from 'react';
import { motion } from "framer-motion";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, Loader2 } from "lucide-react";
import CONFIG from '@/lib/config';

interface NewsPost {
  _id: string;
  title: string;
  summary: string;
  thumbnail: string;
  createdAt: string;
  slug: string;
}

import api from '@/lib/axios';

const NewsSection = () => {
  const [news, setNews] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchNews = async () => {
      try {
        const { data } = await api.get('/posts?limit=3');
        // Cập nhật lấy posts từ object phân trang mới
        setNews(data.posts || []);
      } catch (error) {
        console.error("Lỗi lấy tin tức:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchNews();
  }, []);

  if (loading) {
    return (
      <div className="py-24 flex justify-center">
        <Loader2 className="animate-spin text-destructive" size={40} />
      </div>
    );
  }

  if (news.length === 0) return null;

  return (
    <section className="py-24 bg-secondary/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
            Tin Tức <span className="text-destructive">Thể Thao</span>
          </h2>
          <div className="h-1.5 w-24 bg-destructive mx-auto" />
        </div>

        <div className="flex overflow-x-auto pb-8 md:pb-0 md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8 no-scrollbar snap-x snap-mandatory px-4 md:px-0 -mx-4 md:mx-0">
          {news.map((item, index) => (
            <motion.div
              key={item._id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="w-[280px] md:w-full shrink-0 snap-center"
            >
              <Card className="group h-full overflow-hidden border-none shadow-md hover:shadow-2xl transition-all duration-500 rounded-[2rem]">
                <CardHeader className="p-0 overflow-hidden aspect-[4/3] md:aspect-video cursor-pointer">
                  <img 
                    src={item.thumbnail || 'https://images.unsplash.com/photo-1626224580175-66094142ce3a?q=80&w=600&auto=format&fit=crop'} 
                    alt={item.title} 
                    onClick={() => window.location.href = `/news/${item.slug}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                  />
                </CardHeader>
                <CardContent className="p-6 md:p-8">
                  <div className="flex items-center gap-2 text-muted-foreground text-[10px] md:text-sm font-bold mb-3 md:mb-4">
                    <Calendar className="h-3 w-3 md:h-4 md:w-4 text-destructive" />
                    {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                  </div>
                  <h3 onClick={() => window.location.href = `/news/${item.slug}`} className="text-lg md:text-xl font-black mb-3 md:mb-4 group-hover:text-destructive transition-colors line-clamp-2 uppercase leading-tight cursor-pointer">
                    {item.title}
                  </h3>
                  <p className="text-xs md:text-base text-muted-foreground leading-relaxed mb-4 md:mb-6 line-clamp-3">
                    {item.summary}
                  </p>
                  <Button 
                    variant="link" 
                    className="p-0 h-auto font-black uppercase tracking-widest text-[10px] md:text-xs text-destructive hover:no-underline group-hover:translate-x-2 transition-transform"
                    onClick={() => window.location.href = `/news/${item.slug}`}
                  >
                    Xem thêm →
                  </Button>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default NewsSection;

