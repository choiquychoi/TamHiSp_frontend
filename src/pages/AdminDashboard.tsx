import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import { 
  Package, 
  ShoppingCart, 
  Newspaper, 
  DollarSign, 
  AlertTriangle, 
  TrendingUp, 
  Clock, 
  ChevronRight,
  ArrowUpRight,
  Loader2,
  Trophy
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, 
  PieChart, Pie, Cell, BarChart, Bar, Legend
} from 'recharts';
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CONFIG from '@/lib/config';

interface DashboardStats {
  totalRevenue: number;
  totalOrders: number;
  totalProducts: number;
  totalNews: number;
  monthlyRevenue: any[];
  statusStats: any[];
  topSellingData: any[];
  lowStockProducts: any[];
  recentOrders: any[];
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const { data } = await api.get('/admin/stats');
        setStats(data);
      } catch (error) {
        console.error('Lỗi lấy thống kê:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="h-[60vh] flex flex-col items-center justify-center gap-4">
        <Loader2 className="animate-spin text-red-600" size={48} />
        <p className="font-black uppercase tracking-widest text-xs text-gray-400">Đang tổng hợp dữ liệu...</p>
      </div>
    );
  }

  if (!stats) return <div className="p-10 text-center font-bold">Không thể tải dữ liệu thống kê.</div>;

  const STATUS_COLORS: { [key: string]: string } = {
    "Chờ duyệt": "#f59e0b", // Amber
    "Đã xác nhận": "#3b82f6", // Blue
    "Đang giao": "#8b5cf6", // Purple
    "Đã giao": "#10b981", // Emerald
    "Đã hủy": "#6b7280", // Gray
  };

  const summaryCards = [
    { title: 'Doanh thu tổng', value: `${stats.totalRevenue.toLocaleString()}₫`, icon: DollarSign, color: 'text-emerald-500', bg: 'bg-emerald-50' },
    { title: 'Tổng đơn hàng', value: stats.totalOrders, icon: ShoppingCart, color: 'text-blue-500', bg: 'bg-blue-50' },
    { title: 'Sản phẩm', value: stats.totalProducts, icon: Package, color: 'text-amber-500', bg: 'bg-amber-50' },
    { title: 'Bài viết tin tức', value: stats.totalNews, icon: Newspaper, color: 'text-purple-500', bg: 'bg-purple-50' },
  ];

  return (
    <div className="animate-in fade-in duration-700 pb-10">
      <header className="mb-10">
        <h2 className="text-4xl font-black text-gray-950 uppercase tracking-tighter italic flex items-center gap-3">
          <TrendingUp className="text-red-600" /> Bảng điều khiển
        </h2>
        <p className="text-gray-400 text-[10px] font-black uppercase tracking-[0.2em] mt-1">Hệ thống quản trị Tâm Hí Sports</p>
      </header>

      {/* STATS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
        {summaryCards.map((card, index) => (
          <Card key={index} className="border-none shadow-sm hover:shadow-xl transition-all duration-500 group rounded-[2rem] overflow-hidden bg-white">
            <CardContent className="p-8">
              <div className="flex justify-between items-start">
                <div className="space-y-1">
                  <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{card.title}</p>
                  <p className="text-2xl font-black text-gray-950 tracking-tighter">{card.value}</p>
                </div>
                <div className={`${card.bg} ${card.color} p-4 rounded-2xl group-hover:rotate-12 transition-transform duration-500`}>
                  <card.icon size={24} />
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CHARTS SECTION */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 mb-12">
        
        {/* LINE CHART: REVENUE TREND */}
        <div className="lg:col-span-8">
          <Card className="border-none shadow-sm rounded-[3rem] bg-white p-8 h-full">
            <h3 className="text-xl font-black uppercase tracking-tighter italic mb-8 flex items-center gap-2">
              <TrendingUp className="text-red-600" size={20} /> Xu hướng <span className="text-red-600">doanh thu</span>
            </h3>
            <div className="h-[300px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={stats.monthlyRevenue}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 'bold', fill: '#999'}} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 'bold', fill: '#999'}}
                    tickFormatter={(value) => `${(value / 1000000).toFixed(1)}M`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                    formatter={(value: any) => [`${value.toLocaleString()}₫`, 'Doanh thu']}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="revenue" 
                    stroke="#ef4444" 
                    strokeWidth={4} 
                    dot={{ r: 6, fill: '#ef4444', strokeWidth: 2, stroke: '#fff' }}
                    activeDot={{ r: 8 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>

        {/* PIE CHART: ORDER STATUS */}
        <div className="lg:col-span-4">
          <Card className="border-none shadow-sm rounded-[3rem] bg-white p-8 h-full">
            <h3 className="text-xl font-black uppercase tracking-tighter italic mb-8">Trạng thái <span className="text-red-600">đơn hàng</span></h3>
            <div className="h-[300px] w-full relative">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats.statusStats}
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {stats.statusStats.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={STATUS_COLORS[entry.name] || '#eee'} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36} wrapperStyle={{ fontSize: '10px', fontWeight: 'bold', textTransform: 'uppercase' }} />
                </PieChart>
              </ResponsiveContainer>
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                <p className="text-[10px] font-black text-gray-400 uppercase">Tổng cộng</p>
                <p className="text-2xl font-black text-gray-950">{stats.totalOrders}</p>
              </div>
            </div>
          </Card>
        </div>

        {/* BAR CHART: TOP PRODUCTS */}
        <div className="lg:col-span-12">
          <Card className="border-none shadow-sm rounded-[3rem] bg-white p-10">
            <h3 className="text-xl font-black uppercase tracking-tighter italic mb-8 flex items-center gap-2">
              <Trophy className="text-red-600" size={20} /> Top 5 <span className="text-red-600">sản phẩm bán chạy</span>
            </h3>
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={stats.topSellingData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f0f0f0" />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{fontSize: 10, fontWeight: 'bold', fill: '#666'}} 
                    dy={10}
                  />
                  <YAxis axisLine={false} tickLine={false} tick={{fontSize: 10, fontWeight: 'bold', fill: '#999'}} />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)', fontWeight: 'bold' }}
                  />
                  <Bar 
                    dataKey="sold" 
                    fill="#111827" 
                    radius={[10, 10, 0, 0]} 
                    barSize={60}
                  />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-10">
        
        {/* RECENT ORDERS */}
        <div className="space-y-6">
          <div className="flex justify-between items-end px-2">
            <h3 className="text-xl font-black uppercase tracking-tighter italic flex items-center gap-2">
              <Clock className="text-red-600" size={20} /> Đơn hàng <span className="text-red-600">gần đây</span>
            </h3>
            <Link to="/admin/orders" className="text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-red-600 transition-colors flex items-center gap-1">
              Xem tất cả <ChevronRight size={14} />
            </Link>
          </div>

          <Card className="border-none shadow-sm rounded-[2.5rem] overflow-hidden bg-white">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Mã đơn</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Khách hàng</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400">Tổng tiền</th>
                    <th className="px-8 py-5 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Trạng thái</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {stats?.recentOrders?.map((order: any) => (
                    <tr key={order._id} className="group hover:bg-gray-50/50 transition-colors">

                      <td className="px-8 py-5">
                        <span className="font-black text-xs text-red-600">{order.orderNumber}</span>
                      </td>
                      <td className="px-8 py-5">
                        <div className="font-bold text-sm text-gray-950">{order.customer.name}</div>
                        <div className="text-[10px] text-gray-400">{order.customer.phone}</div>
                      </td>
                      <td className="px-8 py-5">
                        <span className="font-black text-sm text-gray-950">{order.totalAmount.toLocaleString()}₫</span>
                      </td>
                      <td className="px-8 py-5 text-right">
                        <Badge className={`
                          rounded-none uppercase tracking-tighter text-[9px] font-black px-2 py-0.5
                          ${order.status === 'Pending' ? 'bg-amber-100 text-amber-600' : 
                            order.status === 'Delivered' ? 'bg-emerald-100 text-emerald-600' : 'bg-blue-100 text-blue-600'}
                        `}>
                          {order.status}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
