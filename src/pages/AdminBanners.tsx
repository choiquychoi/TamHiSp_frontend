import React, { useState, useEffect } from 'react';
import api from '@/lib/axios';
import axios from 'axios';
import { Plus, Edit, Trash2, X, Save, Upload, Loader2, Image as ImageIcon, ExternalLink, Eye, EyeOff } from 'lucide-react';

interface IBanner {
  _id: string;
  image: string;
  title: string;
  subtitle: string;
  buttonText: string;
  link: string;
  order: number;
  isActive: boolean;
}

const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<IBanner[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingBanner, setEditingBanner] = useState<IBanner | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [formError, setFormError] = useState('');

  const initialFormState = {
    image: '',
    title: '',
    subtitle: '',
    link: '/',
    order: 0,
    isActive: true
  };

  const [formData, setFormData] = useState(initialFormState);

  const fetchBanners = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/banners/admin');
      setBanners(data);
    } catch (error) {
      console.error('Lỗi khi lấy banners:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    try {
      const { data } = await api.post('/admin/s3/upload-url', {
        fileName: file.name,
        fileType: file.type
      });

      const { uploadUrl, fileUrl } = data;

      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type }
      });

      setFormData(prev => ({ ...prev, image: fileUrl }));
    } catch (error: any) {
      console.error('Lỗi upload:', error);
      alert('Không thể upload ảnh.');
    } finally {
      setIsUploading(false);
    }
  };

  const handleAddClick = () => {
    setEditingBanner(null);
    setFormData(initialFormState);
    setIsModalOpen(true);
  };

  const handleEditClick = (banner: IBanner) => {
    setEditingBanner(banner);
    setFormData({
      image: banner.image,
      title: banner.title,
      subtitle: banner.subtitle,
      buttonText: banner.buttonText,
      link: banner.link,
      order: banner.order,
      isActive: banner.isActive
    });
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa banner này?')) {
      try {
        await api.delete(`/banners/${id}`);
        fetchBanners();
      } catch (error) {
        alert('Lỗi khi xóa banner');
      }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    if (!formData.image) return setFormError('Vui lòng upload ảnh banner.');
    if (!formData.title) return setFormError('Vui lòng nhập tiêu đề.');

    try {
      if (editingBanner) {
        await api.put(`/banners/${editingBanner._id}`, formData);
      } else {
        await api.post('/banners', formData);
      }
      setIsModalOpen(false);
      fetchBanners();
    } catch (err: any) {
      setFormError(err.response?.data?.message || 'Lỗi lưu banner');
    }
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20 px-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter text-red-600 italic">Quản lý Banner</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Cấu hình trình chiếu trang chủ</p>
        </div>
        <button onClick={handleAddClick} className="bg-black hover:bg-gray-800 text-white px-10 py-5 rounded-[2.5rem] flex items-center transition-all shadow-2xl font-black uppercase tracking-widest text-[10px] active:scale-95">
          <Plus className="w-5 h-5 mr-2 text-red-600" /> Thêm Banner mới
        </button>
      </div>

      <div className="grid grid-cols-1 gap-8">
        {loading ? (
          <div className="py-20 text-center font-black uppercase tracking-widest text-red-600 animate-pulse">Đang tải dữ liệu banner...</div>
        ) : banners.length === 0 ? (
          <div className="py-20 bg-white rounded-[3rem] border-2 border-dashed border-gray-100 flex flex-col items-center justify-center text-gray-300 italic">
            <ImageIcon size={48} className="mb-4 opacity-20" />
            Chưa có banner nào. Hãy thêm cái đầu tiên!
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {banners.map((banner) => (
              <div key={banner._id} className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden group hover:shadow-2xl transition-all duration-500">
                <div className="relative aspect-[21/9] overflow-hidden">
                  <img src={banner.image} className="w-full h-full object-cover transition-transform duration-[5000ms] group-hover:scale-110" alt={banner.title} />
                  <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors" />
                  {!banner.isActive && (
                    <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex items-center justify-center z-10">
                      <div className="bg-white px-6 py-2 rounded-full shadow-xl flex items-center space-x-2">
                        <EyeOff size={16} className="text-gray-400" />
                        <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Đang ẩn</span>
                      </div>
                    </div>
                  )}
                  <div className="absolute top-6 right-6 flex gap-2 z-20">
                    <button onClick={() => handleEditClick(banner)} className="p-3 bg-white/90 backdrop-blur-sm text-blue-600 rounded-2xl shadow-lg hover:bg-white transition-all"><Edit size={18} /></button>
                    <button onClick={() => handleDelete(banner._id)} className="p-3 bg-white/90 backdrop-blur-sm text-red-600 rounded-2xl shadow-lg hover:bg-white transition-all"><Trash2 size={18} /></button>
                  </div>
                </div>
                <div className="p-8 space-y-4">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="text-[10px] font-black text-red-600 uppercase tracking-widest mb-1">Thứ tự hiển thị: #{banner.order}</div>
                      <h3 className="text-xl font-black text-gray-900 uppercase tracking-tighter leading-tight">{banner.title}</h3>
                      <p className="text-sm text-gray-500 font-medium line-clamp-2 mt-2">{banner.subtitle}</p>
                    </div>
                  </div>
                  <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                    <div className="flex items-center text-[10px] font-black text-gray-400 uppercase tracking-widest">
                      <ExternalLink size={14} className="mr-2" /> Link: <span className="text-gray-900 ml-1 truncate max-w-[150px]">{banner.link}</span>
                    </div>
                    <div className={`px-4 py-1 rounded-full text-[8px] font-black uppercase tracking-widest ${banner.isActive ? 'bg-green-50 text-green-600' : 'bg-gray-50 text-gray-400'}`}>
                      {banner.isActive ? 'Đang hoạt động' : 'Tạm dừng'}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-[3rem] max-w-2xl w-full max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-10 border-b flex justify-between items-center">
              <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{editingBanner ? 'Cập Nhật Banner' : 'Thêm Banner Mới'}</h3>
              <button onClick={() => setIsModalOpen(false)} className="p-4 bg-gray-100 text-gray-400 rounded-[1.5rem] hover:text-gray-900 transition-all"><X size={24} /></button>
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-10 space-y-8 custom-scrollbar">
              {formError && <div className="p-5 bg-red-50 border border-red-100 text-red-600 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest flex items-center"><X size={16} className="mr-3" /> {formError}</div>}

              <div className="space-y-4">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hình ảnh Banner (Ngang - 1920x850)</label>
                <div className="relative group rounded-[2rem] overflow-hidden border-2 border-dashed border-gray-200 aspect-[21/9]">
                  {formData.image ? (
                    <>
                      <img src={formData.image} className="w-full h-full object-cover" alt="" />
                      <button type="button" onClick={() => setFormData({...formData, image: ''})} className="absolute top-4 right-4 p-3 bg-white text-red-600 rounded-full shadow-xl opacity-0 group-hover:opacity-100 transition-all"><Trash2 size={16} /></button>
                    </>
                  ) : (
                    <label className="flex flex-col items-center justify-center w-full h-full cursor-pointer hover:bg-gray-50 transition-all">
                      {isUploading ? <Loader2 className="w-10 h-10 text-red-600 animate-spin" /> : <Upload className="w-10 h-10 text-gray-300" />}
                      <span className="text-[10px] font-black text-gray-400 uppercase tracking-widest mt-4">{isUploading ? 'Đang tải lên...' : 'Nhấn để tải ảnh'}</span>
                      <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} />
                    </label>
                  )}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tiêu đề (Title)</label>
                  <input type="text" className="form-input-custom" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} placeholder="VD: CHINH PHỤC ĐỈNH CAO" />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Thứ tự hiển thị</label>
                  <input type="number" className="form-input-custom" value={formData.order} onChange={e => setFormData({...formData, order: Number(e.target.value)})} />
                </div>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tiêu đề phụ (Subtitle)</label>
                <textarea className="form-input-custom !h-24 py-4" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} placeholder="VD: Trang bị ngay những siêu phẩm mới nhất..." />
              </div>

              <div className="flex items-center p-6 bg-gray-50 rounded-[1.5rem] cursor-pointer hover:bg-red-50 transition-all group">
                <input type="checkbox" className="w-6 h-6 rounded-lg text-red-600 mr-4" checked={formData.isActive} onChange={e => setFormData({...formData, isActive: e.target.checked})} />
                <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-red-600">Kích hoạt hiển thị Banner này</span>
              </div>

              <div className="sticky bottom-0 bg-white pt-4 flex gap-4">
                <button type="submit" className="flex-1 bg-red-600 hover:bg-red-700 text-white py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] shadow-2xl flex items-center justify-center transition-all active:scale-95">
                  <Save size={18} className="mr-2" /> {editingBanner ? 'Lưu thay đổi' : 'Tạo Banner'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-10 bg-gray-100 text-gray-400 py-5 rounded-[2rem] font-black uppercase tracking-widest text-[10px] hover:bg-gray-200 transition-all">Đóng</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .form-input-custom { width: 100%; padding: 1.25rem 1.5rem; background: #f9fafb; border: 1.5px solid #f3f4f6; border-radius: 1.5rem; font-weight: 800; color: #1f2937; outline: none; transition: all 0.3s; font-size: 16px; }
        .form-input-custom:focus { border-color: #dc2626; background: white; box-shadow: 0 10px 20px -10px rgba(220, 38, 38, 0.15); }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AdminBanners;
