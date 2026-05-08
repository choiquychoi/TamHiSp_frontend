import React, { useState, useEffect } from 'react';
import { 
  Package, 
  Search, 
  Eye, 
  CheckCircle2, 
  Truck, 
  XCircle, 
  Clock,
  Filter,
  ArrowUpDown,
  MoreVertical,
  ExternalLink,
  Phone,
  MapPin,
  Mail,
  User,
  ShoppingBag,
  Trash2,
  ChevronLeft,
  ChevronRight,
  CreditCard
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Card, 
  CardContent, 
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import api from '@/lib/axios';

interface IOrder {
  _id: string;
  orderNumber: string;
  customer: {
    name: string;
    phone: string;
    email: string;
    address: string;
    province: string;
    district: string;
    note?: string;
  };
  items: any[];
  totalAmount: number;
  paymentMethod: string;
  status: 'Pending' | 'Confirmed' | 'Shipping' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

const statusConfig = {
  Pending: { label: 'Đang chờ', color: 'bg-amber-100 text-amber-700 border-amber-200', icon: Clock },
  Confirmed: { label: 'Đã xác nhận', color: 'bg-blue-100 text-blue-700 border-blue-200', icon: CheckCircle2 },
  Shipping: { label: 'Đang giao', color: 'bg-purple-100 text-purple-700 border-purple-200', icon: Truck },
  Delivered: { label: 'Hoàn thành', color: 'bg-emerald-100 text-green-700 border-emerald-200', icon: CheckCircle2 },
  Cancelled: { label: 'Đã hủy', color: 'bg-rose-100 text-red-700 border-rose-200', icon: XCircle },
};

const AdminOrders = () => {
  const [orders, setOrders] = useState<IOrder[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<IOrder | null>(null);
  const [filterStatus, setFilterStatus] = useState('All');
  
  // State phân trang
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [totalOrders, setTotalOrders] = useState(0);

  const fetchOrders = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/orders/admin/all?page=${page}&limit=10&status=${filterStatus}`);
      setOrders(data.orders);
      setPages(data.pages);
      setTotalOrders(data.total);
    } catch (error) {
      console.error('Lỗi lấy danh sách đơn hàng:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, [page, filterStatus]);

  const handleStatusFilterChange = (status: string) => {
    setFilterStatus(status);
    setPage(1); // Reset về trang 1 khi đổi bộ lọc
  };

  const updateOrderStatus = async (id: string, newStatus: string) => {
    try {
      await api.patch(`/orders/${id}/status`, { status: newStatus });
      fetchOrders();
      if (selectedOrder?._id === id) {
        setSelectedOrder({ ...selectedOrder, status: newStatus as any });
      }
    } catch (error) {
      console.error('Lỗi cập nhật trạng thái:', error);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!window.confirm('Bạn có chắc chắn muốn xóa đơn hàng này? Hành động này không thể hoàn tác.')) return;
    
    try {
      await api.delete(`/orders/${id}`);
      alert('Xóa đơn hàng thành công!');
      setSelectedOrder(null);
      fetchOrders();
    } catch (error) {
      console.error('Lỗi xóa đơn hàng:', error);
    }
  };

  return (
    <div className="p-8 bg-gray-50 min-h-screen font-sans">
      <div className="flex justify-between items-end mb-10">
        <div className="space-y-2">
          <h1 className="text-4xl font-black uppercase tracking-tighter italic flex items-center gap-3">
            <Package className="text-red-600" size={36} />
            Quản lý <span className="text-red-600">đơn hàng</span>
          </h1>
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Tổng cộng: {totalOrders} đơn hàng | Đang hiển thị trang {page}/{pages}
          </p>
        </div>
        
        <div className="flex gap-4">
          <div className="bg-white p-1 rounded-2xl border border-gray-100 flex shadow-sm">
            {['All', 'Pending', 'Confirmed', 'Shipping', 'Delivered'].map((s) => (
              <button
                key={s}
                onClick={() => handleStatusFilterChange(s)}
                className={`px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filterStatus === s ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'text-gray-400 hover:text-gray-600'}`}
              >
                {s === 'All' ? 'Tất cả' : statusConfig[s as keyof typeof statusConfig].label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* DANH SÁCH ĐƠN HÀNG */}
        <div className="xl:col-span-2 space-y-4">
          {loading ? (
            <div className="bg-white rounded-[2rem] p-20 text-center border border-gray-100 shadow-sm">
              <div className="animate-spin text-red-600 inline-block mb-4"><Package size={48} /></div>
              <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Đang tải danh sách đơn hàng...</p>
            </div>
          ) : orders.length === 0 ? (
            <div className="bg-white rounded-[2rem] p-20 text-center border border-gray-100 shadow-sm">
              <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 italic">Không có đơn hàng nào phù hợp</p>
            </div>
          ) : (
            <>
              {orders.map((order) => (
                <motion.div
                  layout
                  key={order._id}
                  onClick={() => setSelectedOrder(order)}
                  className={`bg-white p-6 rounded-[2rem] border-2 cursor-pointer transition-all ${selectedOrder?._id === order._id ? 'border-red-600 shadow-xl' : 'border-transparent hover:border-gray-100 shadow-sm'}`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-gray-50 flex items-center justify-center text-gray-400">
                        <ShoppingBag size={24} />
                      </div>
                      <div>
                        <h3 className="font-black text-sm uppercase tracking-tight">{order.orderNumber}</h3>
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{new Date(order.createdAt).toLocaleString('vi-VN')}</p>
                      </div>
                    </div>

                    <div className="flex-1 min-w-[200px]">
                      <p className="text-xs font-black uppercase text-gray-900">{order.customer.name}</p>
                      <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{order.customer.phone}</p>
                    </div>

                    <div className="text-right flex items-center gap-4">
                      <div>
                        <p className="text-lg font-black text-red-600 tracking-tighter">{order.totalAmount.toLocaleString()}₫</p>
                        <div className="flex gap-2 justify-end mt-1">
                          <Badge className={`border font-black uppercase text-[8px] tracking-widest px-2 py-0.5 rounded-lg ${order.paymentMethod === 'Bank Transfer' ? 'bg-indigo-50 text-indigo-600 border-indigo-100' : 'bg-zinc-50 text-zinc-600 border-zinc-100'}`}>
                            {order.paymentMethod === 'Bank Transfer' ? 'BANK' : 'COD'}
                          </Badge>
                          <Badge className={`border font-black uppercase text-[8px] tracking-widest px-2 py-0.5 rounded-lg ${statusConfig[order.status].color}`}>
                            {statusConfig[order.status].label}
                          </Badge>
                        </div>
                      </div>
                      
                      <button 
                        onClick={(e) => {
                          e.stopPropagation();
                          deleteOrder(order._id);
                        }}
                        className="p-3 text-gray-300 hover:text-red-600 hover:bg-red-50 rounded-2xl transition-all"
                        title="Xóa nhanh đơn hàng"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </div>
                </motion.div>
              ))}

              {/* BỘ PHÂN TRANG */}
              {pages > 1 && (
                <div className="flex justify-center items-center gap-4 mt-8 bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100">
                  <button
                    disabled={page === 1}
                    onClick={() => setPage(p => Math.max(1, p - 1))}
                    className="p-3 hover:bg-gray-100 rounded-xl disabled:opacity-30 transition-all"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  
                  <div className="flex gap-2">
                    {[...Array(pages).keys()].map(x => (
                      <button
                        key={x + 1}
                        onClick={() => setPage(x + 1)}
                        className={`w-10 h-10 rounded-xl font-black text-xs transition-all ${page === x + 1 ? 'bg-red-600 text-white shadow-lg shadow-red-100' : 'bg-gray-50 text-gray-400 hover:bg-gray-100'}`}
                      >
                        {x + 1}
                      </button>
                    ))}
                  </div>

                  <button
                    disabled={page === pages}
                    onClick={() => setPage(p => Math.min(pages, p + 1))}
                    className="p-3 hover:bg-gray-100 rounded-xl disabled:opacity-30 transition-all"
                  >
                    <ChevronRight size={20} />
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* CHI TIẾT ĐƠN HÀNG */}
        <div className="xl:col-span-1">
          <AnimatePresence mode="wait">
            {selectedOrder ? (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="sticky top-8 space-y-6"
              >
                <Card className="rounded-[2.5rem] border-none shadow-2xl overflow-hidden bg-white">
                  <div className="bg-gray-900 p-8 text-white">
                    <div className="flex justify-between items-start mb-6">
                      <Badge className={`bg-white/10 text-white border-white/20 uppercase font-black text-[8px] tracking-widest px-3 py-1`}>
                        {selectedOrder.orderNumber}
                      </Badge>
                      <button onClick={() => setSelectedOrder(null)} className="text-gray-400 hover:text-white transition-colors">
                        <XCircle size={20} />
                      </button>
                    </div>
                    <h2 className="text-2xl font-black uppercase tracking-tighter italic">Chi tiết <span className="text-red-600">đơn hàng</span></h2>
                  </div>

                  <CardContent className="p-8 space-y-10">
                    {/* Customer Info */}
                    <div className="space-y-6">
                      <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-red-600 border-b-2 border-red-50 pb-2">Thông tin khách hàng</h4>
                      <div className="space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                            <User size={20} className="text-gray-900" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Họ và tên</p>
                            <p className="text-lg font-black uppercase text-gray-900">{selectedOrder.customer.name}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                            <Phone size={20} className="text-gray-900" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Số điện thoại</p>
                            <p className="text-xl font-black text-red-600 tracking-widest">{selectedOrder.customer.phone}</p>
                          </div>
                        </div>

                        <div className="flex items-start gap-4">
                          <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                            <MapPin size={20} className="text-gray-900" />
                          </div>
                          <div>
                            <p className="text-[10px] font-black uppercase text-gray-400 tracking-widest">Địa chỉ giao hàng</p>
                            <p className="text-sm font-bold text-gray-700 leading-relaxed mt-1">
                              {selectedOrder.customer.address}, {selectedOrder.customer.district}, {selectedOrder.customer.province}
                            </p>
                          </div>
                        </div>

                        {selectedOrder.customer.note && (
                          <div className="p-5 bg-amber-50 border border-amber-100 rounded-3xl">
                            <p className="text-[10px] font-black uppercase tracking-widest text-amber-600 mb-2">Ghi chú của khách</p>
                            <p className="text-sm font-bold italic text-amber-800 leading-relaxed">"{selectedOrder.customer.note}"</p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="space-y-6">
                      <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-red-600 border-b-2 border-red-50 pb-2">Sản phẩm khách đặt</h4>
                      <div className="space-y-5">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className="flex gap-5 items-start bg-white p-5 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-md transition-all">
                            <img src={item.image} className="w-20 h-20 rounded-2xl object-cover bg-gray-50 border border-gray-100" alt="" />
                            <div className="flex-1 min-w-0 py-1">
                              <p className="text-sm font-black uppercase tracking-tight text-gray-900 mb-1">{item.name}</p>
                              
                              {item.variantLabel && (
                                <div className="inline-block px-3 py-1 bg-red-600 text-white rounded-lg mb-2">
                                  <p className="text-[11px] font-black uppercase tracking-widest">{item.variantLabel}</p>
                                </div>
                              )}
                              
                              <div className="flex justify-between items-center mt-2">
                                <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">
                                  SL: <span className="text-gray-900 font-black">{item.quantity}</span> x {item.price.toLocaleString()}₫
                                </p>
                                <span className="text-md font-black text-gray-900">{(item.price * item.quantity).toLocaleString()}₫</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>

                      <div className="p-6 bg-gray-950 rounded-[2rem] text-white flex justify-between items-center shadow-xl">
                        <span className="text-xs font-black uppercase tracking-[0.2em]">Tổng tiền đơn hàng</span>
                        <span className="text-2xl font-black text-red-500 tracking-tighter">{selectedOrder.totalAmount.toLocaleString()}₫</span>
                      </div>
                    </div>

                    {/* Change Status */}
                    <div className="space-y-4 pt-4">
                      <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-gray-400">Trạng thái xử lý</h4>
                      <div className="grid grid-cols-2 gap-3">
                        {Object.entries(statusConfig).map(([key, config]) => (
                          <button
                            key={key}
                            onClick={() => updateOrderStatus(selectedOrder._id, key)}
                            className={`flex items-center gap-3 p-4 rounded-2xl border-2 transition-all shadow-sm ${selectedOrder.status === key ? 'border-red-600 bg-red-50 shadow-red-100' : 'border-gray-50 bg-white hover:border-gray-200'}`}
                          >
                            <config.icon size={18} className={selectedOrder.status === key ? 'text-red-600' : 'text-gray-300'} />
                            <span className={`text-[11px] font-black uppercase tracking-tight ${selectedOrder.status === key ? 'text-red-600' : 'text-gray-500'}`}>
                              {config.label}
                            </span>
                          </button>
                        ))}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ) : (
              <div className="bg-white rounded-[2.5rem] p-20 text-center border-2 border-dashed border-gray-100">
                <Package size={48} className="mx-auto text-gray-100 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300">Chọn một đơn hàng để xem chi tiết</p>
              </div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
};

export default AdminOrders;
