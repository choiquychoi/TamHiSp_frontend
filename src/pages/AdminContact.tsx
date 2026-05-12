import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Save, MapPin, Share2, Globe, CheckCircle2, X } from 'lucide-react';
import api from '@/lib/axios';

const AdminContact: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    companyName: '',
    address: '',
    phone: '',
    email: '',
    mapUrl: '',
    socialLinks: { facebook: '', zalo: '', tiktok: '', instagram: '' },
    seoTitle: '',
    seoDescription: '',
    seoKeywords: '' 
  });

  useEffect(() => {
    const fetchContact = async () => {
      try {
        const { data } = await api.get('/contact');
        if (data) {
          setFormData({
            companyName: data.companyName || '',
            address: data.address || '',
            phone: data.phone || '',
            email: data.email || '',
            mapUrl: data.mapUrl || '',
            socialLinks: data.socialLinks || { facebook: '', zalo: '', tiktok: '', instagram: '' },
            seoTitle: data.seoTitle || '',
            seoDescription: data.seoDescription || '',
            seoKeywords: Array.isArray(data.seoKeywords) ? data.seoKeywords.join(', ') : ''
          });
        }
      } catch (error) {
        console.error('Lỗi khi lấy thông tin liên hệ:', error);
      }
    };
    fetchContact();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const dataToSubmit = {
      ...formData,
      seoKeywords: (formData.seoKeywords || '').split(',').map(k => k.trim()).filter(k => k !== '')
    };

    try {
      await api.put('/admin/contact', dataToSubmit);
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (error) {
      alert('Lỗi cập nhật hệ thống');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="animate-in fade-in duration-500">
      <div className="max-w-4xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h2 className="text-3xl font-black uppercase tracking-tighter text-red-600">Thông tin cửa hàng</h2>
          {success && (
            <div className="bg-black text-white px-6 py-3 rounded-2xl font-black text-xs uppercase tracking-widest flex items-center shadow-2xl">
              <CheckCircle2 size={16} className="text-green-400 mr-2" /> Đã lưu thành công
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-8 pb-32">
            
            {/* ĐỊA CHỈ & LIÊN HỆ */}
            <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center space-x-3 border-b pb-4">
                <div className="p-2 bg-red-50 text-red-600 rounded-lg"><MapPin size={20} /></div>
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Địa chỉ & Liên hệ</h3>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Tên đơn vị</label>
                  <input type="text" className="form-input-custom" value={formData.companyName} onChange={e => setFormData({...formData, companyName: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Hotline bán hàng</label>
                  <input type="text" className="form-input-custom" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} />
                </div>
                <div className="md:col-span-2 space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Địa chỉ chi tiết</label>
                  <input type="text" className="form-input-custom" value={formData.address} onChange={e => setFormData({...formData, address: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Email hỗ trợ</label>
                  <input type="email" className="form-input-custom" value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Link Google Maps (Nhúng)</label>
                  <input type="text" className="form-input-custom" value={formData.mapUrl} onChange={e => setFormData({...formData, mapUrl: e.target.value})} placeholder="https://www.google.com/maps/embed?..." />
                  <p className="text-[9px] text-gray-400 font-medium italic mt-1 leading-relaxed">
                    * Lưu ý: Phải dùng link nhúng (Vào Google Maps {'>'} Chia sẻ {'>'} Nhúng bản đồ {'>'} Copy phần link trong src).
                  </p>
                </div>
              </div>
            </section>

            {/* MẠNG XÃ HỘI */}
            <section className="bg-white p-8 rounded-[2rem] shadow-sm border border-gray-100 space-y-6">
              <div className="flex items-center space-x-3 border-b pb-4">
                <div className="p-2 bg-blue-50 text-blue-600 rounded-lg"><Share2 size={20} /></div>
                <h3 className="text-sm font-black uppercase tracking-widest text-gray-400">Mạng xã hội</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                {['facebook', 'zalo', 'tiktok', 'instagram'].map((platform) => (
                  <div key={platform} className="space-y-2">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">{platform}</label>
                    <input type="text" className="form-input-custom text-xs font-bold" value={(formData.socialLinks as any)[platform]} onChange={e => setFormData({...formData, socialLinks: {...formData.socialLinks, [platform]: e.target.value}})} />
                  </div>
                ))}
              </div>
            </section>

            {/* SEO GOOGLE */}
            <section className="bg-black p-10 rounded-[3rem] shadow-2xl space-y-8 text-white">
              <div className="flex items-center space-x-3 border-b border-white/10 pb-6">
                <div className="p-2.5 bg-white/10 text-white rounded-xl"><Globe size={20} /></div>
                <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-500">Tối ưu hóa SEO Google</h3>
              </div>
              <div className="space-y-6">
                <div className="space-y-3">
                  <div className="flex justify-between"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Tiêu đề SEO (Title)</label><span className="text-[10px] font-bold">{(formData.seoTitle || '').length}/70</span></div>
                  <input type="text" className="form-input-custom bg-white/5 border-white/10 text-white focus:bg-white/20" value={formData.seoTitle} onChange={e => setFormData({...formData, seoTitle: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <div className="flex justify-between"><label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Mô tả SEO (Description)</label><span className="text-[10px] font-bold">{(formData.seoDescription || '').length}/160</span></div>
                  <textarea rows={3} className="form-input-custom bg-white/5 border-white/10 text-white focus:bg-white/20" value={formData.seoDescription} onChange={e => setFormData({...formData, seoDescription: e.target.value})} />
                </div>
                <div className="space-y-3">
                  <label className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Từ khóa tìm kiếm (Keywords)</label>
                  <input type="text" className="form-input-custom bg-white/5 border-white/10 text-white focus:bg-white/20" value={formData.seoKeywords} onChange={e => setFormData({...formData, seoKeywords: e.target.value})} placeholder="VD: cau long, tennis, tam hi sports" />
                </div>
              </div>
            </section>

            <div className="fixed bottom-8 right-8 z-50">
              <button type="submit" disabled={loading} className="group bg-red-600 hover:bg-red-700 text-white px-10 py-5 rounded-[2rem] font-black uppercase tracking-widest shadow-2xl shadow-red-200 transition-all active:scale-95 flex items-center">
                <Save className="w-6 h-6 mr-3" /> {loading ? 'Đang cập nhật...' : 'Lưu thay đổi'}
              </button>
            </div>
        </form>
      </div>

      <style>{`
        .form-input-custom { width: 100%; padding: 1.25rem; background: white; border: 1.5px solid #f3f4f6; border-radius: 1.5rem; font-weight: 800; color: #1f2937; outline: none; transition: all 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); font-size: 16px; }
        .form-input-custom:focus { border-color: #dc2626; box-shadow: 0 10px 25px -5px rgba(220, 38, 38, 0.1); }
      `}</style>
    </div>
  );
};

export default AdminContact;
