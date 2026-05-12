import React, { useState, useEffect, useRef } from 'react';
import { ShoppingCart, Search, Menu, X, Loader2, Phone, Facebook, MessageCircle, Music2, MapPin, Mail } from 'lucide-react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
  SheetClose,
} from "@/components/ui/sheet";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useCart } from '@/context/CartContext';
import axios from 'axios';
import logo from '@/assets/logo.jpg';

import api from '@/lib/axios';

interface IContact {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  socialLinks: {
    facebook?: string;
    zalo?: string;
    tiktok?: string;
    instagram?: string;
  };
}

const Navbar = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [contact, setContact] = useState<IContact | null>(null);
  const searchRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { getItemCount } = useCart();

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const { data } = await api.get('/contact');
        setContact(data);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin Navbar:', error);
      }
    };
    fetchContact();

    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    
    // Click outside to close search
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchOpen(false);
        setSearchResults([]);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  // Live Search Logic
  useEffect(() => {
    const delayDebounceFn = setTimeout(async () => {
      if (searchQuery.trim().length > 1) {
        setIsLoading(true);
        try {
          const { data } = await api.get(`/products?keyword=${searchQuery}&limit=5`);
          setSearchResults(data.products);
        } catch (error) {
          console.error('Search error:', error);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSearchResults([]);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const handleProductClick = (slug: string) => {
    navigate(`/product/${slug}`);
    setIsSearchOpen(false);
    setSearchQuery('');
    setSearchResults([]);
  };

  const navLinks = [
    { name: 'Cầu lông', path: '/category/Cầu lông' },
    { name: 'Pickleball', path: '/category/Pickleball' },
    { name: 'Quần áo', path: '/category/Quần áo' },
    { name: 'Giày', path: '/category/Giày Thể Thao' },
    { name: 'Phụ kiện', path: '/category/Phụ Kiện' },
    { name: 'Tin tức', path: '/news' },
    { name: "Liên Hệ", path: "/contact" },
  ];

  return (
    <nav className={`fixed top-0 left-0 w-full h-20 flex items-center z-50 transition-all duration-300 ${
      isScrolled 
        ? "bg-background/80 backdrop-blur-md border-b shadow-sm" 
        : "bg-background border-b"
    }`}>
      <div className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo */}
        <div className="flex items-center">
          <Link to="/" className="flex items-center gap-3 group">
            <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-destructive group-hover:scale-110 transition-transform duration-300 shadow-lg">
              <img 
                src={logo} 
                alt="Logo Tâm Hí Sports" 
                className="w-full h-full object-cover"
              />
            </div>
            <div className="flex flex-col leading-none">
              <span className="text-xl font-black uppercase tracking-tighter text-orange-500">TâmHí</span>
              <span className="text-sm italic ... font-bold uppercase tracking-[0.2em] text-green-600">Sport</span>
            </div>
          </Link>
        </div>

        {/* Desktop Nav */}
        <div className="hidden lg:block">
          {!isSearchOpen ? (
            <ul className="flex gap-6">
              {navLinks.map((link) => (
                <li key={link.name}>
                  <Link 
                    to={link.path} 
                    className="text-[11px] font-black uppercase tracking-widest hover:text-destructive transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div ref={searchRef} className="relative w-[400px] animate-in slide-in-from-right-4 duration-300">
              <Input
                autoFocus
                placeholder="Tìm kiếm vợt, giày, phụ kiện..."
                className="rounded-full border-2 border-destructive focus-visible:ring-0 h-10 px-6 pr-10 bg-white text-black"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
              <X 
                className="absolute right-3 top-2.5 h-4 w-4 text-zinc-400 cursor-pointer hover:text-destructive" 
                onClick={() => {setIsSearchOpen(false); setSearchQuery('');}}
              />

              {/* Search Results Dropdown */}
              {(searchResults.length > 0 || isLoading) && (
                <div className="absolute top-12 left-0 w-full bg-white rounded-2xl shadow-2xl border border-zinc-100 overflow-hidden z-[60]">
                  {isLoading ? (
                    <div className="p-4 flex items-center justify-center text-zinc-400">
                      <Loader2 className="h-5 w-5 animate-spin mr-2" />
                      <span className="text-xs font-bold uppercase tracking-widest">Đang tìm kiếm...</span>
                    </div>
                  ) : (
                    <div className="p-2">
                      {searchResults.map((product) => (
                        <div 
                          key={product._id}
                          onClick={() => handleProductClick(product.slug)}
                          className="flex items-center gap-4 p-2 hover:bg-zinc-50 rounded-xl cursor-pointer transition-colors text-black"
                        >
                          <img src={product.mainImage} alt={product.name} className="w-10 h-10 object-cover rounded-lg" />
                          <div className="flex flex-col">
                            <span className="text-[10px] font-black uppercase text-destructive tracking-widest leading-none mb-1">{product.brand}</span>
                            <span className="text-xs font-black uppercase tracking-tighter line-clamp-1">{product.name}</span>
                            <span className="text-[10px] font-bold text-zinc-400">{product.price.toLocaleString('vi-VN')}₫</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Icons & Actions */}
        <div className="flex items-center gap-2 md:gap-4">
          {!isSearchOpen && (
            <Button 
              variant="ghost" 
              size="icon" 
              className="hidden sm:flex hover:bg-destructive/5 hover:text-destructive transition-colors"
              onClick={() => setIsSearchOpen(true)}
            >
              <Search className="h-5 w-5" />
            </Button>
          )}
          
          <Button variant="ghost" size="icon" className="relative" asChild>
            <Link to="/cart">
              <ShoppingCart className="h-5 w-5" />
              {getItemCount() > 0 && (
                <Badge className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-[10px] font-bold bg-destructive text-white border-none">
                  {getItemCount()}
                </Badge>
              )}
            </Link>
          </Button>

          {/* Mobile Menu */}
          <div className="lg:hidden">
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="hover:bg-destructive/5 hover:text-destructive">
                  <Menu className="h-6 w-6" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" showCloseButton={false} className="w-full sm:w-[400px] border-l-0 p-0 bg-zinc-950 text-white overflow-hidden">
                {/* Header Decoration */}
                <div className="absolute top-0 right-0 w-64 h-64 bg-destructive/10 blur-[100px] rounded-full -mr-32 -mt-32 pointer-events-none" />
                
                <div className="relative h-full flex flex-col p-6 z-10 overflow-y-auto no-scrollbar">
                  <div className="flex justify-between items-start mb-8">
                    <SheetHeader className="p-0">
                      <SheetTitle className="text-left flex items-center gap-3">
                        <div className="w-9 h-9 rounded-full overflow-hidden border-2 border-destructive">
                          <img src={logo} alt="Logo" className="w-full h-full object-cover" />
                        </div>
                        <div className="flex flex-col leading-none">
                          <span className="text-lg font-black uppercase tracking-tighter text-white">TâmHí</span>
                          <span className="text-[9px] font-bold uppercase tracking-[0.2em] text-green-500 italic">Sports</span>
                        </div>
                      </SheetTitle>
                    </SheetHeader>
                    
                    <SheetClose asChild>
                      <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-destructive transition-all">
                        <X className="h-6 w-6" />
                      </Button>
                    </SheetClose>
                  </div>

                  {/* Mobile Search */}
                  <div className="relative mb-6">
                    <div className="relative group">
                      <Input 
                        placeholder="Tìm sản phẩm..." 
                        className="h-10 rounded-xl border-zinc-800 bg-zinc-900/50 focus:border-destructive text-white placeholder:text-zinc-500 pl-10 text-base transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />
                      <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500 group-focus-within:text-destructive transition-colors" />
                    </div>
                    
                    {/* Live Search Results in Menu */}
                    {searchResults.length > 0 && (
                      <div className="absolute top-12 left-0 w-full bg-zinc-900 rounded-xl border border-zinc-800 shadow-2xl overflow-hidden z-20 max-h-[250px] overflow-y-auto no-scrollbar">
                        {searchResults.map((product) => (
                          <div 
                            key={product._id}
                            onClick={() => handleProductClick(product.slug)}
                            className="flex items-center gap-3 p-2 hover:bg-zinc-800/50 transition-colors border-b border-zinc-800/50 last:border-0"
                          >
                            <img src={product.mainImage} alt={product.name} className="w-8 h-8 object-cover rounded-md" />
                            <div className="flex flex-col">
                              <span className="text-[9px] font-black uppercase text-destructive tracking-widest leading-none mb-1">{product.brand}</span>
                              <span className="text-[11px] font-bold text-white line-clamp-1">{product.name}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Navigation Links with Animation */}
                  <nav className="flex flex-col space-y-1 mb-8">
                    <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-500 mb-2">Danh mục chính</p>
                    {navLinks.map((link, index) => (
                      <motion.div
                        key={link.name}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: 0.1 + index * 0.05 }}
                      >
                        <SheetClose asChild>
                          <Link 
                            to={link.path} 
                            className="group flex items-center justify-between py-2 px-3 rounded-xl hover:bg-white/5 transition-all"
                          >
                            <span className="text-sm font-black uppercase tracking-widest text-zinc-300 group-hover:text-destructive group-hover:translate-x-2 transition-all duration-300">
                              {link.name}
                            </span>
                            <div className="w-6 h-6 rounded-full bg-zinc-900 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                              <span className="text-destructive font-black text-xs">→</span>
                            </div>
                          </Link>
                        </SheetClose>
                      </motion.div>
                    ))}
                  </nav>

                  {/* Hotline & Social Pushed Up */}
                  <div className="flex flex-col gap-6 mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-lg bg-destructive/10 flex items-center justify-center">
                        <Phone className="h-4 w-4 text-destructive" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Hotline hỗ trợ</span>
                        <a href={`tel:${contact?.phone}`} className="text-xs font-black text-white hover:text-destructive transition-colors">
                          {contact?.phone || 'Đang cập nhật...'}
                        </a>
                      </div>
                    </div>
                    <div className="flex gap-3">
                      {contact?.socialLinks.facebook && (
                        <a href={contact.socialLinks.facebook} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-blue-600 hover:text-blue-600 transition-all cursor-pointer group">
                          <Facebook className="h-4 w-4 text-zinc-500 group-hover:text-blue-600" />
                        </a>
                      )}
                      {contact?.socialLinks.zalo && (
                        <a href={`https://zalo.me/${contact.socialLinks.zalo}`} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-blue-400 hover:text-blue-400 transition-all cursor-pointer group">
                          <MessageCircle className="h-4 w-4 text-zinc-500 group-hover:text-blue-400" />
                        </a>
                      )}
                      {contact?.socialLinks.tiktok && (
                        <a href={contact.socialLinks.tiktok} target="_blank" rel="noopener noreferrer" className="w-9 h-9 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center hover:border-pink-500 hover:text-pink-500 transition-all cursor-pointer group">
                          <Music2 className="h-4 w-4 text-zinc-500 group-hover:text-pink-500" />
                        </a>
                      )}
                    </div>
                  </div>

                  {/* New Info Section at the Bottom */}
                  <div className="mt-auto pt-6 border-t border-zinc-900 flex flex-col gap-4">
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                        <MapPin className="h-4 w-4 text-zinc-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Địa chỉ cửa hàng</span>
                        <span className="text-[10px] font-medium text-zinc-300 leading-relaxed">
                          {contact?.address || 'Đang cập nhật...'}
                        </span>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-lg bg-zinc-900 border border-zinc-800 flex items-center justify-center shrink-0">
                        <Mail className="h-4 w-4 text-zinc-500" />
                      </div>
                      <div className="flex flex-col">
                        <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Email liên hệ</span>
                        <a href={`mailto:${contact?.email}`} className="text-[10px] font-medium text-zinc-300 hover:text-destructive transition-colors truncate">
                          {contact?.email || 'Đang cập nhật...'}
                        </a>
                      </div>
                    </div>
                  </div>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
