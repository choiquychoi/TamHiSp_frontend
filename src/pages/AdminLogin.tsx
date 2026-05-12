import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Lock, User, AlertCircle } from 'lucide-react';

import CONFIG from '@/lib/config';

import api from '@/lib/axios';

const AdminLogin: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const { data } = await api.post('/admin/login', { username, password });

      // Lưu token vào localStorage để sử dụng cho các yêu cầu sau
      localStorage.setItem('adminToken', data.token);
      localStorage.setItem('adminInfo', JSON.stringify(data));

      // Chuyển hướng sang trang Dashboard
      navigate('/admin');
    } catch (err: any) {
      setError(err.response?.data?.message || err.message || 'Lỗi đăng nhập');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl overflow-hidden">
        <div className="bg-red-600 p-8 text-white text-center">
          <h2 className="text-3xl font-bold">Tâm Hí Sports</h2>
          <p className="mt-2 text-red-100">Hệ thống quản trị cửa hàng</p>
        </div>
        
        <div className="p-8">
          <form onSubmit={handleLogin} className="space-y-6">
            {error && (
              <div className="bg-red-50 text-red-600 p-3 rounded-lg flex items-center text-sm border border-red-100">
                <AlertCircle className="w-4 h-4 mr-2 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Tên đăng nhập</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <User className="w-5 h-5" />
                </span>
                <input
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-2xl focus:ring-red-500 focus:border-red-500 transition-all outline-none text-base"
                  placeholder="admin"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Mật khẩu</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center text-gray-400">
                  <Lock className="w-5 h-5" />
                </span>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-10 pr-3 py-4 border border-gray-300 rounded-2xl focus:ring-red-500 focus:border-red-500 transition-all outline-none text-base"
                  placeholder="••••••••"
                  required
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3 px-4 rounded-xl text-white font-bold transition-all shadow-lg ${
                loading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 active:scale-95 shadow-red-200'
              }`}
            >
              {loading ? 'Đang kiểm tra...' : 'Đăng Nhập'}
            </button>
          </form>
          
          <div className="mt-8 text-center">
            <a href="/" className="text-sm text-gray-500 hover:text-red-600 transition-colors">
              ← Quay về trang chủ cửa hàng
            </a>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminLogin;
