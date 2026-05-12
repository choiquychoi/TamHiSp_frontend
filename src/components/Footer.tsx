import React, { useState, useEffect } from 'react';
import { Phone, Mail, MapPin, Send, Facebook, Instagram, Youtube, MessageCircle } from 'lucide-react';
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Link } from 'react-router-dom';
import CONFIG from '@/lib/config';
import logo from '@/assets/logo.jpg';

interface IContact {
  companyName: string;
  address: string;
  phone: string;
  email: string;
  mapUrl: string;
  socialLinks: {
    facebook?: string;
    zalo?: string;
    tiktok?: string;
    instagram?: string;
  };
}

import api from '@/lib/axios';

const Footer = () => {
  const [contact, setContact] = useState<IContact | null>(null);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const { data } = await api.get('/contact');
        setContact(data);
      } catch (error) {
        console.error('Lỗi khi lấy thông tin Footer:', error);
      }
    };
    fetchContact();
  }, []);

  return (
    <footer className="bg-zinc-950 text-white pt-0">
      {/* Newsletter Section */}
      <div className="bg-zinc-900/50 border-y border-zinc-800 py-16">
        <div className="container mx-auto px-4 flex flex-col lg:flex-row justify-between items-center gap-12">
          <div className="text-center lg:text-left">
            <h3 className="text-2xl md:text-3xl font-black uppercase tracking-tighter mb-4">
              Đăng ký nhận <span className="text-destructive">tin mới nhất</span>
            </h3>
            <p className="text-zinc-400 font-medium max-w-md">
              Nhận thông tin về sản phẩm mới, sự kiện và khuyến mãi hấp dẫn từ {contact?.companyName || 'Tâm Hí Sports'}.
            </p>
          </div>
          <div className="flex w-full max-w-md group">
            <Input 
              type="email" 
              placeholder="Nhập email của bạn..." 
              className="h-14 rounded-r-none border-zinc-700 bg-zinc-800/50 focus:ring-destructive focus:border-destructive text-white placeholder:text-zinc-500 text-base"
            />
            <Button className="h-14 px-8 rounded-l-none bg-destructive hover:bg-destructive/90 font-black uppercase tracking-widest transition-all">
              <Send className="h-5 w-5 mr-2" />
              Đăng ký
            </Button>
          </div>
        </div>
      </div>

      {/* Main Footer Content */}
      <div className="container mx-auto px-4 py-20">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-y-16 gap-x-8 text-center md:text-left">
          {/* Brand Info - Chiếm trọn 2 cột trên mobile */}
          <div className="col-span-2 md:col-span-3 lg:col-span-1 flex flex-col items-center md:items-start order-1">
            <Link to="/" className="flex items-center gap-4 mb-8 group">
              <div className="w-14 h-14 rounded-full overflow-hidden border-2 border-destructive shadow-xl">
                <img 
                  src={logo} 
                  alt={`Logo ${contact?.companyName || 'Tâm Hí Sports'}`} 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col text-left">
                <span className="text-xl font-black uppercase tracking-tighter text-destructive">
                  {contact?.companyName ? contact.companyName.split(' ')[0] : 'Tâm'}
                  {contact?.companyName && contact.companyName.split(' ').length > 1 ? contact.companyName.split(' ')[1] : 'Hí'}
                </span>
                <span className="text-xs font-bold uppercase tracking-widest text-green-500">
                  {contact?.companyName && contact.companyName.split(' ').length > 2 ? contact.companyName.split(' ').slice(2).join(' ') : 'Sports'}
                </span>
              </div>
            </Link>
            <p className="text-zinc-400 text-sm leading-relaxed mb-8 font-medium max-w-sm md:max-w-none">
              Hệ thống phân phối dụng cụ thể thao chuyên nghiệp hàng đầu. Chuyên cung cấp Vợt Cầu Lông, Pickleball, Giày và Phụ kiện chính hãng.
            </p>
            <div className="flex gap-4">
              {contact?.socialLinks.facebook && (
                <a 
                  href={contact.socialLinks.facebook} 
                  target="_blank"
                  className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 hover:bg-destructive hover:border-destructive transition-all duration-300 group"
                  title="Facebook"
                >
                  <Facebook className="h-5 w-5 text-zinc-400 group-hover:text-white" />
                </a>
              )}
              {contact?.socialLinks.instagram && (
                <a 
                  href={contact.socialLinks.instagram} 
                  target="_blank"
                  className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 hover:bg-destructive hover:border-destructive transition-all duration-300 group"
                  title="Instagram"
                >
                  <Instagram className="h-5 w-5 text-zinc-400 group-hover:text-white" />
                </a>
              )}
              {contact?.socialLinks.zalo && (
                <a 
                  href={`https://zalo.me/${contact.socialLinks.zalo}`} 
                  target="_blank"
                  className="w-10 h-10 rounded-full bg-zinc-900 flex items-center justify-center border border-zinc-800 hover:bg-destructive hover:border-destructive transition-all duration-300 group"
                  title="Zalo"
                >
                  <MessageCircle className="h-5 w-5 text-zinc-400 group-hover:text-white" />
                </a>
              )}
            </div>
          </div>

          {/* Quick Links - Chia 2 cột trên mobile */}
          <div className="col-span-1 flex flex-col items-center md:items-start order-2 md:order-3">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 md:mb-8 text-white relative">
              Sản phẩm
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 w-8 h-1 bg-destructive rounded-full" />
            </h3>
            <ul className="space-y-4 pt-2">
              {[
                { name: "Cầu lông", path: "/category/Cầu lông" },
                { name: "Pickleball", path: "/category/Pickleball" },
                { name: "Quần áo", path: "/category/Quần áo" },
                { name: "Giày Thể Thao", path: "/category/Giày Thể Thao" },
              ].map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-zinc-400 hover:text-destructive transition-colors text-sm font-medium">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="col-span-1 flex flex-col items-center md:items-start order-3 md:order-4">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-6 md:mb-8 text-white relative">
              Công ty
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 w-8 h-1 bg-destructive rounded-full" />
            </h3>
            <ul className="space-y-4 pt-2">
              {[
                { name: "Giới thiệu", path: "/" },
                { name: "Tin tức", path: "/news" },
                { name: "Liên hệ", path: "/contact" },
                { name: "Đổi trả", path: "/contact" }
              ].map(link => (
                <li key={link.name}>
                  <Link to={link.path} className="text-zinc-400 hover:text-destructive transition-colors text-sm font-medium">{link.name}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info - Chiếm trọn 2 cột trên mobile */}
          <div className="col-span-2 md:col-span-3 lg:col-span-2 flex flex-col items-center md:items-start order-4 md:order-2 border-t border-zinc-900 md:border-none pt-12 md:pt-0">
            <h3 className="text-sm font-black uppercase tracking-[0.2em] mb-8 text-white relative">
              Liên hệ trực tiếp
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 md:left-0 md:translate-x-0 w-12 h-1 bg-destructive rounded-full" />
            </h3>
            <ul className="space-y-6 w-full max-w-sm md:max-w-none pt-2">
              <li className="flex flex-col md:flex-row items-center md:items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <MapPin className="h-5 w-5 text-destructive" />
                </div>
                <span className="text-zinc-400 text-sm font-medium">{contact?.address || 'Số 123, Đường ABC, TP. Hồ Chí Minh'}</span>
              </li>
              <li className="flex flex-col md:flex-row items-center md:items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <Phone className="h-5 w-5 text-destructive" />
                </div>
                <a href={`tel:${contact?.phone}`} className="text-zinc-400 text-lg font-black hover:text-destructive transition-colors">{contact?.phone || '0901234567'}</a>
              </li>
              <li className="flex flex-col md:flex-row items-center md:items-start gap-3">
                <div className="w-10 h-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                  <Mail className="h-5 w-5 text-destructive" />
                </div>
                <a href={`mailto:${contact?.email}`} className="text-zinc-400 text-sm font-medium hover:text-destructive transition-colors truncate">{contact?.email || 'tamhisports@gmail.com'}</a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Footer Bottom */}
      <div className="border-t border-zinc-900 py-8 bg-zinc-950">
        <div className="container mx-auto px-4 flex flex-col md:row justify-between items-center gap-6">
          <p className="text-zinc-500 text-xs font-medium text-center md:text-left">
            &copy; {new Date().getFullYear()} {contact?.companyName || 'Tâm Hí Sports'}. All Rights Reserved.
          </p>
          <div className="flex gap-3">
            {["VISA", "MASTERCARD", "MOMO", "VNPAY"].map(tag => (
              <Badge key={tag} variant="secondary" className="bg-zinc-900 hover:bg-zinc-800 text-zinc-400 border-zinc-800 font-bold text-[10px] px-2 py-0.5 uppercase tracking-wider">
                {tag}
              </Badge>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
