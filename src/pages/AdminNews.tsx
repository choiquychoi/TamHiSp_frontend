import React, { useState, useEffect } from 'react';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { 
  Save, 
  Sparkles, 
  Search, 
  Image as ImageIcon, 
  Globe, 
  Plus,
  Trash2,
  Loader2,
  Edit,
  ArrowLeft,
  LayoutGrid,
  Calendar,
  Eye,
  MoreVertical,
  Upload,
  X
} from 'lucide-react';
import api from '@/lib/axios';
import axios from 'axios';

interface Product {
  _id: string;
  name: string;
  price: number;
  image: string;
  category: string;
}

interface NewsPost {
  _id: string;
  title: string;
  slug: string;
  content: string;
  summary: string;
  thumbnail: string;
  category: string;
  status: 'Draft' | 'Published';
  createdAt: string;
  attachedProducts: any[];
}

const AdminNews: React.FC = () => {
  const [view, setView] = useState<'list' | 'editor'>('list');
  const [posts, setPosts] = useState<NewsPost[]>([]);
  const [editingPostId, setEditingPostId] = useState<string | null>(null);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalPosts, setTotalPosts] = useState(0);

  // Form states
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [summary, setSummary] = useState('');
  const [slug, setSlug] = useState('');
  const [thumbnail, setThumbnail] = useState('');
  const [category, setCategory] = useState('Review sản phẩm');
  const [aiPrompt, setAiPrompt] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [searchProduct, setSearchProduct] = useState('');
  const [products, setProducts] = useState<Product[]>([]);
  const [attachedProducts, setAttachedProducts] = useState<Product[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // Cấu hình Toolbar cho WYSIWYG (Quill)
  const modules = {
    toolbar: [
      [{ 'header': [1, 2, 3, false] }],
      ['bold', 'italic', 'underline', 'strike', 'blockquote'],
      [{'list': 'ordered'}, {'list': 'bullet'}, {'indent': '-1'}, {'indent': '+1'}],
      ['link', 'image', 'video'],
      ['clean']
    ],
  };

  const formats = [
    'header',
    'bold', 'italic', 'underline', 'strike', 'blockquote',
    'list', 'indent',
    'link', 'image', 'video'
  ];

  // Hàm upload ảnh lên S3
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chỉ chọn file ảnh.');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Lấy Presigned URL qua api bảo mật
      const { data } = await api.post('/admin/s3/upload-url', {
        fileName: file.name,
        fileType: file.type
      });

      const { uploadUrl, fileUrl } = data;

      // 2. Upload trực tiếp lên S3 - Dùng axios gốc
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type }
      });

      // 3. Cập nhật thumbnail
      setThumbnail(fileUrl);
    } catch (error: any) {
      console.error('Lỗi upload tin tức:', error);
      alert('Không thể upload ảnh. Vui lòng kiểm tra cấu hình.');
    } finally {
      setIsUploading(false);
    }
  };

  // Fetch posts for list view
  const fetchPosts = async () => {
    setIsLoadingList(true);
    try {
      const { data } = await api.get(`/admin/all-posts?page=${currentPage}&limit=10`);
      
      if (data.posts) {
        setPosts(data.posts);
        setTotalPages(data.totalPages);
        setTotalPosts(data.totalPosts);
      } else {
        setPosts(Array.isArray(data) ? data : []);
      }
    } catch (error) {
      console.error('Lỗi lấy danh sách bài viết:', error);
      setPosts([]);
    } finally {
      setIsLoadingList(false);
    }
  };

  useEffect(() => {
    if (view === 'list') {
      fetchPosts();
    }
  }, [view, currentPage]);

  // Auto-generate slug from title
  useEffect(() => {
    if (!editingPostId) {
      const generatedSlug = title
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[đĐ]/g, 'd')
        .replace(/([^0-9a-z-\s])/g, '')
        .replace(/(\s+)/g, '-')
        .replace(/-+/g, '-')
        .replace(/^-+|-+$/g, '');
      setSlug(generatedSlug);
    }
  }, [title, editingPostId]);

  // Search products
  useEffect(() => {
    const fetchSearchProducts = async () => {
      if (searchProduct.length > 2) {
        try {
          const { data } = await api.get(`/products?keyword=${searchProduct}&limit=5&isAdmin=true`);
          setProducts(data.products || []);
        } catch (error) {
          console.error('Lỗi tìm sản phẩm:', error);
        }
      } else {
        setProducts([]);
      }
    };
    const timer = setTimeout(fetchSearchProducts, 500);
    return () => clearTimeout(timer);
  }, [searchProduct]);

  const handleAiWrite = async () => {
    if (!aiPrompt) return;
    setIsAiLoading(true);
    try {
      const { data } = await api.post('/admin/ai-writer', { prompt: aiPrompt, type: category });
      setContent(prev => prev + data.content);
    } catch (error) {
      alert('Lỗi gọi Gemini AI. Hãy kiểm tra API Key!');
    } finally {
      setIsAiLoading(false);
    }
  };

  const resetForm = () => {
    setTitle('');
    setContent('');
    setSummary('');
    setSlug('');
    setThumbnail('');
    setCategory('Review sản phẩm');
    setAttachedProducts([]);
    setEditingPostId(null);
  };

  const handleEdit = (post: NewsPost) => {
    setEditingPostId(post._id);
    setTitle(post.title);
    setContent(post.content);
    setSummary(post.summary);
    setSlug(post.slug);
    setThumbnail(post.thumbnail);
    setCategory(post.category);
    setAttachedProducts(post.attachedProducts || []);
    setView('editor');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa bài viết này không?')) {
      try {
        await api.delete(`/admin/posts/${id}`);
        fetchPosts();
      } catch (error) {
        alert('Lỗi xóa bài viết!');
      }
    }
  };

  const handleSave = async (status: 'Draft' | 'Published') => {
    if (!title || !content) {
      alert('Vui lòng nhập tiêu đề và nội dung bài viết!');
      return;
    }
    setIsSaving(true);
    try {
      const postData = {
        title,
        slug,
        content,
        summary,
        thumbnail,
        category,
        status,
        attachedProducts: attachedProducts.map(p => p._id)
      };

      const url = editingPostId 
        ? `/admin/posts/${editingPostId}`
        : `/admin/posts`;
      
      const method = editingPostId ? 'put' : 'post';

      if (method === 'put') {
        await api.put(url, postData);
      } else {
        await api.post(url, postData);
      }

      alert(editingPostId ? 'Đã cập nhật bài viết!' : 'Đã tạo bài viết mới!');
      resetForm();
      setView('list');
    } catch (error: any) {
      alert('Lỗi lưu bài viết: ' + (error.response?.data?.message || error.message));
    } finally {
      setIsSaving(false);
    }
  };

  const addProductToPost = (p: Product) => {
    if (!attachedProducts.find(item => item._id === p._id)) {
      setAttachedProducts([...attachedProducts, p]);
    }
    setSearchProduct('');
    setProducts([]);
  };

  // RENDER DANH SÁCH BÀI VIẾT
  if (view === 'list') {
    return (
      <div className="space-y-10 animate-in fade-in duration-700">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-4xl font-black uppercase tracking-tighter italic flex items-center">
              <LayoutGrid size={32} className="mr-4 text-red-600" /> Quản lý tin tức
            </h1>
            <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-2 ml-12">Tổng cộng: {totalPosts} bài viết</p>
          </div>
          <button 
            onClick={() => { resetForm(); setView('editor'); }}
            className="bg-red-600 hover:bg-red-700 text-white px-8 py-5 rounded-[2rem] font-black uppercase text-xs tracking-[0.2em] transition-all flex items-center shadow-xl shadow-red-100 active:scale-95"
          >
            <Plus size={20} className="mr-3" /> Viết bài mới
          </button>
        </div>

        {isLoadingList ? (
          <div className="py-40 flex flex-col items-center justify-center space-y-4">
            <Loader2 className="animate-spin text-red-600" size={40} />
            <p className="text-[10px] font-black uppercase tracking-widest text-gray-400 italic">Đang tải dữ liệu bài viết...</p>
          </div>
        ) : (
          <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-50 bg-gray-50/50">
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Hình ảnh</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Thông tin bài viết</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400">Danh mục</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-center">Trạng thái</th>
                  <th className="p-8 text-[10px] font-black uppercase tracking-widest text-gray-400 text-right">Thao tác</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {posts.map(post => (
                  <tr key={post._id} className="group hover:bg-gray-50/50 transition-colors">
                    <td className="p-8">
                      <div className="w-20 h-20 rounded-2xl overflow-hidden shadow-sm border border-gray-100">
                        <img src={post.thumbnail || 'https://via.placeholder.com/150'} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" />
                      </div>
                    </td>
                    <td className="p-8">
                      <div className="max-w-md">
                        <p className="font-black text-sm uppercase tracking-tight text-gray-900 line-clamp-1">{post.title}</p>
                        <div className="flex items-center mt-2 text-[10px] font-bold text-gray-400 italic">
                          <Calendar size={12} className="mr-1" /> {new Date(post.createdAt).toLocaleDateString('vi-VN')}
                          <span className="mx-2">•</span>
                          <span className="text-gray-300">/{post.slug}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-8">
                      <span className="px-4 py-1.5 bg-gray-100 text-gray-600 text-[10px] font-black uppercase tracking-widest rounded-full">{post.category}</span>
                    </td>
                    <td className="p-8 text-center">
                      {post.status === 'Published' ? (
                        <span className="px-4 py-1.5 bg-green-50 text-green-600 text-[9px] font-black uppercase tracking-widest rounded-full border border-green-100">Đã đăng</span>
                      ) : (
                        <span className="px-4 py-1.5 bg-gray-100 text-gray-400 text-[9px] font-black uppercase tracking-widest rounded-full border border-gray-200">Bản nháp</span>
                      )}
                    </td>
                    <td className="p-8 text-right">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button onClick={() => window.open(`/news/${post.slug}`, '_blank')} className="p-3 bg-white text-gray-400 hover:text-red-600 rounded-xl shadow-sm border border-gray-100 transition-all"><Eye size={16} /></button>
                        <button onClick={() => handleEdit(post)} className="p-3 bg-white text-gray-400 hover:text-red-600 rounded-xl shadow-sm border border-gray-100 transition-all"><Edit size={16} /></button>
                        <button onClick={() => handleDelete(post._id)} className="p-3 bg-white text-gray-400 hover:text-red-600 rounded-xl shadow-sm border border-gray-100 transition-all"><Trash2 size={16} /></button>
                      </div>
                      <MoreVertical size={16} className="text-gray-200 group-hover:hidden ml-auto" />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {posts.length === 0 && (
              <div className="py-20 text-center">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-300 italic">Chưa có bài viết nào trong hệ thống</p>
              </div>
            )}

            {/* Pagination Controls */}
            {totalPages > 1 && (
              <div className="p-8 border-t border-gray-50 bg-gray-50/30 flex items-center justify-between">
                <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">Trang {currentPage} / {totalPages} (Tổng {totalPosts} bài)</p>
                <div className="flex items-center gap-2">
                  <button 
                    disabled={currentPage === 1}
                    onClick={() => setCurrentPage(prev => prev - 1)}
                    className="p-2 bg-white rounded-lg border border-gray-100 text-gray-400 hover:text-red-600 disabled:opacity-30 transition-all"
                  >
                    <ArrowLeft size={16} />
                  </button>
                  {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`w-8 h-8 rounded-lg text-[10px] font-black transition-all ${currentPage === page ? 'bg-red-600 text-white shadow-lg' : 'bg-white text-gray-400 border border-gray-100 hover:border-red-200'}`}
                    >
                      {page}
                    </button>
                  ))}
                  <button 
                    disabled={currentPage === totalPages}
                    onClick={() => setCurrentPage(prev => prev + 1)}
                    className="p-2 bg-white rounded-lg border border-gray-100 text-gray-400 hover:text-red-600 disabled:opacity-30 transition-all rotate-180"
                  >
                    <ArrowLeft size={16} />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    );
  }

  // RENDER TRÌNH SOẠN THẢO (EDITOR)
  return (
    <div className="flex flex-col lg:flex-row gap-10 animate-in fade-in slide-in-from-bottom-4 duration-1000 min-h-screen pb-20">
      
      {/* CỘT GIỮA: WYSIWYG EDITOR (REACT QUILL) */}
      <div className="flex-1 space-y-8">
        <div className="bg-white p-10 rounded-[3rem] shadow-2xl shadow-gray-100 border border-gray-50">
          <div className="flex items-center justify-between mb-10">
            <button onClick={() => setView('list')} className="text-xs font-black uppercase tracking-widest text-gray-400 hover:text-red-600 flex items-center transition-colors">
              <ArrowLeft size={16} className="mr-2" /> Quay lại danh sách
            </button>
            <span className="text-[10px] font-black text-red-600 bg-red-50 px-6 py-2 rounded-full uppercase italic tracking-widest border border-red-100">
              {editingPostId ? 'Chế độ: Chỉnh sửa bài viết' : 'Chế độ: Tạo bài viết mới'}
            </span>
          </div>

          <input 
            type="text" 
            placeholder="TIÊU ĐỀ BÀI VIẾT" 
            className="w-full text-5xl font-black uppercase tracking-tighter text-gray-950 border-none outline-none placeholder:text-gray-400 mb-10 italic"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
          />
          
          <div className="quill-editor-container">
            <ReactQuill 
              theme="snow"
              value={content}
              onChange={setContent}
              modules={modules}
              formats={formats}
              placeholder="Hãy ném hình ảnh hoặc dán nội dung từ Word vào đây..."
              className="bg-white"
            />
          </div>
        </div>
      </div>

      {/* CỘT PHẢI: AI WRITER & SEO */}
      <div className="w-full lg:w-[450px] space-y-8">
        
        {/* GEMINI AI WRITER */}
        <div className="bg-zinc-950 p-10 rounded-[3.5rem] shadow-2xl text-white space-y-8 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-10 opacity-10 rotate-12">
            <Sparkles size={150} />
          </div>
          
          <div className="flex items-center space-x-4 relative z-10">
            <div className="p-3 bg-red-600 rounded-2xl shadow-xl shadow-red-900/40"><Sparkles size={24} className="text-white" /></div>
            <div>
                <h3 className="text-base font-black uppercase tracking-widest italic"> AI VIẾT BÀI</h3>
                <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-tighter">Powered by Google AI</p>
            </div>
          </div>
          
          <div className="space-y-6 relative z-10">
            <textarea 
              rows={5} 
              placeholder="Nhập yêu cầu bài viết... (VD: Viết đánh giá sâu về Pickleball)" 
              className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 text-base font-medium focus:bg-white/10 outline-none transition-all placeholder:text-zinc-700 leading-relaxed"
              value={aiPrompt}
              onChange={(e) => setAiPrompt(e.target.value)}
            />
            
            <button 
              onClick={handleAiWrite}
              disabled={isAiLoading}
              className="w-full py-5 bg-red-600 hover:bg-red-700 disabled:bg-zinc-800 rounded-3xl font-black uppercase text-xs tracking-[0.3em] transition-all flex items-center justify-center shadow-2xl shadow-red-900/30 active:scale-95"
            >
              {isAiLoading ? <Loader2 className="animate-spin mr-3" size={20} /> : <Sparkles className="mr-3" size={20} />}
              {isAiLoading ? 'AI Đang viết bài...' : 'Generate nội dung'}
            </button>
            <p className="text-[9px] text-center text-zinc-500 font-bold uppercase tracking-widest">Nội dung AI sẽ được chèn trực tiếp vào Editor</p>
          </div>
        </div>

        {/* SEO & CONFIG */}
        <div className="bg-white p-10 rounded-[3.5rem] shadow-sm border border-gray-100 space-y-10">
          <div className="flex items-center space-x-4 border-b border-gray-50 pb-8">
            <div className="p-3 bg-gray-50 text-gray-900 rounded-2xl"><Globe size={24} /></div>
            <h3 className="text-sm font-black uppercase tracking-[0.2em] text-gray-400 italic">SEO Marketing</h3>
          </div>

          <div className="space-y-8">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Đường dẫn bài viết (URL)</label>
              <div className="flex items-center bg-gray-50 rounded-2xl px-6 py-4">
                <span className="text-[10px] text-gray-300 font-bold mr-2">/news/</span>
                <input type="text" className="bg-transparent border-none outline-none w-full font-bold text-base" value={slug} onChange={(e) => setSlug(e.target.value)} />
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Danh mục tin tức</label>
              <select className="w-full bg-gray-50 border-none rounded-2xl px-6 py-4 font-black text-base outline-none appearance-none cursor-pointer" value={category} onChange={(e) => setCategory(e.target.value)}>
                <option value="Review sản phẩm">REVIEW SẢN PHẨM</option>
                <option value="Hướng dẫn kỹ thuật">HƯỚNG DẪN KỸ THUẬT</option>
                <option value="Tin tức giải đấu">TIN TỨC GIẢI ĐẤU</option>
                <option value="Khuyến mãi">Khuyến mãi CỰC HOT</option>
              </select>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Ảnh đại diện (Thumbnail)</label>
              <div className="space-y-4">
                <label className={`flex flex-col items-center justify-center w-full h-32 border-2 border-dashed rounded-3xl cursor-pointer transition-all ${isUploading ? 'bg-zinc-50 border-zinc-200 cursor-not-allowed' : 'bg-gray-50 border-gray-100 hover:border-red-400 hover:bg-red-50/30'}`}>
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    {isUploading ? (
                      <>
                        <Loader2 className="w-8 h-8 mb-2 text-red-600 animate-spin" />
                        <p className="text-[8px] font-black text-red-600 uppercase tracking-widest">Đang tải lên S3...</p>
                      </>
                    ) : (
                      <>
                        <Upload className="w-8 h-8 mb-2 text-gray-300" />
                        <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest text-center px-4">Nhấn để upload ảnh đại diện</p>
                      </>
                    )}
                  </div>
                  <input type="file" className="hidden" accept="image/*" disabled={isUploading} onChange={handleImageUpload} />
                </label>
                
                <div className="flex items-center space-x-4">
                  <input type="text" placeholder="Hoặc dán link ảnh..." className="flex-1 bg-gray-50 border-none rounded-2xl px-6 py-4 font-bold text-base outline-none" value={thumbnail} onChange={(e) => setThumbnail(e.target.value)} />
                  <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center overflow-hidden border border-gray-100 shadow-inner relative group">
                    {thumbnail ? (
                      <>
                        <img src={thumbnail} className="w-full h-full object-cover" />
                        <button onClick={() => setThumbnail('')} className="absolute inset-0 bg-red-600/80 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"><X size={16} className="text-white" /></button>
                      </>
                    ) : <ImageIcon className="text-gray-200" size={24} />}
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest ml-1">Mô tả SEO (Brief)</label>
              <textarea rows={4} className="w-full bg-gray-50 border-none rounded-2xl p-6 text-base font-bold outline-none leading-relaxed" placeholder="Tóm tắt bài viết để thu hút người đọc trên Google..." value={summary} onChange={(e) => setSummary(e.target.value)} />
            </div>
          </div>
        </div>

        {/* CỤM NÚT LƯU */}
        <div className="grid grid-cols-2 gap-6">
          <button 
            onClick={() => handleSave('Draft')} 
            disabled={isSaving || isUploading} 
            className={`py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.2em] transition-all shadow-lg active:scale-95 ${isSaving || isUploading ? 'bg-gray-100 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-900'}`}
          >
            Lưu bản nháp
          </button>
          <button 
            onClick={() => handleSave('Published')} 
            disabled={isSaving || isUploading} 
            className={`py-5 rounded-[2rem] font-black uppercase text-[10px] tracking-[0.3em] transition-all flex items-center justify-center active:scale-95 ${isSaving || isUploading ? 'bg-red-400 text-white cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white shadow-[0_15px_40px_rgba(220,38,38,0.2)]'}`}
          >
            {isSaving || isUploading ? <Loader2 className="animate-spin" size={18} /> : <Save className="mr-3" size={18} />} 
            {isUploading ? 'ĐANG TẢI ẢNH...' : 'XUẤT BẢN'}
          </button>
        </div>
      </div>

      <style>{`
        .quill-editor-container .ql-container { min-height: 500px; font-family: 'Inter', sans-serif; font-size: 1rem; border: none !important; }
        .quill-editor-container .ql-toolbar { border-radius: 2rem 2rem 0 0 !important; border: 1px solid #f3f4f6 !important; background: #f9fafb !important; padding: 1rem !important; }
        .quill-editor-container .ql-container.ql-snow { border: 1px solid #f3f4f6 !important; border-top: none !important; border-radius: 0 0 2rem 2rem !important; }
        .ql-editor.ql-blank::before { color: #9ca3af !important; font-style: normal !important; opacity: 1 !important; }
        .ql-editor h1, .ql-editor h2, .ql-editor h3 { font-weight: 900; text-transform: uppercase; tracking: -0.05em; margin-top: 1.5rem; }
        .ql-editor p { line-height: 1.8; color: #374151; }
      `}</style>
    </div>
  );
};

export default AdminNews;
