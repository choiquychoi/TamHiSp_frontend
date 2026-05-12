import React, { useState, useEffect } from 'react';
import { Phone, MessageCircle, Facebook, X, Plus, MessagesSquare } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '@/lib/axios';

interface IContact {
  phone: string;
  socialLinks: {
    facebook?: string;
    zalo?: string;
  };
}

const QuickContact: React.FC = () => {
  const [contact, setContact] = useState<IContact | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const { data } = await api.get('/contact');
        setContact(data);
      } catch (error) {
        console.error('Lỗi lấy thông tin liên hệ nhanh:', error);
      }
    };
    fetchContact();
  }, []);

  if (!contact) return null;

  const phoneNoSpace = contact.phone.replace(/\s/g, '');

  return (
    <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
      {/* Container cho các bong bóng liên hệ */}
      <AnimatePresence>
        {isOpen && (
          <motion.div 
            initial={{ opacity: 0, y: 20, scale: 0.8 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.8 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            className="flex flex-col gap-4 items-end mb-2"
          >
            {/* MESSENGER BUBBLE */}
            {contact.socialLinks.facebook && (
              <motion.a 
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                href={contact.socialLinks.facebook}
                target="_blank" 
                rel="noreferrer"
                className="group relative flex items-center gap-3"
              >
                <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white text-zinc-900 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-xl border border-zinc-100 whitespace-nowrap">
                  Chat Messenger
                </span>
                <div className="w-12 h-12 md:w-14 md:h-14 bg-blue-600 text-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(37,99,235,0.4)] transition-all">
                  <img src="https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg" alt="Messenger" className="w-6 h-6 md:w-7 md:h-7 brightness-0 invert" />
                </div>
              </motion.a>
            )}

            {/* ZALO BUBBLE */}
            <motion.a 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={`https://zalo.me/${phoneNoSpace}`}
              target="_blank" 
              rel="noreferrer"
              className="group relative flex items-center gap-3"
            >
              <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white text-zinc-900 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-xl border border-zinc-100 whitespace-nowrap">
                Chat Zalo
              </span>
              <div className="w-12 h-12 md:w-14 md:h-14 bg-[#008fe5] text-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(0,143,229,0.4)] transition-all">
                <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" alt="Zalo" className="w-6 h-6 md:w-7 md:h-7 brightness-0 invert" />
              </div>
            </motion.a>

            {/* HOTLINE BUBBLE */}
            <motion.a 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              href={`tel:${phoneNoSpace}`}
              className="group relative flex items-center gap-3"
            >
              <span className="opacity-0 group-hover:opacity-100 transition-all duration-300 bg-white text-zinc-900 text-[10px] font-black uppercase tracking-widest px-4 py-2 rounded-full shadow-xl border border-zinc-100 whitespace-nowrap">
                Hotline: {contact.phone}
              </span>
              <div className="relative w-12 h-12 md:w-14 md:h-14 bg-destructive text-white rounded-full flex items-center justify-center shadow-[0_10px_30px_rgba(239,68,68,0.4)] transition-all overflow-hidden">
                <div className="absolute inset-0 bg-white/20 animate-ping rounded-full" />
                <Phone size={20} className="md:w-6 md:h-6 relative z-10" fill="currentColor" />
              </div>
            </motion.a>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Nút Trigger (Ô bé bé) */}
      <motion.button
        onClick={() => setIsOpen(!isOpen)}
        whileHover={{ scale: 1.1 }}
        whileTap={{ scale: 0.9 }}
        className={`w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center shadow-2xl transition-all duration-500 ${
          isOpen ? 'bg-zinc-900 text-white rotate-90' : 'bg-destructive text-white'
        }`}
      >
        {isOpen ? <X size={24} /> : <MessagesSquare size={24} />}
      </motion.button>
    </div>
  );
};

export default QuickContact;
