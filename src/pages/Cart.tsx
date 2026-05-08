import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Trash2, 
  Plus, 
  Minus, 
  ShoppingBag, 
  ArrowLeft, 
  ArrowRight,
  CreditCard,
  Truck,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, getCartTotal, getItemCount } = useCart();

  if (cart.length === 0) {
    return (
      <div className="min-h-screen bg-white">
        <Navbar />
        <main className="container mx-auto px-4 pt-40 pb-20 text-center">
          <div className="max-w-md mx-auto">
            <div className="w-24 h-24 bg-zinc-50 rounded-full flex items-center justify-center mx-auto mb-8">
              <ShoppingBag size={48} className="text-zinc-200" />
            </div>
            <h2 className="text-3xl font-black uppercase tracking-tighter mb-4">Giỏ hàng đang trống</h2>
            <p className="text-zinc-500 mb-8 font-medium">Có vẻ như bạn chưa chọn được sản phẩm ưng ý nào. Hãy quay lại cửa hàng để khám phá nhé!</p>
            <Button asChild className="bg-destructive hover:bg-destructive/90 px-10 py-6 rounded-none font-black uppercase tracking-widest text-xs">
              <Link to="/">Tiếp tục mua sắm</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-50/50">
      <Navbar />
      
      {/* Breadcrumb - Clean */}
      <div className="bg-white border-b border-zinc-100 pt-28 pb-6">
        <div className="container mx-auto px-4">
          <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400">
            <Link to="/" className="hover:text-destructive">Trang chủ</Link>
            <ChevronRight size={12} />
            <span className="text-destructive">Giỏ hàng ({getItemCount()})</span>
          </div>
        </div>
      </div>

      <main className="container mx-auto px-4 py-8 md:py-20">
        <h1 className="text-3xl md:text-6xl font-black uppercase tracking-tighter italic mb-8 md:mb-12">
          Giỏ hàng <span className="text-destructive">của bạn</span>
        </h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
          <div className="lg:col-span-8 space-y-4 md:space-y-6">
            {cart.map((item) => (
              <Card key={item._id} className="overflow-hidden border-none shadow-sm rounded-[1.5rem] md:rounded-[2rem] bg-white group transition-all duration-500">
                <CardContent className="p-0">
                  <div className="flex flex-col sm:flex-row items-center">
                    {/* Ảnh sản phẩm */}
                    <div className="w-full sm:w-40 md:w-48 aspect-square overflow-hidden bg-zinc-50 relative shrink-0">
                      <img 
                        src={item.image} 
                        alt={item.name} 
                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                      />
                    </div>

                    {/* Thông tin sản phẩm */}
                    <div className="flex-1 p-5 md:p-8 w-full">
                      <div className="flex justify-between items-start mb-3 md:mb-4">
                        <div>
                          <Badge className="bg-zinc-100 text-zinc-500 mb-1.5 md:mb-2 rounded-none uppercase text-[7px] md:text-[8px] font-black border-none px-2 py-0">
                            {item.category}
                          </Badge>
                          <Link to={`/product/${item.slug}`}>
                            <h3 className="text-base md:text-lg font-black uppercase tracking-tight group-hover:text-destructive transition-colors line-clamp-1">
                              {item.name}
                            </h3>
                          </Link>
                          {(item.selectedSize || item.selectedColor) && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {item.selectedSize && (
                                <Badge variant="outline" className="rounded-none font-black text-[8px] md:text-[9px] uppercase tracking-widest border-zinc-200">
                                  Size: {item.selectedSize}
                                </Badge>
                              )}
                              {item.selectedColor && (
                                <Badge variant="outline" className="rounded-none font-black text-[8px] md:text-[9px] uppercase tracking-widest border-zinc-200">
                                  Màu: {item.selectedColor}
                                </Badge>
                              )}
                            </div>
                          )}
                        </div>
                        <button 
                          onClick={() => removeFromCart(item._id, item.selectedSize, item.selectedColor)}
                          className="text-zinc-300 hover:text-destructive transition-colors p-2 shrink-0"
                        >
                          <Trash2 size={18} md:size={20} />
                        </button>
                      </div>

                      <div className="flex items-center justify-between gap-4">
                        {/* Bộ tăng giảm số lượng */}
                        <div className="flex items-center bg-zinc-50 rounded-lg p-0.5 border border-zinc-100">
                          <button 
                            onClick={() => updateQuantity(item._id, item.quantity - 1, item.selectedSize, item.selectedColor)}
                            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-400"
                          >
                            <Minus size={14} />
                          </button>
                          <span className="w-8 md:w-10 text-center font-black text-xs md:text-sm">{item.quantity}</span>
                          <button 
                            onClick={() => updateQuantity(item._id, item.quantity + 1, item.selectedSize, item.selectedColor)}
                            className="w-8 h-8 md:w-10 md:h-10 flex items-center justify-center hover:bg-white rounded transition-all text-zinc-400"
                          >
                            <Plus size={14} />
                          </button>
                        </div>

                        {/* Giá tiền */}
                        <div className="text-right">
                          <p className="text-[10px] font-black text-destructive tracking-tighter text-lg md:text-xl">
                            {(item.price * item.quantity).toLocaleString()}₫
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}

            <Link to="/" className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-destructive transition-all mt-6 group">
              <ArrowLeft size={14} className="group-hover:-translate-x-1 transition-transform" /> 
              Tiếp tục mua sắm
            </Link>
          </div>

          {/* CỘT PHẢI: TỔNG KẾT ĐƠN HÀNG */}
          <div className="lg:col-span-4">
            <div className="sticky top-28 space-y-6 md:space-y-8">
              <Card className="border-4 border-zinc-950 shadow-xl rounded-[2rem] overflow-hidden bg-zinc-950 text-white p-6 md:p-8">
                <h3 className="text-xl md:text-2xl font-black uppercase tracking-tighter italic mb-6 md:mb-8 border-b border-zinc-800 pb-4 md:pb-6">
                  Tóm tắt <span className="text-destructive">đơn hàng</span>
                </h3>
                
                <div className="space-y-3 md:space-y-4 mb-8 md:mb-10">
                  <div className="flex justify-between text-zinc-400 font-bold uppercase text-[9px] md:text-[10px] tracking-widest">
                    <span>Số lượng:</span>
                    <span className="text-white">{getItemCount()} món</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 font-bold uppercase text-[9px] md:text-[10px] tracking-widest">
                    <span>Tạm tính:</span>
                    <span className="text-white">{getCartTotal().toLocaleString()}₫</span>
                  </div>
                  <div className="flex justify-between text-zinc-400 font-bold uppercase text-[9px] md:text-[10px] tracking-widest">
                    <span>Vận chuyển:</span>
                    <span className="text-green-500">Free</span>
                  </div>
                </div>

                <div className="pt-4 md:pt-6 border-t border-zinc-800 mb-8 md:mb-10">
                  <div className="flex justify-between items-end">
                    <span className="font-black uppercase tracking-tighter text-xs md:text-sm italic">Tổng cộng:</span>
                    <span className="text-2xl md:text-4xl font-black text-red-500 tracking-tighter leading-none">
                      {getCartTotal().toLocaleString()}₫
                    </span>
                  </div>
                </div>

                <Button asChild className="w-full h-14 md:h-16 bg-red-600 hover:bg-white hover:text-black transition-all rounded-none font-black uppercase tracking-[0.1em] md:tracking-[0.2em] text-[10px] md:text-xs">
                  <Link to="/checkout">
                    Thanh toán ngay
                    <ArrowRight size={16} className="ml-2 md:ml-3" />
                  </Link>
                </Button>
              </Card>

              {/* Trust Badges */}
              <div className="bg-white p-6 md:p-8 rounded-[1.5rem] md:rounded-[2rem] border border-zinc-100 space-y-4 md:space-y-6">
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 shrink-0">
                    <Truck size={20} md:size={24} />
                  </div>
                  <div>
                    <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Giao hàng hỏa tốc</h4>
                    <p className="text-[8px] md:text-[10px] text-zinc-400 font-medium">Trong vòng 24h</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 md:gap-4">
                  <div className="w-10 h-10 md:w-12 md:h-12 rounded-xl bg-zinc-50 flex items-center justify-center text-zinc-400 shrink-0">
                    <ShieldCheck size={20} md:size={24} />
                  </div>
                  <div>
                    <h4 className="text-[9px] md:text-[10px] font-black uppercase tracking-widest">Bảo hành 100%</h4>
                    <p className="text-[8px] md:text-[10px] text-zinc-400 font-medium">Cam kết chất lượng</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default Cart;
