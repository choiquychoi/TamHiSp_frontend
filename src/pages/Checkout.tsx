import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { 
  ChevronRight, 
  MapPin, 
  Phone, 
  Mail, 
  User, 
  CreditCard, 
  Truck,
  ArrowLeft,
  CheckCircle2,
  Loader2,
  Facebook
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import CONFIG from '@/lib/config';

import api from '@/lib/axios';

const Checkout = () => {
  const { cart, getCartTotal, clearCart } = useCart();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState(false);
  const [orderNumber, setOrderNumber] = useState('');
  const [placedOrder, setPlacedOrder] = useState<any>(null);

  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    address: '',
    province: 'Hồ Chí Minh',
    district: '',
    note: '',
    paymentMethod: 'COD' as 'COD' | 'Bank Transfer'
  });

  if (cart.length === 0 && !orderSuccess) {
    navigate('/cart');
    return null;
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const orderData = {
        customer: {
          name: formData.name,
          phone: formData.phone,
          email: formData.email,
          address: formData.address,
          province: formData.province,
          district: formData.district,
          note: formData.note
        },
        items: cart.map(item => ({
          product: item._id,
          name: item.name,
          quantity: item.quantity,
          price: item.price,
          image: item.image,
          variantLabel: [
            item.selectedSize ? `Size: ${item.selectedSize}` : '',
            item.selectedColor ? `Màu: ${item.selectedColor}` : ''
          ].filter(Boolean).join(', ')
        })),
        totalAmount: getCartTotal(),
        paymentMethod: formData.paymentMethod
      };

      const { data } = await api.post('/orders', orderData);

      if (data) {
        setOrderNumber(data.orderNumber);
        setPlacedOrder({
          ...orderData,
          orderNumber: data.orderNumber,
          createdAt: new Date().toISOString()
        });
        setOrderSuccess(true);
        clearCart();
        window.scrollTo(0, 0);
      }
    } catch (error: any) {
      console.error('Lỗi đặt hàng:', error);
      alert(error.response?.data?.message || 'Có lỗi xảy ra khi đặt hàng');
    } finally {
      setLoading(false);
    }
  };

  if (orderSuccess && placedOrder) {
    return (
      <div className="min-h-screen bg-zinc-50/30">
        <Navbar />
        <main className="container mx-auto px-4 pt-40 pb-20">
          <div className="max-w-4xl mx-auto">
            {/* SUCCESS HEADER */}
            <div className="text-center mb-12">
              <div className="w-20 h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={48} />
              </div>
              <h2 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic mb-4">Cảm ơn bạn. <br/>Đơn hàng của bạn <span className="text-destructive">đã được nhận.</span></h2>
              <p className="text-zinc-500 font-medium">Nhân viên của chúng tôi sẽ sớm liên hệ xác nhận với bạn.</p>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-12 bg-white p-8 rounded-[2rem] shadow-sm border border-zinc-100">
              <div className="text-center md:border-r border-zinc-50">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Mã đơn hàng</p>
                <p className="font-black text-sm uppercase">{placedOrder.orderNumber}</p>
              </div>
              <div className="text-center md:border-r border-zinc-50">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Ngày đặt</p>
                <p className="font-black text-sm uppercase">{new Date(placedOrder.createdAt).toLocaleDateString('vi-VN', { month: 'long', day: 'numeric', year: 'numeric' })}</p>
              </div>
              <div className="text-center md:border-r border-zinc-50">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Tổng cộng</p>
                <p className="font-black text-sm text-destructive uppercase">{placedOrder.totalAmount.toLocaleString()}₫</p>
              </div>
              <div className="text-center">
                <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-1">Thanh toán</p>
                <p className="font-black text-[10px] uppercase">{placedOrder.paymentMethod === 'Bank Transfer' ? 'Chuyển khoản' : 'COD'}</p>
              </div>
            </div>

            {/* BANK DETAILS (IF BANK TRANSFER) */}
            {placedOrder.paymentMethod === 'Bank Transfer' && (
              <div className="mb-12">
                <h3 className="text-xl font-black uppercase tracking-tighter italic mb-6 border-b-4 border-destructive inline-block">Thông tin chuyển khoản</h3>
                <div className="bg-zinc-950 text-white p-10 rounded-[2.5rem] relative overflow-hidden shadow-2xl">
                  <div className="absolute top-0 right-0 w-64 h-64 bg-destructive/10 rounded-full blur-[100px] -mr-32 -mt-32" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-10 relative z-10">
                    <div className="space-y-6">
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Chủ tài khoản</p>
                        <p className="text-2xl font-black uppercase italic tracking-tighter">VŨ DUY LONG</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Ngân hàng</p>
                        <p className="text-lg font-bold">TPBank (Tiên Phong Bank)</p>
                      </div>
                      <div>
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 mb-2">Số tài khoản</p>
                        <p className="text-3xl font-black text-destructive tracking-[0.1em]">81988886666</p>
                      </div>
                    </div>
                    <div className="bg-white/5 p-6 rounded-3xl border border-white/10 flex flex-col justify-center text-center space-y-4">
                      <p className="text-sm font-medium leading-relaxed italic text-zinc-400">
                        Vui lòng chuyển khoản đúng số tiền <span className="text-white font-black">{placedOrder.totalAmount.toLocaleString()}₫</span> với nội dung là số điện thoại của bạn.
                      </p>
                      <div className="p-4 bg-white/10 rounded-2xl">
                        <p className="text-[10px] font-black uppercase tracking-widest text-destructive mb-1">Nội dung chuyển khoản</p>
                        <p className="text-xl font-black tracking-widest">{placedOrder.customer.phone}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-12">
              {/* ORDER DETAILS */}
              <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-zinc-100">
                <h3 className="text-xl font-black uppercase tracking-tighter italic mb-8 border-b border-zinc-50 pb-4">Chi tiết <span className="text-destructive">đơn hàng</span></h3>
                <div className="space-y-6">
                  {placedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center gap-4">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-zinc-100 rounded-xl overflow-hidden border border-zinc-50">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div>
                          <p className="text-xs font-black uppercase tracking-tighter line-clamp-1">{item.name}</p>
                          {item.variantLabel && (
                            <p className="text-[9px] font-bold text-destructive uppercase tracking-widest">{item.variantLabel}</p>
                          )}
                          <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.quantity} x {item.price.toLocaleString()}₫</p>
                        </div>
                      </div>
                      <span className="font-black text-sm tracking-tighter">{(item.price * item.quantity).toLocaleString()}₫</span>
                    </div>
                  ))}
                  
                  <div className="pt-6 border-t border-zinc-50 space-y-4">
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      <span>Tạm tính</span>
                      <span className="text-zinc-900">{placedOrder.totalAmount.toLocaleString()}₫</span>
                    </div>
                    <div className="flex justify-between text-[10px] font-black uppercase tracking-widest text-zinc-400">
                      <span>Vận chuyển</span>
                      <span className="text-green-500">Miễn phí</span>
                    </div>
                    <div className="flex justify-between items-end pt-4 border-t border-zinc-50">
                      <span className="text-sm font-black uppercase tracking-tighter italic">Tổng cộng</span>
                      <span className="text-3xl font-black text-destructive tracking-tighter leading-none">{placedOrder.totalAmount.toLocaleString()}₫</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* ADDRESS INFO */}
              <div className="bg-white p-10 rounded-[2.5rem] shadow-sm border border-zinc-100 space-y-10">
                <div className="space-y-6">
                  <h3 className="text-xl font-black uppercase tracking-tighter italic mb-4 border-b border-zinc-50 pb-4">Địa chỉ <span className="text-destructive">giao hàng</span></h3>
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-destructive"><User size={16} /></div>
                      <span className="text-sm font-black uppercase tracking-tight">{placedOrder.customer.name}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-destructive"><Phone size={16} /></div>
                      <span className="text-sm font-bold tracking-widest">{placedOrder.customer.phone}</span>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="w-8 h-8 rounded-full bg-zinc-50 flex items-center justify-center text-destructive mt-1"><MapPin size={16} /></div>
                      <span className="text-sm font-medium text-zinc-500 leading-relaxed">
                        {placedOrder.customer.address}, {placedOrder.customer.district}, {placedOrder.customer.province}
                      </span>
                    </div>
                    {placedOrder.customer.note && (
                      <div className="p-4 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-1">Ghi chú</p>
                        <p className="text-xs font-medium italic text-zinc-500">"{placedOrder.customer.note}"</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-6 border-t border-zinc-50">
                   <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400 mb-4">Mạng xã hội hỗ trợ</h4>
                   <div className="flex gap-3">
                      <a href="https://www.facebook.com/messages/t/1431186217018284" target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center hover:bg-blue-600 hover:text-white transition-all"><Facebook size={18} /></a>
                      <a href="https://zalo.me/0902513939" target="_blank" rel="noreferrer" className="px-4 h-10 rounded-full bg-zinc-50 flex items-center justify-center hover:bg-green-600 hover:text-white transition-all text-[10px] font-black uppercase">Zalo</a>
                      <a href="tel:0902513939" className="w-10 h-10 rounded-full bg-zinc-50 flex items-center justify-center hover:bg-destructive hover:text-white transition-all"><Phone size={18} /></a>
                   </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col md:flex-row gap-4 justify-center">
              <Button asChild className="bg-zinc-950 hover:bg-destructive px-12 h-16 rounded-none font-black uppercase tracking-[0.2em] text-xs transition-all shadow-xl">
                <Link to="/">Tiếp tục mua sắm</Link>
              </Button>
              <Button asChild variant="outline" className="border-2 border-zinc-200 hover:border-destructive px-12 h-16 rounded-none font-black uppercase tracking-[0.2em] text-xs transition-all">
                <Link to="/news">Xem tin tức</Link>
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50 font-sans">
      <Navbar />
      
      <div className="bg-white border-b border-zinc-100 pt-28 pb-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
            <Link to="/cart" className="hover:text-destructive">Giỏ hàng</Link>
            <ChevronRight size={12} />
            <span className="text-destructive">Thanh toán</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-12 md:py-20">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* CỘT TRÁI: FORM THÔNG TIN */}
          <div className="lg:col-span-7 space-y-8">
            <div className="space-y-2">
              <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter italic">
                Thông tin <span className="text-destructive">giao hàng</span>
              </h1>
              <p className="text-zinc-400 font-bold uppercase text-[10px] tracking-widest">Vui lòng điền chính xác thông tin để chúng tôi phục vụ bạn tốt nhất</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Họ và tên *</label>
                <div className="relative group">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-destructive transition-colors" size={18} />
                  <Input 
                    required name="name" value={formData.name} onChange={handleInputChange}
                    placeholder="Nguyễn Văn A" 
                    className="h-14 pl-12 rounded-2xl border-none shadow-sm focus-visible:ring-2 focus-visible:ring-destructive font-bold text-sm"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Số điện thoại *</label>
                <div className="relative group">
                  <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-destructive transition-colors" size={18} />
                  <Input 
                    required name="phone" value={formData.phone} onChange={handleInputChange}
                    placeholder="090xxxxxxx" 
                    className="h-14 pl-12 rounded-2xl border-none shadow-sm focus-visible:ring-2 focus-visible:ring-destructive font-bold text-sm"
                  />
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Email (Nhận thông báo đơn hàng)</label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-destructive transition-colors" size={18} />
                <Input 
                  type="email" name="email" value={formData.email} onChange={handleInputChange}
                  placeholder="example@gmail.com" 
                  className="h-14 pl-12 rounded-2xl border-none shadow-sm focus-visible:ring-2 focus-visible:ring-destructive font-bold text-sm"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Tỉnh / Thành phố *</label>
                <select 
                  name="province" value={formData.province} onChange={handleInputChange}
                  className="w-full h-14 px-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-destructive font-bold text-sm outline-none appearance-none bg-white"
                >
                  <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                  <option value="Hà Nội">Hà Nội</option>
                  <option value="Đà Nẵng">Đà Nẵng</option>
                  <option value="Khác">Tỉnh thành khác...</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Quận / Huyện *</label>
                <Input 
                  required name="district" value={formData.district} onChange={handleInputChange}
                  placeholder="Quận 1, Quận Bình Thạnh..." 
                  className="h-14 rounded-2xl border-none shadow-sm focus-visible:ring-2 focus-visible:ring-destructive font-bold text-sm"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Địa chỉ chi tiết *</label>
              <div className="relative group">
                <MapPin className="absolute left-4 top-6 text-zinc-300 group-focus-within:text-destructive transition-colors" size={18} />
                <textarea 
                  required name="address" value={formData.address} onChange={handleInputChange}
                  placeholder="Số nhà, tên đường..." 
                  className="w-full min-h-[100px] p-4 pl-12 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-destructive font-bold text-sm outline-none bg-white"
                />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Ghi chú đơn hàng</label>
              <textarea 
                name="note" value={formData.note} onChange={handleInputChange}
                placeholder="Ví dụ: Giao vào giờ hành chính, gọi trước khi đến..." 
                className="w-full min-h-[100px] p-4 rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-destructive font-bold text-sm outline-none bg-white"
              />
            </div>

            <div className="pt-8 border-t border-zinc-200">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3">
                <CreditCard className="text-destructive" /> Phương thức <span className="text-destructive">thanh toán</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`relative p-6 rounded-3xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'COD' ? 'border-destructive bg-destructive/5' : 'border-zinc-100 bg-white hover:border-zinc-200'}`}>
                  <input 
                    type="radio" name="paymentMethod" value="COD" 
                    checked={formData.paymentMethod === 'COD'} onChange={handleInputChange}
                    className="absolute opacity-0"
                  />
                  <Truck className={`mb-3 ${formData.paymentMethod === 'COD' ? 'text-destructive' : 'text-zinc-300'}`} size={24} />
                  <p className="font-black uppercase tracking-tight text-sm">Thanh toán khi nhận hàng (COD)</p>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Kiểm tra hàng trước khi thanh toán</p>
                </label>
                <label className={`relative p-6 rounded-3xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'Bank Transfer' ? 'border-destructive bg-destructive/5' : 'border-zinc-100 bg-white hover:border-zinc-200'}`}>
                  <input 
                    type="radio" name="paymentMethod" value="Bank Transfer" 
                    checked={formData.paymentMethod === 'Bank Transfer'} onChange={handleInputChange}
                    className="absolute opacity-0"
                  />
                  <CreditCard className={`mb-3 ${formData.paymentMethod === 'Bank Transfer' ? 'text-destructive' : 'text-zinc-300'}`} size={24} />
                  <p className="font-black uppercase tracking-tight text-sm">Chuyển khoản ngân hàng</p>
                  <p className="text-[10px] text-zinc-400 font-bold uppercase mt-1">Ưu tiên xử lý đơn hàng nhanh nhất</p>
                </label>
              </div>

              {/* THÔNG TIN CHUYỂN KHOẢN HIỆN RA KHI CHỌN BANK TRANSFER */}
              {formData.paymentMethod === 'Bank Transfer' && (
                <motion.div 
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="mt-6 p-8 bg-zinc-950 text-white rounded-[2rem] border-2 border-zinc-800 shadow-2xl relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full blur-3xl -mr-16 -mt-16" />
                  
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-destructive mb-6 flex items-center gap-2">
                    <div className="w-1.5 h-1.5 rounded-full bg-destructive animate-pulse" />
                    Thông tin tài khoản thanh toán
                  </h4>
                  
                  <div className="space-y-6 relative z-10">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Chủ tài khoản</p>
                      <p className="text-xl font-black uppercase tracking-tighter">VŨ DUY LONG</p>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Ngân hàng</p>
                        <p className="text-sm font-bold">TPBank (Tiên Phong)</p>
                      </div>
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Số tài khoản</p>
                        <p className="text-xl font-black tracking-widest text-destructive">81988886767</p>
                      </div>

                    </div>

                    <div className="pt-4 border-t border-zinc-800">
                      <p className="text-[10px] font-medium text-zinc-400 italic">
                        * Nội dung chuyển khoản: <span className="text-white font-bold">SDT + Ho Ten</span>. 
                        Đơn hàng sẽ được xác nhận ngay sau khi nhận được tiền.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-8">
              <Card className="border-none shadow-[0_30px_60px_rgba(0,0,0,0.08)] rounded-[2.5rem] overflow-hidden bg-white p-8">
                <h3 className="text-2xl font-black uppercase tracking-tighter italic mb-8 border-b border-zinc-50 pb-6">
                  Tóm tắt <span className="text-destructive">đơn hàng</span>
                </h3>
                
                <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-6 mb-8">
                  {cart.map((item) => (
                    <div key={item._id + (item.selectedSize || '') + (item.selectedColor || '')} className="flex gap-4 items-center">
                      <div className="w-16 h-16 rounded-xl overflow-hidden bg-zinc-100 border border-zinc-50 shrink-0">
                        <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black uppercase tracking-tighter text-xs line-clamp-1">{item.name}</h4>
                        {(item.selectedSize || item.selectedColor) && (
                          <p className="text-[9px] font-black text-destructive uppercase tracking-widest">
                            {[
                              item.selectedSize ? `Size: ${item.selectedSize}` : '',
                              item.selectedColor ? `Màu: ${item.selectedColor}` : ''
                            ].filter(Boolean).join(', ')}
                          </p>
                        )}
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest">SL: {item.quantity} x {item.price.toLocaleString()}₫</p>
                      </div>
                      <div className="font-black text-sm text-zinc-900 tracking-tighter">
                        {(item.price * item.quantity).toLocaleString()}₫
                      </div>
                    </div>
                  ))}
                </div>

                <div className="space-y-4 pt-6 border-t border-zinc-50 mb-10">
                  <div className="flex justify-between text-zinc-400 font-bold uppercase text-[10px] tracking-widest">
                    <span>Tổng tiền hàng:</span>
                    <span className="text-zinc-900">{getCartTotal().toLocaleString()}₫</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 font-bold uppercase text-[10px] tracking-widest">
                    <span>Phí vận chuyển:</span>
                    <span className="text-green-500 font-black">Miễn phí</span>
                  </div>
                  <div className="flex justify-between items-end pt-4">
                    <span className="font-black uppercase tracking-tighter text-sm italic">Tổng cộng:</span>
                    <span className="text-3xl font-black text-destructive tracking-tighter leading-none">
                      {getCartTotal().toLocaleString()}₫
                    </span>
                  </div>
                </div>

                <Button 
                  type="submit" disabled={loading}
                  className="w-full h-16 bg-destructive hover:bg-zinc-900 transition-all duration-500 rounded-none font-black uppercase tracking-[0.2em] text-xs shadow-2xl shadow-destructive/20 active:scale-95 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader2 className="animate-spin" size={20} />
                      Đang xử lý...
                    </>
                  ) : (
                    <>Xác nhận đặt hàng</>
                  )}
                </Button>

                {/* SUPPORT BOX INSPIRED BY WATCHSTORE */}
                <div className="mt-8 p-6 bg-zinc-50 rounded-2xl border border-dashed border-zinc-200 space-y-4">
                  <p className="text-[11px] font-bold text-zinc-600 leading-relaxed text-center italic">
                    "Nếu bạn không đặt được hàng, vui lòng nhắn tin Messenger, Chat Zalo hoặc liên hệ Hotline: <span className="text-destructive font-black">090 251 39 39</span>"
                  </p>
                  
                  <div className="grid grid-cols-3 gap-3">
                    <a 
                      href="https://www.facebook.com/messages/t/1431186217018284" target="_blank" rel="noreferrer"
                      className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-zinc-100 hover:border-blue-500 hover:shadow-md transition-all group"
                    >
                      <img src="https://upload.wikimedia.org/wikipedia/commons/b/be/Facebook_Messenger_logo_2020.svg" alt="Messenger" className="w-6 h-6" />
                      <span className="text-[9px] font-black uppercase tracking-tighter text-zinc-400 group-hover:text-blue-500">Messenger</span>
                    </a>
                    <a 
                      href="https://zalo.me/0902513939" target="_blank" rel="noreferrer"
                      className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-zinc-100 hover:border-blue-400 hover:shadow-md transition-all group"
                    >
                      <img src="https://upload.wikimedia.org/wikipedia/commons/9/91/Icon_of_Zalo.svg" alt="Zalo" className="w-6 h-6" />
                      <span className="text-[9px] font-black uppercase tracking-tighter text-zinc-400 group-hover:text-blue-400">Chat Zalo</span>
                    </a>
                    <a 
                      href="tel:0902513939"
                      className="flex flex-col items-center gap-2 p-3 bg-white rounded-xl border border-zinc-100 hover:border-destructive hover:shadow-md transition-all group"
                    >
                      <div className="w-6 h-6 flex items-center justify-center bg-destructive rounded-full text-white">
                        <Phone size={12} fill="currentColor" />
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-tighter text-zinc-400 group-hover:text-destructive">Hotline</span>
                    </a>
                  </div>
                </div>

                {/* TRUST BADGES */}
                <div className="mt-8 grid grid-cols-2 gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center shrink-0">
                      <CheckCircle2 size={16} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Hàng chính hãng 100%</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center shrink-0">
                      <Truck size={16} />
                    </div>
                    <span className="text-[9px] font-black uppercase tracking-widest text-zinc-500">Giao hàng toàn quốc</span>
                  </div>
                </div>

                <p className="text-[9px] text-center text-zinc-400 font-bold uppercase mt-8 tracking-widest border-t border-zinc-50 pt-6">
                  Bằng cách nhấn nút đặt hàng, bạn đồng ý với các <br/>
                  <Link to="/" className="text-destructive underline">điều khoản mua hàng</Link> của chúng tôi
                </p>
              </Card>

              <Link to="/cart" className="inline-flex items-center gap-3 text-xs font-black uppercase tracking-widest text-zinc-400 hover:text-destructive transition-all group">
                <ArrowLeft size={16} className="group-hover:-translate-x-2 transition-transform" /> 
                Quay lại giỏ hàng
              </Link>
            </div>
          </div>
        </form>
      </main>

      <Footer />
      
      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar { width: 4px; }
        .custom-scrollbar::-webkit-scrollbar-track { background: #f1f1f1; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #ef4444; border-radius: 10px; }
      `}} />
    </div>
  );
};

export default Checkout;
