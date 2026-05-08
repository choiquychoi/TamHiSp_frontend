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
        <main className="container mx-auto px-4 pt-32 md:pt-40 pb-20 text-center">
          <div className="max-w-4xl mx-auto">
            {/* SUCCESS HEADER */}
            <div className="text-center mb-12">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-green-50 text-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle2 size={32} md:size={48} />
              </div>
              <h2 className="text-2xl md:text-5xl font-black uppercase tracking-tighter italic mb-4">Cảm ơn bạn. <br/>Đơn hàng <span className="text-destructive">đã được nhận.</span></h2>
              <p className="text-zinc-500 font-medium text-sm">Nhân viên của chúng tôi sẽ sớm liên hệ xác nhận.</p>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] shadow-sm border border-zinc-100 text-left">
              <div className="md:border-r border-zinc-50 pb-2 md:pb-0">
                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1">Mã đơn</p>
                <p className="font-black text-xs md:text-sm uppercase">{placedOrder.orderNumber}</p>
              </div>
              <div className="md:border-r border-zinc-50 pb-2 md:pb-0">
                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1">Ngày đặt</p>
                <p className="font-black text-xs md:text-sm uppercase">{new Date(placedOrder.createdAt).toLocaleDateString('vi-VN')}</p>
              </div>
              <div className="md:border-r border-zinc-50">
                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1">Tổng cộng</p>
                <p className="font-black text-xs md:text-sm text-destructive uppercase">{placedOrder.totalAmount.toLocaleString()}₫</p>
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-1">Thanh toán</p>
                <p className="font-black text-[9px] md:text-[10px] uppercase">{placedOrder.paymentMethod === 'Bank Transfer' ? 'Chuyển khoản' : 'COD'}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 md:gap-8 mb-12 text-left">
              {/* ORDER DETAILS */}
              <div className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-zinc-100">
                <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter italic mb-6 border-b border-zinc-50 pb-4">Chi tiết <span className="text-destructive">đơn hàng</span></h3>
                <div className="space-y-4 md:space-y-6">
                  {placedOrder.items.map((item: any, idx: number) => (
                    <div key={idx} className="flex justify-between items-center gap-3">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 md:w-12 md:h-12 bg-zinc-50 rounded-lg overflow-hidden border border-zinc-50 shrink-0">
                          <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-[10px] md:text-xs font-black uppercase tracking-tighter line-clamp-1">{item.name}</p>
                          {item.variantLabel && (
                            <p className="text-[8px] md:text-[9px] font-bold text-destructive uppercase tracking-widest">{item.variantLabel}</p>
                          )}
                          <p className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest">{item.quantity} x {item.price.toLocaleString()}₫</p>
                        </div>
                      </div>
                      <span className="font-black text-xs md:text-sm tracking-tighter">{(item.price * item.quantity).toLocaleString()}₫</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* ADDRESS INFO */}
              <div className="bg-white p-6 md:p-10 rounded-[1.5rem] md:rounded-[2.5rem] shadow-sm border border-zinc-100 space-y-6 md:space-y-8">
                <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter italic mb-2 border-b border-zinc-50 pb-4">Địa chỉ <span className="text-destructive">giao hàng</span></h3>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-sm font-black uppercase tracking-tight">
                    <User size={16} className="text-destructive" /> {placedOrder.customer.name}
                  </div>
                  <div className="flex items-center gap-3 text-sm font-bold tracking-widest">
                    <Phone size={16} className="text-destructive" /> {placedOrder.customer.phone}
                  </div>
                  <div className="flex items-start gap-3 text-sm font-medium text-zinc-500 leading-relaxed">
                    <MapPin size={16} className="text-destructive shrink-0 mt-0.5" />
                    {placedOrder.customer.address}, {placedOrder.customer.district}, {placedOrder.customer.province}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild className="bg-zinc-950 hover:bg-destructive px-10 h-14 md:h-16 rounded-none font-black uppercase tracking-widest text-[10px] transition-all shadow-xl">
                <Link to="/">Tiếp tục mua sắm</Link>
              </Button>
              <Button asChild variant="outline" className="border-2 border-zinc-200 px-10 h-14 md:h-16 rounded-none font-black uppercase tracking-widest text-[10px]">
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
      
      <div className="bg-white border-b border-zinc-100 pt-24 md:pt-28 pb-4 md:pb-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-[8px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400">
            <Link to="/cart" className="hover:text-destructive transition-colors">Giỏ hàng</Link>
            <ChevronRight size={10} md:size={12} />
            <span className="text-destructive">Thanh toán</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 md:py-16">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8 md:gap-12">
          
          {/* CỘT TRÁI: FORM THÔNG TIN */}
          <div className="lg:col-span-7 space-y-6 md:space-y-10">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic leading-none">
                Thông tin <span className="text-destructive">giao hàng</span>
              </h1>
              <p className="text-zinc-400 font-bold uppercase text-[8px] md:text-[10px] tracking-widest">Giao hàng toàn quốc - Thanh toán khi nhận hàng</p>
            </div>

            <div className="space-y-4 md:space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2 group">
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Họ và tên khách hàng *</label>
                  <div className="relative">
                    <User className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-destructive transition-colors" size={16} />
                    <Input required name="name" value={formData.name} onChange={handleInputChange} placeholder="Nguyễn Văn A" className="h-12 md:h-14 pl-12 rounded-xl md:rounded-2xl border-none shadow-sm focus-visible:ring-2 focus-visible:ring-destructive font-bold text-sm" />
                  </div>
                </div>
                <div className="space-y-2 group">
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Số điện thoại liên hệ *</label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-destructive transition-colors" size={16} />
                    <Input required name="phone" value={formData.phone} onChange={handleInputChange} placeholder="090 251 3939" className="h-12 md:h-14 pl-12 rounded-xl md:rounded-2xl border-none shadow-sm focus-visible:ring-2 focus-visible:ring-destructive font-bold text-sm" />
                  </div>
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Địa chỉ Email (Nếu có)</label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-300 group-focus-within:text-destructive transition-colors" size={16} />
                  <Input type="email" name="email" value={formData.email} onChange={handleInputChange} placeholder="khachhang@gmail.com" className="h-12 md:h-14 pl-12 rounded-xl md:rounded-2xl border-none shadow-sm focus-visible:ring-2 focus-visible:ring-destructive font-bold text-sm" />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                <div className="space-y-2">
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Tỉnh / Thành phố *</label>
                  <select name="province" value={formData.province} onChange={handleInputChange} className="w-full h-12 md:h-14 px-4 rounded-xl md:rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-destructive font-bold text-sm outline-none bg-white">
                    <option value="Hồ Chí Minh">Hồ Chí Minh</option>
                    <option value="Hà Nội">Hà Nội</option>
                    <option value="Đà Nẵng">Đà Nẵng</option>
                    <option value="Khác">Tỉnh thành khác...</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Quận / Huyện *</label>
                  <Input required name="district" value={formData.district} onChange={handleInputChange} placeholder="Quận 1, Quận Bình Thạnh..." className="h-12 md:h-14 rounded-xl md:rounded-2xl border-none shadow-sm focus-visible:ring-2 focus-visible:ring-destructive font-bold text-sm" />
                </div>
              </div>

              <div className="space-y-2 group">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Địa chỉ chi tiết *</label>
                <div className="relative">
                  <MapPin className="absolute left-4 top-5 text-zinc-300 group-focus-within:text-destructive transition-colors" size={16} />
                  <textarea required name="address" value={formData.address} onChange={handleInputChange} placeholder="Số nhà, tên đường, phường/xã..." className="w-full min-h-[80px] md:min-h-[100px] p-4 pl-12 rounded-xl md:rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-destructive font-bold text-sm outline-none bg-white" />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[9px] md:text-[10px] font-black uppercase tracking-widest text-zinc-400 ml-1">Ghi chú cho shipper (Tùy chọn)</label>
                <textarea name="note" value={formData.note} onChange={handleInputChange} placeholder="Ví dụ: Giao ngoài giờ hành chính, gọi trước khi đến..." className="w-full min-h-[80px] md:min-h-[100px] p-4 rounded-xl md:rounded-2xl border-none shadow-sm focus:ring-2 focus:ring-destructive font-bold text-sm outline-none bg-white" />
              </div>
            </div>

            <div className="pt-6 border-t border-zinc-200">
              <h3 className="text-xl font-black uppercase tracking-tighter mb-6 flex items-center gap-3"><CreditCard className="text-destructive" size={24} /> Hình thức <span className="text-destructive">thanh toán</span></h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <label className={`relative p-6 rounded-2xl md:rounded-3xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'COD' ? 'border-destructive bg-destructive/5' : 'border-zinc-100 bg-white hover:border-zinc-200'}`}>
                  <input type="radio" name="paymentMethod" value="COD" checked={formData.paymentMethod === 'COD'} onChange={handleInputChange} className="absolute opacity-0" />
                  <Truck className={`mb-3 ${formData.paymentMethod === 'COD' ? 'text-destructive' : 'text-zinc-300'}`} size={24} />
                  <p className="font-black uppercase tracking-tight text-sm">Giao hàng tận nơi (COD)</p>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase mt-1">Nhận hàng rồi mới trả tiền</p>
                </label>
                <label className={`relative p-6 rounded-2xl md:rounded-3xl border-2 cursor-pointer transition-all ${formData.paymentMethod === 'Bank Transfer' ? 'border-destructive bg-destructive/5' : 'border-zinc-100 bg-white hover:border-zinc-200'}`}>
                  <input type="radio" name="paymentMethod" value="Bank Transfer" checked={formData.paymentMethod === 'Bank Transfer'} onChange={handleInputChange} className="absolute opacity-0" />
                  <CreditCard className={`mb-3 ${formData.paymentMethod === 'Bank Transfer' ? 'text-destructive' : 'text-zinc-300'}`} size={24} />
                  <p className="font-black uppercase tracking-tight text-sm">Chuyển khoản online</p>
                  <p className="text-[9px] text-zinc-400 font-bold uppercase mt-1">Ưu tiên xử lý đơn hàng nhanh</p>
                </label>
              </div>

              {formData.paymentMethod === 'Bank Transfer' && (
                <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-6 md:p-10 bg-zinc-950 text-white rounded-[2rem] border-2 border-zinc-800 shadow-2xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-destructive/10 rounded-full blur-3xl -mr-16 -mt-16" />
                  <div className="space-y-6 relative z-10 text-center md:text-left">
                    <div>
                      <p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Tên chủ tài khoản</p>
                      <p className="text-xl font-black uppercase tracking-tighter italic">VŨ DUY LONG</p>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div><p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Ngân hàng</p><p className="text-sm font-bold uppercase">TPBank (Tiên Phong)</p></div>
                      <div><p className="text-[9px] font-black uppercase tracking-widest text-zinc-500 mb-1">Số tài khoản</p><p className="text-2xl font-black tracking-widest text-destructive">81988886767</p></div>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>
          </div>

          {/* CỘT PHẢI: TÓM TẮT ĐƠN HÀNG */}
          <div className="lg:col-span-5">
            <div className="sticky top-28 space-y-6">
              <Card className="border-none shadow-2xl rounded-[2rem] md:rounded-[3rem] overflow-hidden bg-white p-6 md:p-10">
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic mb-8 border-b border-zinc-50 pb-6">Đơn hàng <span className="text-destructive">của bạn</span></h3>
                <div className="max-h-[300px] overflow-y-auto pr-2 custom-scrollbar space-y-6 mb-10">
                  {cart.map((item) => (
                    <div key={item._id + (item.selectedSize || '') + (item.selectedColor || '')} className="flex gap-4 items-center">
                      <div className="w-12 h-12 md:w-16 md:h-16 rounded-xl overflow-hidden bg-zinc-50 shrink-0 border border-zinc-50"><img src={item.image} alt={item.name} className="w-full h-full object-cover" /></div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-black uppercase tracking-tighter text-[10px] md:text-xs line-clamp-1">{item.name}</h4>
                        <p className="text-[8px] md:text-[9px] font-black text-destructive uppercase tracking-widest">{[item.selectedSize, item.selectedColor].filter(Boolean).join(', ')}</p>
                        <p className="text-[9px] md:text-[10px] font-bold text-zinc-400 uppercase tracking-widest">SL: {item.quantity} x {item.price.toLocaleString()}₫</p>
                      </div>
                      <div className="font-black text-xs md:text-sm text-zinc-900 tracking-tighter shrink-0">{(item.price * item.quantity).toLocaleString()}₫</div>
                    </div>
                  ))}
                </div>
                <div className="space-y-4 pt-6 border-t border-zinc-50 mb-10">
                  <div className="flex justify-between text-zinc-400 font-bold uppercase text-[9px] md:text-[10px] tracking-widest"><span>Tạm tính:</span><span className="text-zinc-900">{getCartTotal().toLocaleString()}₫</span></div>
                  <div className="flex justify-between text-zinc-400 font-bold uppercase text-[9px] md:text-[10px] tracking-widest"><span>Vận chuyển:</span><span className="text-green-500 font-black">Miễn phí</span></div>
                  <div className="flex justify-between items-end pt-4 border-t border-zinc-50"><span className="font-black uppercase tracking-tighter text-xs md:text-sm italic">Tổng cộng:</span><span className="text-3xl md:text-5xl font-black text-red-600 tracking-tighter leading-none">{getCartTotal().toLocaleString()}₫</span></div>
                </div>
                <Button type="submit" disabled={loading} className="w-full h-14 md:h-16 bg-red-600 hover:bg-black transition-all duration-500 rounded-none font-black uppercase tracking-[0.2em] text-[10px] md:text-xs shadow-xl active:scale-95 flex items-center justify-center gap-3">
                  {loading ? <Loader2 className="animate-spin" size={20} /> : 'XÁC NHẬN ĐẶT HÀNG'}
                </Button>
              </Card>

              <Link to="/cart" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-destructive transition-all group">
                <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> Quay lại giỏ hàng
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
