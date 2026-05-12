import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Calendar, Tag, ChevronRight, Loader2, Share2, Facebook, Twitter, 
  Link as LinkIcon, ShoppingBag, Search, List, ArrowRight, User, Clock,
  MessageSquare, Heart, Eye
} from "lucide-react";
import { motion, useScroll, useSpring } from "framer-motion";
import SEO from '@/components/SEO';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import CONFIG from '@/lib/config';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  slug: string;
  category: string;
}

interface NewsPost {
  _id: string;
  title: string;
  content: string;
  summary: string;
  thumbnail: string;
  category: string;
  createdAt: string;
  slug: string;
  attachedProducts: Product[];
  author?: string;
  views?: number;
}

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

import api from '@/lib/axios';

const NewsDetail = () => {
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<NewsPost | null>(null);
  const [recentNews, setRecentNews] = useState<NewsPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [toc, setToc] = useState<TOCItem[]>([]);
  const contentRef = useRef<HTMLDivElement>(null);
  
  const { scrollYProgress } = useScroll();
  const scaleX = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        const { data } = await api.get(`/posts/${slug}`);
        
        if (!data.views) data.views = Math.floor(Math.random() * 5000) + 1000;
        
        setPost(data);

        // Lấy danh sách bài viết gần đây
        const { data: recentData } = await api.get('/posts');
        const postsArray = Array.isArray(recentData) ? recentData : (recentData.posts || []);
        setRecentNews(postsArray.filter((item: NewsPost) => item.slug !== slug).slice(0, 5));
        
        window.scrollTo(0, 0);
      } catch (error) {
        console.error("Lỗi lấy chi tiết tin tức:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [slug]);

  useEffect(() => {
    if (post && contentRef.current) {
      const headings = contentRef.current.querySelectorAll('h2, h3');
      const tocItems: TOCItem[] = Array.from(headings).map((heading, index) => {
        const id = `heading-${index}`;
        heading.id = id;
        return {
          id,
          text: heading.textContent || '',
          level: parseInt(heading.tagName.substring(1))
        };
      });
      setToc(tocItems);
    }
  }, [post]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="animate-spin text-destructive" size={48} />
          <p className="font-bold text-sm uppercase tracking-widest text-muted-foreground">Đang tải nội dung...</p>
        </div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center">
        <h2 className="text-2xl font-black uppercase mb-4">Không tìm thấy bài viết</h2>
        <Button asChild className="bg-destructive">
          <Link to="/">Quay lại trang chủ</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white font-sans text-zinc-900 selection:bg-destructive/10 selection:text-destructive">
      <SEO 
        title={post.title}
        description={post.summary || post.content.substring(0, 160).replace(/<[^>]*>/g, '')}
        image={post.thumbnail}
        type="article"
      />
      <Navbar />
      
      <motion.div
        className="fixed top-0 left-0 right-0 h-1 bg-destructive z-[100] origin-left"
        style={{ scaleX }}
      />

      <div className="bg-zinc-50 border-b border-zinc-100 mt-20 sm:mt-24">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center gap-2 text-[10px] sm:text-xs font-bold uppercase tracking-widest text-zinc-400 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <Link to="/" className="hover:text-destructive transition-colors shrink-0">Trang chủ</Link>
            <ChevronRight size={14} className="shrink-0" />
            <Link to="/news" className="hover:text-destructive transition-colors shrink-0">Tin tức</Link>
            <ChevronRight size={14} className="shrink-0" />
            <span className="text-destructive truncate">{post.title}</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 md:py-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          <div className="lg:col-span-8">
            <header className="mb-10">
              <Badge className="mb-4 bg-destructive hover:bg-destructive/90 px-3 py-1 rounded-none uppercase tracking-tighter font-black text-[10px]">
                {post.category}
              </Badge>
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-black uppercase tracking-tighter leading-[1.1] mb-8 text-zinc-950">
                {post.title}
              </h1>
              
              <div className="flex flex-wrap items-center gap-y-4 gap-x-6 text-[11px] font-bold text-zinc-400 uppercase tracking-widest border-b border-zinc-100 pb-8">
                <div className="flex items-center gap-2">
                  <User size={14} className="text-destructive" />
                  <span>{post.author}</span>
                </div>
                <div className="flex items-center gap-2 border-l border-zinc-200 pl-6 hidden sm:flex">
                  <Calendar size={14} className="text-destructive" />
                  <span>
                    {new Date(post.createdAt).toLocaleDateString('vi-VN', {
                      day: '2-digit', month: '2-digit', year: 'numeric'
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 border-l border-zinc-200 pl-6">
                  <Eye size={14} className="text-destructive" />
                  <span>{post.views?.toLocaleString()} lượt xem</span>
                </div>
                <div className="flex items-center gap-4 ml-auto">
                   <div className="flex gap-2">
                      <button className="h-8 w-8 rounded-full flex items-center justify-center bg-blue-600 text-white hover:bg-blue-700 transition-colors">
                        <Facebook size={14} />
                      </button>
                      <button className="h-8 w-8 rounded-full flex items-center justify-center bg-sky-500 text-white hover:bg-sky-600 transition-colors">
                        <Twitter size={14} />
                      </button>
                      <button className="h-8 w-8 rounded-full flex items-center justify-center bg-zinc-100 text-zinc-500 hover:bg-zinc-200 transition-colors">
                        <Share2 size={14} />
                      </button>
                   </div>
                </div>
              </div>
            </header>

            <figure className="mb-12">
              <div className="rounded-2xl overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.1)] aspect-video relative group">
                <img 
                  src={post.thumbnail} 
                  alt={post.title} 
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-1000"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-60"></div>
              </div>
              {post.summary && (
                <figcaption className="mt-6 p-6 bg-zinc-50 border-l-4 border-destructive rounded-r-xl italic text-zinc-600 font-medium leading-relaxed">
                  "{post.summary}"
                </figcaption>
              )}
            </figure>

            <div className="article-body-container">
              <div 
                className="article-body-content"
                ref={contentRef}
                dangerouslySetInnerHTML={{ 
                  __html: post.content.replace(/&nbsp;/g, ' ') 
                }} 
              />
            </div>

            {post.attachedProducts && post.attachedProducts.length > 0 && (
              <div className="mt-20 pt-12 border-t border-zinc-100">
                <div className="flex items-center justify-between mb-10">
                  <h3 className="text-2xl font-black uppercase tracking-tighter flex items-center gap-3">
                    <ShoppingBag className="text-destructive" />
                    Sản phẩm <span className="text-destructive">khuyên dùng</span>
                  </h3>
                  <Button variant="outline" className="rounded-none border-2 border-destructive text-destructive font-black uppercase tracking-widest text-[10px] hover:bg-destructive hover:text-white transition-all">
                    Xem tất cả shop
                  </Button>
                </div>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-8">
                  {post.attachedProducts.map((product) => (
                    <Link key={product._id} to={`/product/${product.slug}`} className="group">
                      <Card className="overflow-hidden border-none shadow-[0_10px_30px_rgba(0,0,0,0.05)] group-hover:shadow-[0_20px_40px_rgba(239,68,68,0.15)] transition-all duration-500 rounded-2xl bg-white">
                        <CardContent className="p-0 flex items-center">
                          <div className="w-2/5 aspect-square overflow-hidden bg-zinc-100 relative">
                            <img 
                              src={product.image} 
                              alt={product.name} 
                              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                            />
                            <div className="absolute inset-0 bg-destructive/10 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="w-3/5 p-6">
                            <Badge className="bg-zinc-100 text-zinc-500 hover:bg-zinc-200 mb-2 rounded-none uppercase text-[8px] font-black border-none px-2 py-0">
                              {product.category}
                            </Badge>
                            <h4 className="font-black uppercase tracking-tighter text-sm line-clamp-2 mb-3 leading-tight group-hover:text-destructive transition-colors">
                              {product.name}
                            </h4>
                            <div className="flex items-center justify-between">
                              <p className="text-destructive font-black text-xl tracking-tighter">
                                {product.price.toLocaleString('vi-VN')}₫
                              </p>
                              <div className="h-8 w-8 rounded-full bg-zinc-950 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 -translate-x-2 group-hover:translate-x-0 transition-all duration-300">
                                <ArrowRight size={14} />
                              </div>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            <div className="mt-20 p-8 rounded-3xl bg-zinc-50 border border-zinc-100 flex flex-col md:flex-row gap-8 items-center md:items-start text-center md:text-left">
               
               <div>
                  <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                    <span className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Chia sẻ bài viết:</span>
                    <div className="flex gap-2">
                       <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full hover:bg-blue-50 hover:text-blue-600"><Facebook size={18} /></Button>
                       <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full hover:bg-sky-50 hover:text-sky-500"><Twitter size={18} /></Button>
                       <Button size="icon" variant="ghost" className="h-9 w-9 rounded-full hover:bg-zinc-200"><LinkIcon size={18} /></Button>
                    </div>
                  </div>
               </div>
            </div>
          </div>

          <aside className="lg:col-span-4 space-y-10 news-sidebar-area">
            
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-400 group-focus-within:text-destructive transition-colors" size={18} />
              <Input 
                type="text"
                placeholder="TÌM KIẾM BÀI VIẾT..." 
                className="pl-12 h-14 rounded-none border-2 border-zinc-100 focus:border-destructive focus-visible:ring-0 font-black text-base tracking-widest uppercase transition-all"
              />
            </div>

            {toc.length > 0 && (
              <Card className="border-none shadow-[0_10px_40px_rgba(0,0,0,0.03)] rounded-3xl overflow-hidden bg-white">
                <div className="bg-zinc-950 p-6 flex items-center gap-3">
                  <List className="text-destructive" size={20} />
                  <h3 className="text-white font-black uppercase tracking-tighter text-lg">Mục lục</h3>
                </div>
                <CardContent className="p-6">
                  <nav className="space-y-1 max-h-[60vh] overflow-y-auto pr-2 custom-scrollbar">
                    {toc.map((item) => (
                      <a 
                        key={item.id} 
                        href={`#${item.id}`}
                        className={`
                          block py-2 text-sm font-medium transition-all hover:text-destructive
                          ${item.level === 3 ? 'ml-6 text-zinc-400 text-xs italic' : 'text-zinc-600'}
                        `}
                        onClick={(e) => {
                          e.preventDefault();
                          document.getElementById(item.id)?.scrollIntoView({ behavior: 'smooth' });
                        }}
                      >
                        <span className="flex items-center gap-2">
                           {item.level === 2 && <span className="w-1.5 h-1.5 bg-destructive rounded-full"></span>}
                           {item.text}
                        </span>
                      </a>
                    ))}
                  </nav>
                </CardContent>
              </Card>
            )}

            <div className="bg-zinc-50 p-8 rounded-3xl border border-zinc-100">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-8 pb-4 border-b-2 border-destructive inline-block">
                Bài viết <span className="text-destructive">mới nhất</span>
              </h3>
              <div className="space-y-8">
                {recentNews.map((item) => (
                  <Link 
                    key={item._id} 
                    to={`/news/${item.slug}`}
                    className="flex gap-4 group"
                  >
                    <div className="w-20 h-20 shrink-0 rounded-2xl overflow-hidden shadow-sm">
                      <img 
                        src={item.thumbnail} 
                        alt={item.title} 
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" 
                      />
                    </div>
                    <div className="flex flex-col justify-center">
                      <h4 className="font-black uppercase tracking-tighter text-xs leading-tight line-clamp-2 group-hover:text-destructive transition-colors">
                        {item.title}
                      </h4>
                      <div className="flex items-center gap-2 mt-2 text-[10px] font-bold text-zinc-400 uppercase tracking-widest">
                        <Clock size={10} className="text-destructive" />
                        {new Date(item.createdAt).toLocaleDateString('vi-VN')}
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            <div className="p-8 rounded-3xl border-2 border-dashed border-zinc-200">
              <h3 className="text-sm font-black uppercase tracking-widest mb-6 flex items-center gap-2">
                <Tag size={16} className="text-destructive" /> TAGS PHỔ BIẾN
              </h3>
              <div className="flex flex-wrap gap-2">
                {['Cầu lông', 'Vợt Victor', 'Giày Yonex', 'Kỹ thuật', 'Căng vợt', 'Quần áo'].map(tag => (
                  <Link key={tag} to="/news" className="px-3 py-1.5 bg-zinc-100 text-[10px] font-black uppercase tracking-tighter text-zinc-500 hover:bg-destructive hover:text-white transition-all rounded-lg">
                    #{tag}
                  </Link>
                ))}
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
      

      <style dangerouslySetInnerHTML={{ __html: `
        .article-body-container {
          max-width: 850px;
          margin: 0 auto;
          width: 100%;
          padding: 0 1.5rem;
        }

        .article-body-content {
          color: #1a1a1a;
          font-size: 1.15rem;
          line-height: 1.85;
          font-family: 'Inter', system-ui, -apple-system, sans-serif;
          word-break: normal !important;
          overflow-wrap: break-word !important;
          word-wrap: break-word !important;
          text-align: left;
        }

        .article-body-content p {
          margin-bottom: 1.8rem !important;
          display: block;
        }

        .article-body-content h2 {
          font-size: 2rem;
          font-weight: 900;
          margin: 4rem 0 1.5rem 0;
          color: #000;
          text-transform: uppercase;
          border-left: 6px solid #ef4444;
          padding-left: 1.5rem;
          line-height: 1.2;
          letter-spacing: -0.02em;
        }

        .article-body-content h3 {
          font-size: 1.5rem;
          font-weight: 800;
          margin: 2.5rem 0 1.2rem 0;
          color: #111;
        }

        .article-body-content img {
          max-width: 100% !important;
          height: auto !important;
          border-radius: 1.5rem;
          margin: 3.5rem auto;
          display: block;
          box-shadow: 0 30px 60px -12px rgba(0, 0, 0, 0.15);
        }

        .article-body-content ul, .article-body-content ol {
          margin-bottom: 1.8rem;
          padding-left: 2.5rem;
        }

        .article-body-content li {
          margin-bottom: 0.8rem;
        }

        .news-sidebar-area h4 {
          word-break: normal !important;
          overflow-wrap: break-word !important;
        }

        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #f8fafc;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #e2e8f0;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #ef4444;
        }
        
        @media (max-width: 768px) {
          .article-body-content {
            font-size: 1.1rem;
            line-height: 1.75;
          }
          .article-body-content h2 {
            font-size: 1.6rem;
            padding-left: 1rem;
          }
        }
      `}} />
    </div>
  );
};

export default NewsDetail;
