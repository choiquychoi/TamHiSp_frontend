import React, { useState, useEffect } from 'react';
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, MessageCircle, Navigation } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CONFIG from '@/lib/config';

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
  seoTitle: string;
  seoDescription: string;
}

import api from '@/lib/axios';

const Contact: React.FC = () => {
  const [contact, setContact] = useState<IContact | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const { data } = await api.get('/contact');
        setContact(data);
        if (data) {
          document.title = data.seoTitle || 'Liên hệ | Tâm Hí Sports';
        }
      } catch (error) {
        console.error('Lỗi tải thông tin liên hệ:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchContact();
    window.scrollTo(0, 0);
  }, []);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-black text-red-600 animate-pulse uppercase tracking-[0.3em]">Kết nối shop...</div>;

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <Navbar />

      {/* HERO SECTION */}
      <section className="relative pt-32 md:pt-40 pb-20 md:pb-32 bg-gray-950 overflow-hidden">
        <div className="absolute inset-0 opacity-20">
          <div className="absolute top-0 left-0 w-96 h-96 bg-red-600 rounded-full blur-[150px] -translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-600 rounded-full blur-[150px] translate-x-1/2 translate-y-1/2" />
        </div>
        
        <div className="max-w-7xl mx-auto px-4 relative z-10 text-center space-y-4 md:space-y-6">
          <h1 className="text-5xl md:text-9xl font-black text-white uppercase tracking-tighter italic leading-none">
            Get In <span className="text-red-600 underline md:decoration-8 underline-offset-8">Touch</span>
          </h1>
          <p className="text-gray-400 max-w-2xl mx-auto font-bold text-sm md:text-xl uppercase tracking-widest opacity-80 px-4">
            Tâm Hí Sports • {contact?.companyName}
          </p>
        </div>
      </section>

      <main className="max-w-7xl mx-auto px-4 -mt-12 md:-mt-20 relative z-20 pb-16 md:pb-32">
        {/* BIG CONTACT CARDS */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6 mb-8 md:mb-12">
          
          {/* Hotline */}
          <a href={`tel:${contact?.phone}`} className="group bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-gray-50 flex flex-col items-center text-center transition-all hover:-translate-y-2">
            <div className="p-4 md:p-6 bg-red-50 text-red-600 rounded-2xl md:rounded-[2rem] mb-4 md:mb-6 group-hover:bg-red-600 group-hover:text-white transition-all">
              <Phone size={24} md:size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-1 md:mb-2">Đường dây nóng</h3>
            <p className="text-xl md:text-3xl font-black text-gray-900 tracking-tighter italic">{contact?.phone}</p>
          </a>

          {/* Social / Zalo */}
          <div className="group bg-gray-950 p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl flex flex-col items-center text-center text-white transition-all hover:-translate-y-2">
            <div className="p-4 md:p-6 bg-white/10 text-red-600 rounded-2xl md:rounded-[2rem] mb-4 md:mb-6">
              <MessageCircle size={24} md:size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-[8px] md:text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-3 md:mb-4">Mạng xã hội</h3>
            <div className="flex space-x-3 md:space-x-4">
              {contact?.socialLinks.facebook && (
                <a href={contact.socialLinks.facebook} target="_blank" className="p-3 md:p-4 bg-white/5 rounded-xl md:rounded-2xl hover:bg-blue-600 transition-all">
                  <Facebook size={18} md:size={20} />
                </a>
              )}
              {contact?.socialLinks.zalo && (
                <a href={`https://zalo.me/${contact.socialLinks.zalo}`} target="_blank" className="px-4 md:px-6 py-3 md:py-4 bg-white/5 rounded-xl md:rounded-2xl hover:bg-green-600 transition-all font-black text-[10px] md:text-xs uppercase tracking-tighter">
                  Zalo
                </a>
              )}
            </div>
          </div>

          {/* Email */}
          <a href={`mailto:${contact?.email}`} className="group bg-white p-6 md:p-10 rounded-[2rem] md:rounded-[3rem] shadow-2xl border border-gray-50 flex flex-col items-center text-center transition-all hover:-translate-y-2">
            <div className="p-4 md:p-6 bg-blue-50 text-blue-600 rounded-2xl md:rounded-[2rem] mb-4 md:mb-6 group-hover:bg-blue-600 group-hover:text-white transition-all">
              <Mail size={24} md:size={32} strokeWidth={2.5} />
            </div>
            <h3 className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] md:tracking-[0.3em] mb-1 md:mb-2">Email hỗ trợ</h3>
            <p className="text-sm md:text-lg font-black text-gray-900 tracking-tight lowercase truncate w-full">{contact?.email}</p>
          </a>
        </div>

        {/* FULL WIDTH INFO & MAP */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 md:gap-8">
          {/* Address Card */}
          <div className="lg:col-span-2 bg-white p-8 md:p-12 rounded-[2rem] md:rounded-[3.5rem] shadow-2xl border border-gray-50 flex flex-col justify-center">
            <div className="space-y-8 md:space-y-10">
              <div className="flex items-start space-x-4 md:space-x-6">
                <div className="p-3 md:p-4 bg-gray-50 text-gray-900 rounded-xl md:rounded-2xl shrink-0"><MapPin size={20} md:size={24} /></div>
                <div>
                  <h4 className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 md:mb-2">Địa chỉ cửa hàng</h4>
                  <p className="text-lg md:text-xl font-bold text-gray-900 leading-tight">{contact?.address}</p>
                </div>
              </div>
              <div className="flex items-start space-x-4 md:space-x-6">
                <div className="p-3 md:p-4 bg-gray-50 text-gray-900 rounded-xl md:rounded-2xl shrink-0"><Clock size={20} md:size={24} /></div>
                <div>
                  <h4 className="text-[8px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-1 md:mb-2">Lịch làm việc</h4>
                  <p className="text-lg md:text-xl font-bold text-gray-900 leading-tight">08:00 AM - 21:00 PM<br/>Thứ 2 - Chủ Nhật</p>
                </div>
              </div>
              <button className="flex items-center space-x-2 md:space-x-3 text-red-600 font-black uppercase text-[10px] md:text-xs tracking-widest hover:translate-x-2 transition-transform">
                <span>Chỉ đường Google Maps</span>
                <Navigation size={14} md:size={16} />
              </button>
            </div>
          </div>

          {/* Map Section */}
          <div className="lg:col-span-3 h-[300px] md:h-[500px] rounded-[2rem] md:rounded-[3.5rem] overflow-hidden shadow-2xl border-4 md:border-8 border-white">
            {contact?.mapUrl ? (
              <iframe 
                src={contact.mapUrl} 
                className="w-full h-full border-none grayscale hover:grayscale-0 transition-all duration-1000" 
                loading="lazy" 
              />
            ) : (
              <div className="w-full h-full bg-gray-50 flex items-center justify-center font-black text-gray-200 uppercase tracking-[0.5em]">Map Loading...</div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Contact;
