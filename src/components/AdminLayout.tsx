import React from 'react';
import { Link, useNavigate, Outlet, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Package, 
  Headphones, 
  LogOut, 
  ChevronRight, 
  Newspaper, 
  ShoppingBag,
  Image as ImageIcon
} from 'lucide-react';

const AdminLayout: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    if (window.confirm('Bạn có chắc chắn muốn đăng xuất?')) {
      localStorage.removeItem('adminToken');
      localStorage.removeItem('adminInfo');
      navigate('/admin/login');
    }
  };

  const menuItems = [
    { path: '/admin', label: 'Dashboard', icon: LayoutDashboard },
    { path: '/admin/products', label: 'Quản lý Sản phẩm', icon: Package },
    { path: '/admin/orders', label: 'Quản lý Đơn hàng', icon: ShoppingBag },
    { path: '/admin/banners', label: 'Quản lý Banner', icon: ImageIcon },
    { path: '/admin/news', label: 'Quản lý Tin tức', icon: Newspaper },
    { path: '/admin/contact', label: 'Thông tin & SEO', icon: Headphones },
  ];

  return (
    <div className="flex min-h-screen bg-gray-50 font-sans text-gray-900">
      {/* SIDEBAR CỐ ĐỊNH */}
      <aside className="w-80 bg-white border-r hidden md:flex flex-col sticky top-0 h-screen shadow-sm">
        <div className="p-10 border-b">
          <Link to="/admin" className="text-2xl font-black text-red-600 uppercase tracking-tighter flex items-center">
            N.Binh <span className="text-gray-400 ml-1 italic">Admin</span>
          </Link>
        </div>

        <nav className="flex-1 px-6 py-10 space-y-4">
          {menuItems.map((item) => {
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={`relative flex items-center justify-between p-5 rounded-2xl transition-all duration-300 group overflow-hidden ${
                  isActive 
                    ? 'bg-red-50 text-red-600 shadow-sm' 
                    : 'text-gray-400 hover:bg-gray-50 hover:text-red-600'
                }`}
              >
                {/* Thanh đỏ bên cạnh khi active hoặc hover */}
                <div className={`absolute left-0 top-0 bottom-0 w-1.5 bg-red-600 transition-all duration-300 ${isActive ? 'translate-x-0' : '-translate-x-full group-hover:translate-x-0'}`} />
                
                <div className="flex items-center">
                  <item.icon size={20} className={`mr-4 transition-colors ${isActive ? 'text-red-600' : 'group-hover:text-red-600'}`} />
                  <span className={`font-black uppercase text-[11px] tracking-[0.2em] italic transition-all ${isActive ? 'ml-2' : 'group-hover:ml-2'}`}>
                    {item.label}
                  </span>
                </div>
                
                <ChevronRight size={16} className={`transition-all duration-300 ${isActive ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4 group-hover:opacity-100 group-hover:translate-x-0'}`} />
              </Link>
            );
          })}
        </nav>

        {/* PHẦN ĐĂNG XUẤT DƯỚI CÙNG */}
        <div className="p-8 border-t bg-gray-50/50">
          <button 
            onClick={handleLogout}
            className="w-full flex items-center p-5 text-gray-400 hover:text-red-600 hover:bg-white rounded-2xl transition-all duration-300 font-black uppercase text-[10px] tracking-[0.3em] italic group border border-transparent hover:border-red-100 hover:shadow-xl hover:shadow-red-900/5"
          >
            <div className="p-2 bg-white rounded-xl shadow-sm mr-4 group-hover:bg-red-600 group-hover:text-white transition-all"><LogOut size={16} /></div> 
            Đăng xuất
          </button>
        </div>
      </aside>

      {/* NỘI DUNG THAY ĐỔI THEO ROUTE */}
      <main className="flex-1 overflow-y-auto bg-[#fafafa]">
        <div className="p-4 md:p-12">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
