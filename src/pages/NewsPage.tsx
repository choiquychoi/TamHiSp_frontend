import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Calendar, 
  ChevronRight, 
  Loader2, 
  Search, 
  ArrowRight, 
  Clock,
  LayoutGrid,
  Filter,
  ChevronLeft
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import api from '@/lib/axios';

interface NewsPost {
  _id: string;
  title: string;
  summary: string;
  thumbnail: string;
  category: string;
  createdAt: string;
  slug: string;
}

const CATEGORIES = ['Tất cả', 'Review sản phẩm', 'Hướng dẫn kỹ thuật', 'Tin tức giải đấu', 'Khuyến mãi'];

const NewsPage = () => {
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [activeCategory, setActiveCategory] = useState('Tất cả');
  
  const fetchPosts = async (page: number, category: string) => {
    setLoading(true);
    try {
      const categoryParam = category !== 'Tất cả' ? `&category=${category}` : '';
      const { data } = await api.get(`/posts?page=${page}&limit=9${categoryParam}`);
      setPosts(data.posts || []);
      setTotalPages(data.pages || 1);
      setCurrentPage(data.page || 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } catch (error) {
      console.error("Lỗi lấy danh sách bài viết:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts(currentPage, activeCategory);
  }, [currentPage, activeCategory]);

  const handleCategoryChange = (cat: string) => {
    setActiveCategory(cat);
    setCurrentPage(1); // Reset về trang 1 khi đổi danh mục
  };

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900">
      <Navbar />

      {/* Hero Header */}
      <section className="relative pt-32 md:pt-40 pb-16 md:pb-32 bg-zinc-950 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <img 
            src="https://images.unsplash.com/photo-1626224580175-66094142ce3a?q=80&w=2000" 
            className="w-full h-full object-cover grayscale" 
            alt="Background" 
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-zinc-950"></div>
        </div>
        
        <div className="container mx-auto px-4 relative z-10 text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <Badge className="mb-4 md:mb-6 bg-destructive hover:bg-destructive px-3 py-1 md:px-4 md:py-1.5 rounded-none uppercase tracking-[0.2em] font-black text-[8px] md:text-[10px]">
              Cộng đồng yêu thể thao
            </Badge>
            <h1 className="text-4xl md:text-7xl font-black text-white uppercase tracking-tighter italic mb-4 md:mb-6 leading-none">
              Tin tức <span className="text-destructive">&</span> Kiến thức
            </h1>
            <p className="max-w-2xl mx-auto text-zinc-400 font-medium text-xs md:text-base uppercase tracking-widest leading-relaxed px-4">
              Cập nhật kỹ thuật đỉnh cao, đánh giá thiết bị chuyên sâu và tin tức nóng hổi.
            </p>
          </motion.div>
        </div>
      </section>

      {/* Categories Filter Bar */}
      <div className="sticky top-20 z-40 bg-white border-b border-zinc-100 shadow-sm">
        <div className="container mx-auto px-4 md:px-8">
          <div className="flex items-center gap-6 md:gap-8 overflow-x-auto py-4 md:py-6 no-scrollbar">
            <div className="flex items-center gap-2 text-zinc-400 shrink-0">
              <Filter size={14} md:size={16} className="text-destructive" />
              <span className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Lọc:</span>
            </div>
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => handleCategoryChange(cat)}
                className={`
                  text-xs font-black uppercase tracking-widest whitespace-nowrap transition-all relative py-2
                  ${activeCategory === cat ? 'text-destructive' : 'text-zinc-400 hover:text-zinc-600'}
                `}
              >
                {cat}
                {activeCategory === cat && (
                  <motion.div 
                    layoutId="activeTab"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-destructive"
                  />
                )}
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-16">
        {loading ? (
          <div className="py-40 flex flex-col items-center justify-center gap-4">
            <Loader2 className="animate-spin text-destructive" size={48} />
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400">Đang tải bài viết...</p>
          </div>
        ) : (
          <>
            {/* Posts Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-16">
              <AnimatePresence mode="popLayout">
                {posts.map((post, index) => (
                  <motion.div
                    key={post._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.4, delay: index * 0.05 }}
                  >
                    <Link to={`/news/${post.slug}`} className="group block">
                      <div className="relative aspect-[16/10] overflow-hidden rounded-3xl mb-6 bg-zinc-100 shadow-[0_20px_50px_rgba(0,0,0,0.05)]">
                        <img 
                          src={post.thumbnail} 
                          alt={post.title} 
                          className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" 
                        />
                        <div className="absolute top-4 left-4">
                          <Badge className="bg-white/90 backdrop-blur-md text-zinc-900 border-none px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-tight shadow-sm">
                            {post.category}
                          </Badge>
                        </div>
                        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                           <div className="w-12 h-12 rounded-full bg-destructive text-white flex items-center justify-center transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                              <ArrowRight size={24} />
                           </div>
                        </div>
                      </div>
                      
                      <div className="space-y-4">
                        <div className="flex items-center gap-4 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                          <div className="flex items-center gap-1.5">
                            <Calendar size={12} className="text-destructive" />
                            {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                          </div>
                          <div className="w-1 h-1 bg-zinc-200 rounded-full"></div>
                          <div className="flex items-center gap-1.5">
                            <Clock size={12} className="text-destructive" />
                            5 phút đọc
                          </div>
                        </div>
                        
                        <h2 className="text-xl font-black uppercase tracking-tighter leading-tight text-zinc-900 group-hover:text-destructive transition-colors line-clamp-2">
                          {post.title}
                        </h2>
                        
                        <p className="text-zinc-500 text-sm font-medium line-clamp-3 leading-relaxed">
                          {post.summary}
                        </p>
                        
                        <div className="pt-2">
                           <span className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-destructive group-hover:gap-4 transition-all">
                              Đọc bài viết <ArrowRight size={14} />
                           </span>
                        </div>
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="mt-24 flex items-center justify-center gap-2">
                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl border-zinc-200 hover:border-destructive hover:text-destructive disabled:opacity-30"
                  onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                  disabled={currentPage === 1}
                >
                  <ChevronLeft size={20} />
                </Button>
                
                <div className="flex items-center gap-2 px-4">
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`
                        w-10 h-10 rounded-xl text-xs font-black transition-all
                        ${currentPage === page 
                          ? 'bg-destructive text-white shadow-lg shadow-destructive/20 scale-110' 
                          : 'bg-zinc-50 text-zinc-400 hover:bg-zinc-100'}
                      `}
                    >
                      {page}
                    </button>
                  ))}
                </div>

                <Button
                  variant="outline"
                  size="icon"
                  className="rounded-xl border-zinc-200 hover:border-destructive hover:text-destructive disabled:opacity-30"
                  onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                  disabled={currentPage === totalPages}
                >
                  <ChevronRight size={20} />
                </Button>
              </div>
            )}

            {posts.length === 0 && (
              <div className="py-40 text-center">
                <LayoutGrid size={48} className="mx-auto text-zinc-100 mb-6" />
                <h3 className="text-xl font-black uppercase text-zinc-300">Chưa có bài viết nào</h3>
                <Button 
                  variant="link" 
                  className="mt-4 text-destructive font-bold uppercase tracking-widest text-xs"
                  onClick={() => setActiveCategory('Tất cả')}
                >
                  Xem tất cả bài viết
                </Button>
              </div>
            )}
          </>
        )}
      </main>

      <Footer />

      <style dangerouslySetInnerHTML={{ __html: `
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}} />
    </div>
  );
};

export default NewsPage;
