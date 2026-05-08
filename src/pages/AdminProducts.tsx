import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import axios from 'axios';
import { Plus, Edit, Trash2, ChevronLeft, ChevronRight, Package, X, Save, Info, Settings, Database, Image as ImageIcon, Activity, Search, Filter, ArrowUpDown, Upload, Loader2 } from 'lucide-react';

interface IVariant {
  size?: string;
  color?: string;
  stock: number;
}

interface IProduct {
  _id: string;
  name: string;
  description: string;
  price: number;
  salePrice?: number;
  category: 'Cầu lông' | 'Pickleball' | 'Quần áo' | 'Dây Đan Vợt' | 'Giày Thể Thao' | 'Phụ Kiện';
  brand: string;
  sku: string;
  status: 'Còn hàng' | 'Hết hàng' | 'Ngừng kinh doanh';
  specifications: {
    badminton?: any;
    pickleball?: any;
    clothes?: any;
    shoes?: any;
  };
  mainImage: string;
  gallery: string[];
  variants: IVariant[];
  isFeatured: boolean;
  isFocus: boolean;
  isActive: boolean;
  slug: string;
}

const CLOTHES_SIZES = ['S', 'M', 'L', 'XL', 'XXL', '3XL', '4XL', 'Free Size'];
const CLOTHES_COLORS = ['Đen', 'Trắng', 'Đỏ', 'Xanh Dương', 'Xanh Lá', 'Vàng', 'Xám', 'Tím', 'Hồng', 'Cam', 'Nâu', 'Navy', 'Cream', 'Beige'];
const SHOE_SIZES = ['35', '36', '37', '38', '39', '40', '41', '42', '43', '44', '45'];

const AdminProducts: React.FC = () => {
  const navigate = useNavigate();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Filter & Search
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [keyword, setKeyword] = useState('');
  const [category, setCategory] = useState('');
  const [sort, setSort] = useState('newest');

  // State UI
  const [activeTab, setActiveTab] = useState('basic');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<IProduct | null>(null);
  const [formError, setFormError] = useState('');
  const [isUploading, setIsUploading] = useState(false);

  const categories = ['Cầu lông', 'Pickleball', 'Quần áo', 'Giày Thể Thao', 'Phụ Kiện'];

  const initialFormState = {
    name: '', description: '', price: 0, salePrice: 0, category: 'Cầu lông' as any,
    brand: '', sku: '', status: 'Còn hàng' as any,
    specifications: {
      badminton: { weightGrip: '', balance: '', maxTension: '', frameThickness: '', shaftDiameter: '', frameMaterial: '', shaftMaterial: '', length: '', color: '', origin: '' },
      pickleball: { surface: '', core: '', upaACert: false, usapCert: false, warranty: '', shape: '', length: '', width: '', handleType: '', handleLength: '', handleCircumference: '' },
      clothes: { material: '', sizes: [] as string[], colors: [] as string[], origin: '', technology: '' },
      shoes: { color: '', origin: '', technology: '', soleMaterial: '', upperMaterial: '' },
      others: ''
    },
    mainImage: '', gallery: [''],
    variants: [] as IVariant[],
    isFeatured: false, isFocus: false, isActive: true
  };

  const [formData, setFormData] = useState(initialFormState);

  // Hàm xử lý upload ảnh lên S3 qua Presigned URL
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>, type: 'main' | 'gallery', index?: number) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      alert('Vui lòng chỉ chọn file ảnh.');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Dung lượng ảnh quá lớn (tối đa 5MB).');
      return;
    }

    setIsUploading(true);
    try {
      // 1. Lấy Presigned URL từ Backend qua api bảo mật
      const { data } = await api.post('/admin/s3/upload-url', {
        fileName: file.name,
        fileType: file.type
      });

      const { uploadUrl, fileUrl } = data;

      // 2. Đẩy ảnh trực tiếp lên S3 - Dùng axios gốc
      await axios.put(uploadUrl, file, {
        headers: { 'Content-Type': file.type }
      });

      // 3. Cập nhật URL vào Form
      if (type === 'main') {
        setFormData(prev => ({ ...prev, mainImage: fileUrl }));
      } else if (type === 'gallery' && index !== undefined) {
        const newGallery = [...formData.gallery];
        newGallery[index] = fileUrl;
        setFormData(prev => ({ ...prev, gallery: newGallery }));
      }
    } catch (error: any) {
      console.error('Lỗi upload:', error);
      alert('Không thể upload ảnh. Vui lòng kiểm tra cấu hình.');
    } finally {
      setIsUploading(false);
    }
  };

  const fetchProducts = async () => {
    setLoading(true);
    try {
      const { data } = await api.get(`/products?page=${page}&limit=10&isAdmin=true&sort=${sort}${keyword ? `&keyword=${keyword}` : ''}${category ? `&category=${category}` : ''}`);
      setProducts(data.products);
      setPages(data.pages);
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [page, keyword, category, sort]);

  const handleAddClick = () => {
    setEditingProduct(null);
    setFormData(initialFormState);
    setFormError('');
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  const handleEditClick = (product: IProduct) => {
    setEditingProduct(product);
    setFormData({
      ...initialFormState,
      ...product,
      gallery: product.gallery && product.gallery.length > 0 ? product.gallery : [''],
      variants: product.variants || [],
      specifications: {
        ...initialFormState.specifications,
        ...product.specifications,
        clothes: {
          ...initialFormState.specifications.clothes,
          ...(product.specifications?.clothes || {}),
          sizes: Array.isArray(product.specifications?.clothes?.sizes) 
            ? product.specifications.clothes.sizes 
            : (product.specifications?.clothes?.size ? [product.specifications.clothes.size] : []),
          colors: Array.isArray(product.specifications?.clothes?.colors) 
            ? product.specifications.clothes.colors 
            : (product.specifications?.clothes?.color ? [product.specifications.clothes.color] : [])
        }
      }
    });
    setFormError('');
    setActiveTab('basic');
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Bạn có chắc chắn muốn xóa sản phẩm này?')) {
      try {
        await api.delete(`/admin/products/${id}`);
        fetchProducts();
      } catch (error) { alert('Lỗi khi xóa'); }
    }
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');

    // Frontend Validation
    if (!formData.name.trim()) return setFormError('Vui lòng nhập tên sản phẩm.');
    if (!formData.brand.trim()) return setFormError('Vui lòng nhập thương hiệu.');
    if (!formData.mainImage) return setFormError('Vui lòng upload ảnh đại diện cho sản phẩm.');
    if (formData.price <= 0) return setFormError('Giá niêm yết phải lớn hơn 0.');
    if (!formData.description.trim()) return setFormError('Vui lòng nhập mô tả sản phẩm.');

    const url = editingProduct ? `/admin/products/${editingProduct._id}` : `/admin/products`;
    const method = editingProduct ? 'put' : 'post';

    const cleanedData = {
      ...formData,
      name: formData.name.trim(),
      brand: formData.brand.trim(),
      sku: formData.sku?.trim(),
    };

    try {
      const cleanedVariants = formData.variants.filter(v => v.color?.trim() !== '' && v.size?.trim() !== '');
      
      const finalData = {
        ...cleanedData,
        variants: cleanedVariants
      };

      if (method === 'put') {
        await api.put(url, finalData);
      } else {
        await api.post(url, finalData);
      }
      setIsModalOpen(false);
      fetchProducts();
    } catch (err: any) { 
      setFormError(err.response?.data?.message || 'Lỗi lưu sản phẩm'); 
    }
  };

  // Logic quản lý biến thể
  const addVariant = () => {
    setFormData({
      ...formData,
      variants: [...formData.variants, { size: '', color: '', stock: 0 }]
    });
  };

  const removeVariant = (index: number) => {
    setFormData({
      ...formData,
      variants: formData.variants.filter((_, i) => i !== index)
    });
  };

  const updateVariant = (index: number, field: keyof IVariant, value: any) => {
    const newVariants = [...formData.variants];
    newVariants[index] = { ...newVariants[index], [field]: value };
    setFormData({ ...formData, variants: newVariants });
  };

  return (
    <div className="animate-in fade-in duration-500 pb-20">
      {/* HEADER & ACTION */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
        <div>
          <h2 className="text-4xl font-black text-gray-900 uppercase tracking-tighter text-red-600 italic">Quản lý kho</h2>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-widest mt-1">Tổng cộng: {products.length} sản phẩm trên trang này</p>
        </div>
        <button onClick={handleAddClick} className="bg-black hover:bg-gray-800 text-white px-10 py-5 rounded-[2.5rem] flex items-center transition-all shadow-2xl font-black uppercase tracking-widest text-[10px] active:scale-95">
          <Plus className="w-5 h-5 mr-2 text-red-600" /> Thêm sản phẩm mới
        </button>
      </div>

      {/* SEARCH & FILTER BAR */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8 bg-white p-6 rounded-[2.5rem] shadow-sm border border-gray-100">
        <div className="md:col-span-2 relative">
          <Search className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={18} />
          <input 
            type="text" 
            placeholder="Tìm theo tên, thương hiệu hoặc SKU..." 
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-[1.5rem] text-xs font-bold outline-none focus:ring-2 focus:ring-red-600 transition-all"
            value={keyword}
            onChange={(e) => { setKeyword(e.target.value); setPage(1); }}
          />
        </div>

        <div className="relative">
          <Filter className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
          <select 
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest appearance-none outline-none focus:ring-2 focus:ring-red-600"
            value={category}
            onChange={(e) => { setCategory(e.target.value); setPage(1); }}
          >
            <option value="">Tất cả danh mục</option>
            {categories.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        <div className="relative">
          <ArrowUpDown className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-300" size={16} />
          <select 
            className="w-full pl-14 pr-6 py-4 bg-gray-50 border-none rounded-[1.5rem] text-[10px] font-black uppercase tracking-widest appearance-none outline-none focus:ring-2 focus:ring-red-600"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="newest">Mới nhất</option>
            <option value="price-asc">Giá thấp đến cao</option>
            <option value="price-desc">Giá cao đến thấp</option>
            <option value="oldest">Cũ nhất</option>
          </select>
        </div>
      </div>

      {/* BẢNG DANH SÁCH */}
      <div className="bg-white rounded-[3rem] shadow-sm border border-gray-100 overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-50/50">
            <tr>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Sản phẩm</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Trạng thái</th>
              <th className="px-8 py-6 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em] text-right">Quản lý</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {loading ? (
              <tr><td colSpan={3} className="px-8 py-32 text-center text-red-600 animate-pulse font-black uppercase tracking-[0.3em]">Đang tìm kiếm...</td></tr>
            ) : products.length === 0 ? (
              <tr><td colSpan={3} className="px-8 py-32 text-center text-gray-300 font-bold italic">Không tìm thấy sản phẩm nào phù hợp yêu cầu.</td></tr>
            ) : products.map((product) => (
              <tr key={product._id} className="hover:bg-gray-50/80 transition-all group">
                <td className="px-8 py-6">
                  <div className="flex items-center space-x-6">
                    <div className="relative">
                      <img src={product.mainImage} className="w-20 h-20 rounded-[2rem] object-cover border border-gray-100 shadow-md transition-transform group-hover:scale-110" alt="" />
                      {!product.isActive && <div className="absolute inset-0 bg-white/60 backdrop-blur-[1px] flex items-center justify-center rounded-[2rem] text-[8px] font-black text-red-600 uppercase tracking-tighter">Đã ẩn</div>}
                    </div>
                    <div>
                      <div className="text-[10px] font-black text-red-600 uppercase tracking-widest">{product.brand}</div>
                      <div className="font-bold text-gray-900 group-hover:text-red-600 transition-colors text-lg uppercase tracking-tighter leading-tight">{product.name}</div>
                      <div className="text-[10px] text-gray-400 font-mono uppercase tracking-widest mt-1">Mã: {product.sku}</div>
                    </div>
                  </div>
                </td>
                <td className="px-8 py-6">
                  <div className="flex flex-col space-y-1">
                    <span className="text-[10px] font-black text-gray-900">{product.price.toLocaleString()}đ</span>
                    <span className={`text-[9px] font-bold uppercase tracking-widest ${product.isActive ? 'text-green-500' : 'text-gray-300'}`}>
                      {product.isActive ? '● Đang hiển thị' : '○ Đang ẩn'}
                    </span>
                  </div>
                </td>
                <td className="px-8 py-6 text-right">
                  <div className="flex justify-end space-x-2">
                    <button onClick={() => handleEditClick(product)} className="p-4 text-blue-600 hover:bg-white hover:shadow-lg rounded-[1.5rem] transition-all"><Edit size={20} /></button>
                    <button onClick={() => handleDelete(product._id)} className="p-4 text-red-600 hover:bg-white hover:shadow-lg rounded-[1.5rem] transition-all"><Trash2 size={20} /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        
        {/* PHÂN TRANG */}
        <div className="p-10 bg-gray-50/30 border-t flex justify-between items-center text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">
          Trang {page} / {pages}
          <div className="flex space-x-3">
            <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-4 bg-white border border-gray-100 rounded-[1.5rem] disabled:opacity-30 shadow-sm hover:shadow-xl transition-all"><ChevronLeft size={20} /></button>
            <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="p-4 bg-white border border-gray-100 rounded-[1.5rem] disabled:opacity-30 shadow-sm hover:shadow-xl transition-all"><ChevronRight size={20} /></button>
          </div>
        </div>
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-[60]">
          <div className="bg-white rounded-[3rem] max-w-5xl w-full h-[90vh] flex flex-col shadow-2xl overflow-hidden border border-white/20">
            <div className="p-10 border-b flex justify-between items-center bg-white">
              <div>
                <h3 className="text-2xl font-black text-gray-900 uppercase tracking-tighter">{editingProduct ? 'Cập Nhật Sản Phẩm' : 'Đăng Sản Phẩm Mới'}</h3>
                <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest italic">Hệ thống quản trị kho hàng chuyên nghiệp</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="p-4 bg-gray-100 text-gray-400 hover:text-gray-900 rounded-[1.5rem] transition-all"><X size={24} /></button>
            </div>

            <div className="flex px-10 bg-white border-b overflow-x-auto no-scrollbar">
              {[
                { id: 'basic', label: 'Thông tin chung', icon: Info },
                { id: 'specs', label: 'Kỹ thuật & Biến thể', icon: Settings },
                { id: 'images', label: 'Hình ảnh', icon: ImageIcon },
                { id: 'status', label: 'Hiển thị', icon: Activity },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center px-8 py-6 text-[10px] font-black uppercase tracking-[0.2em] border-b-4 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-red-600 text-red-600 bg-red-50/50' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                  <tab.icon size={16} className="mr-2" /> {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-gray-50/30">
              {formError && <div className="mb-8 p-5 bg-red-50 border border-red-100 text-red-600 rounded-[1.5rem] font-black uppercase text-[10px] tracking-widest flex items-center shadow-sm"><X size={16} className="mr-3" /> {formError}</div>}

              {activeTab === 'basic' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tên sản phẩm</label><input type="text" required className="form-input-custom" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="VD: Yonex Astrox 100ZZ" /></div>
                    <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Mã SKU (Tự động)</label><input type="text" className="form-input-custom bg-gray-100/50" value={formData.sku} onChange={e => setFormData({...formData, sku: e.target.value})} placeholder="Hệ thống tự tạo..." /></div>
                    <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Thương hiệu</label><input type="text" required className="form-input-custom" value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} placeholder="Yonex, Wilson..." /></div>
                    <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Danh mục</label>
                      <select className="form-input-custom font-black uppercase text-xs" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value as any})}>
                        {categories.map(c => <option key={c} value={c}>{c}</option>)}
                      </select>
                    </div>
                    <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Giá niêm yết</label><input type="text" required className="form-input-custom font-black text-red-600" value={formData.price === 0 ? '' : formData.price.toLocaleString('vi-VN')} onChange={e => { const val = e.target.value.replace(/\D/g, ''); setFormData({...formData, price: val === '' ? 0 : Number(val)}); }} placeholder="0" /></div>
                    <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Giá khuyến mãi</label><input type="text" className="form-input-custom font-black text-green-600" value={formData.salePrice === 0 || !formData.salePrice ? '' : formData.salePrice.toLocaleString('vi-VN')} onChange={e => { const val = e.target.value.replace(/\D/g, ''); setFormData({...formData, salePrice: val === '' ? 0 : Number(val)}); }} placeholder="0" /></div>
                  </div>
                  <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Mô tả sản phẩm</label><textarea rows={6} required className="form-input-custom" value={formData.description} onChange={e => setFormData({...formData, description: e.target.value})} /></div>
                </div>
              )}

              {activeTab === 'specs' && (
                <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4">
                  {/* PHẦN 1: THÔNG SỐ KỸ THUẬT THEO DANH MỤC */}
                  <div>
                    {formData.category === 'Cầu lông' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                          { label: 'Trọng lượng / Cán', key: 'weightGrip' }, { label: 'Độ cân bằng', key: 'balance' },
                          { label: 'Mức căng tối đa', key: 'maxTension' }, { label: 'Độ dày khung', key: 'frameThickness' },
                          { label: 'Đường kính đũa', key: 'shaftDiameter' }, { label: 'Vật liệu khung', key: 'frameMaterial' },
                          { label: 'Vật liệu đũa', key: 'shaftMaterial' }, { label: 'Chiều dài', key: 'length' },
                          { label: 'Màu sắc', key: 'color' }, { label: 'Xuất xứ', key: 'origin' },
                        ].map(f => (
                          <div key={f.key} className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{f.label}</label>
                            <input type="text" className="form-input-custom text-sm" value={(formData.specifications.badminton as any)?.[f.key] || ''} 
                              onChange={e => setFormData({...formData, specifications: {...formData.specifications, badminton: { ...formData.specifications.badminton as any, [f.key]: e.target.value }}})} 
                            />
                          </div>
                        ))}
                      </div>
                    ) : formData.category === 'Pickleball' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                          { label: 'Bề mặt', key: 'surface' }, { label: 'Cốt lõi', key: 'core' },
                          { label: 'Bảo hành', key: 'warranty' }, { label: 'Hình dáng', key: 'shape' },
                          { label: 'Dài (mm)', key: 'length' }, { label: 'Rộng (mm)', key: 'width' },
                          { label: 'Loại tay cầm', key: 'handleType' }, { label: 'Dài tay cầm (mm)', key: 'handleLength' },
                          { label: 'Chu vi tay cầm (mm)', key: 'handleCircumference' },
                        ].map(f => (
                          <div key={f.key} className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{f.label}</label>
                            <input type="text" className="form-input-custom text-sm" value={(formData.specifications.pickleball as any)?.[f.key] || ''} 
                              onChange={e => setFormData({...formData, specifications: {...formData.specifications, pickleball: { ...formData.specifications.pickleball as any, [f.key]: e.target.value }}})} 
                            />
                          </div>
                        ))}
                      </div>
                    ) : formData.category === 'Quần áo' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Chất liệu</label>
                          <input type="text" className="form-input-custom text-sm" value={formData.specifications.clothes?.material || ''} 
                            onChange={e => setFormData({...formData, specifications: {...formData.specifications, clothes: { ...formData.specifications.clothes, material: e.target.value }}})} 
                            placeholder="VD: 100% Polyester"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Xuất xứ</label>
                          <input type="text" className="form-input-custom text-sm" value={formData.specifications.clothes?.origin || ''} 
                            onChange={e => setFormData({...formData, specifications: {...formData.specifications, clothes: { ...formData.specifications.clothes, origin: e.target.value }}})} 
                            placeholder="VD: Việt Nam"
                          />
                        </div>
                      </div>
                    ) : formData.category === 'Giày Thể Thao' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {[
                          { label: 'Xuất xứ', key: 'origin' },
                          { label: 'Công nghệ', key: 'technology' }, { label: 'Chất liệu đế', key: 'soleMaterial' },
                          { label: 'Chất liệu thân giày', key: 'upperMaterial' },
                        ].map(f => (
                          <div key={f.key} className="space-y-2">
                            <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">{f.label}</label>
                            <input type="text" className="form-input-custom text-sm" value={(formData.specifications.shoes as any)?.[f.key] || ''} 
                              onChange={e => setFormData({...formData, specifications: {...formData.specifications, shoes: { ...formData.specifications.shoes as any, [f.key]: e.target.value }}})} 
                            />
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-20 bg-zinc-50 rounded-[3rem] border-2 border-dashed border-zinc-100">
                        <Package size={32} className="text-zinc-200 mb-4" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-zinc-400">Thông số kỹ thuật mặc định</h4>
                      </div>
                    )}
                  </div>

                  {/* PHẦN 2: QUẢN LÝ BIẾN THỂ (CHỈ CHO GIÀY & QUẦN ÁO) */}
                  {(formData.category === 'Giày Thể Thao' || formData.category === 'Quần áo') && (
                    <div className="pt-12 border-t border-gray-100 space-y-10">
                      <div className="flex justify-between items-center">
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-widest text-red-600">Phân loại hàng (Màu & Size)</h4>
                          <p className="text-[10px] text-gray-400 font-bold mt-1 uppercase tracking-widest">Tạo nhóm Màu sắc và chọn các Size tương ứng</p>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => {
                            // Logic: Thêm một biến thể mẫu để người dùng bắt đầu nhập
                            setFormData({ ...formData, variants: [...formData.variants, { color: '', size: '', stock: 0 }] });
                          }}
                          className="bg-black text-white px-6 py-3 rounded-xl flex items-center transition-all shadow-lg font-black uppercase tracking-widest text-[10px]"
                        >
                          <Plus className="w-4 h-4 mr-2" /> Thêm nhóm màu mới
                        </button>
                      </div>

                      <div className="space-y-8">
                        {/* Grouping variants by color for UI */}
                        {Object.entries(
                          formData.variants.reduce((acc, v) => {
                            const color = v.color || '';
                            if (!acc[color]) acc[color] = [];
                            acc[color].push(v);
                            return acc;
                          }, {} as Record<string, IVariant[]>)
                        ).map(([colorName, colorVariants], colorIdx) => (
                          <div key={colorIdx} className="bg-white p-8 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-2 h-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="flex justify-between items-center">
                              <div className="flex-1 max-w-md">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Tên màu sắc</label>
                                <input 
                                  type="text" 
                                  className="form-input-custom !py-3 !text-xs font-black" 
                                  value={colorName} 
                                  onChange={e => {
                                    const newColor = e.target.value;
                                    const newVariants = formData.variants.map(v => v.color === colorName ? { ...v, color: newColor } : v);
                                    setFormData({ ...formData, variants: newVariants });
                                  }}
                                  placeholder="VD: Trắng - Xanh Ngọc"
                                />
                              </div>
                              <button 
                                type="button" 
                                onClick={() => {
                                  const newVariants = formData.variants.filter(v => v.color !== colorName);
                                  setFormData({ ...formData, variants: newVariants });
                                }}
                                className="p-3 text-gray-300 hover:text-red-600 transition-all"
                              >
                                <Trash2 size={18} />
                              </button>
                            </div>

                            <div className="space-y-4">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Chọn kích thước (Size)</label>
                              <div className="flex flex-wrap gap-2">
                                {(formData.category === 'Giày Thể Thao' ? SHOE_SIZES : CLOTHES_SIZES).map(size => {
                                  const isSelected = colorVariants.some(v => v.size === size);
                                  return (
                                    <button
                                      key={size}
                                      type="button"
                                      onClick={() => {
                                        if (isSelected) {
                                          const newVariants = formData.variants.filter(v => !(v.color === colorName && v.size === size));
                                          setFormData({ ...formData, variants: newVariants });
                                        } else {
                                          setFormData({ ...formData, variants: [...formData.variants, { color: colorName, size, stock: 0 }] });
                                        }
                                      }}
                                      className={`px-4 py-2 rounded-lg text-[10px] font-black transition-all border-2 ${isSelected ? 'bg-red-600 border-red-600 text-white shadow-md' : 'bg-gray-50 border-transparent text-gray-400 hover:border-gray-200'}`}
                                    >
                                      {size}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>

                            {/* Đã xóa ô nhập Kho theo yêu cầu */}
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'images' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                  <div className="space-y-4">
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ảnh đại diện sản phẩm</label>
                    <div className="flex flex-col md:flex-row gap-6 items-start">
                      {formData.mainImage && (
                        <div className="relative group">
                          <img src={formData.mainImage} alt="Preview" className="w-40 h-40 object-cover rounded-[2rem] border-2 border-red-100 shadow-xl" />
                          <button type="button" onClick={() => setFormData({...formData, mainImage: ''})} className="absolute -top-2 -right-2 p-2 bg-white text-red-600 rounded-full shadow-lg opacity-0 group-hover:opacity-100 transition-all"><X size={16} /></button>
                        </div>
                      )}
                      <div className="flex-1 w-full">
                        <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all ${isUploading ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-200 hover:border-red-400 hover:bg-red-50/30'}`}>
                          <div className="flex flex-col items-center justify-center pt-5 pb-6">
                            {isUploading ? (
                              <>
                                <Loader2 className="w-10 h-10 mb-3 text-red-600 animate-spin" />
                                <p className="text-[10px] font-black text-red-600 uppercase tracking-widest">Đang tải ảnh lên S3...</p>
                              </>
                            ) : (
                              <>
                                <Upload className="w-10 h-10 mb-3 text-gray-400" />
                                <p className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Nhấn để chọn hoặc kéo thả ảnh</p>
                                <p className="text-[8px] text-gray-400 mt-1 uppercase">PNG, JPG, WEBP (Tối đa 5MB)</p>
                              </>
                            )}
                          </div>
                          <input type="file" className="hidden" accept="image/*" disabled={isUploading} onChange={(e) => handleImageUpload(e, 'main')} />
                        </label>
                        <div className="mt-4">
                          <label className="text-[8px] font-black text-gray-300 uppercase tracking-widest block mb-2">Hoặc dán URL ảnh trực tiếp:</label>
                          <input type="text" className="form-input-custom !py-3 !text-xs" value={formData.mainImage} onChange={e => setFormData({...formData, mainImage: e.target.value})} placeholder="https://..." />
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 border-t space-y-6">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bộ sưu tập ảnh ({formData.gallery.length})</label>
                      <button type="button" onClick={() => setFormData({...formData, gallery: [...formData.gallery, '']})} className="text-[10px] font-black text-blue-600 uppercase tracking-widest underline decoration-2 underline-offset-4">Thêm ô nhập</button>
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                      {formData.gallery.map((g, i) => (
                        <div key={i} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-4">
                          <div className="flex gap-4 items-center">
                            {g ? (
                              <img src={g} alt="" className="w-16 h-16 object-cover rounded-xl border border-gray-100" />
                            ) : (
                              <div className="w-16 h-16 bg-gray-50 rounded-xl flex items-center justify-center text-gray-300"><ImageIcon size={24} /></div>
                            )}
                            <div className="flex-1">
                              <label className={`block text-center py-2 px-4 rounded-xl text-[8px] font-black uppercase tracking-widest border border-dashed cursor-pointer transition-all ${isUploading ? 'bg-gray-50 text-gray-300 border-gray-200' : 'bg-blue-50 text-blue-600 border-blue-200 hover:bg-blue-100'}`}>
                                {isUploading ? 'Đang tải...' : 'Chọn file upload'}
                                <input type="file" className="hidden" accept="image/*" disabled={isUploading} onChange={(e) => handleImageUpload(e, 'gallery', i)} />
                              </label>
                            </div>
                            <button type="button" onClick={() => setFormData({...formData, gallery: formData.gallery.filter((_, idx) => idx !== i)})} className="p-2 text-red-300 hover:text-red-600 transition-all"><Trash2 size={16} /></button>
                          </div>
                          <input type="text" className="form-input-custom !py-3 !text-[10px]" value={g} onChange={e => { const ng = [...formData.gallery]; ng[i] = e.target.value; setFormData({...formData, gallery: ng}) }} placeholder="Dán URL ảnh hoặc upload file..." />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'status' && (
                <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-white p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-8">
                    <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái tồn kho</label>
                      <select className="form-input-custom font-black uppercase text-xs tracking-widest" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                        <option value="Còn hàng">✅ Còn hàng</option>
                        <option value="Hết hàng">❌ Hết hàng</option>
                        <option value="Ngừng kinh doanh">🚫 Ngừng kinh doanh</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6">
                      {[
                        { id: 'isFeatured', label: 'Sản phẩm nổi bật' },
                        { id: 'isFocus', label: 'Sản phẩm tiêu điểm' },
                        { id: 'isActive', label: 'Kích hoạt hiển thị' },
                      ].map(k => (
                        <label key={k.id} className="flex items-center p-6 bg-gray-50 rounded-[1.5rem] cursor-pointer hover:bg-red-50 transition-all border-2 border-transparent hover:border-red-100 group">
                          <input type="checkbox" className="w-6 h-6 rounded-lg text-red-600 mr-4 border-gray-300 focus:ring-red-500" checked={(formData as any)[k.id]} onChange={e => setFormData({...formData, [k.id]: e.target.checked})} />
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest group-hover:text-red-600">{k.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              <div className="mt-12 flex gap-6 sticky bottom-0 bg-gray-50/80 backdrop-blur-md p-4 rounded-[2rem]">
                <button 
                  type="submit" 
                  disabled={isUploading}
                  className={`flex-1 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] shadow-2xl transition-all active:scale-95 flex items-center justify-center ${isUploading ? 'bg-gray-400 cursor-not-allowed shadow-none' : 'bg-red-600 hover:bg-red-700 text-white shadow-red-200'}`}
                >
                  {isUploading ? <Loader2 className="w-6 h-6 animate-spin mr-3" /> : <Save size={24} className="mr-3" />}
                  {isUploading ? 'ĐANG TẢI ẢNH...' : 'CẬP NHẬT HỆ THỐNG'}
                </button>
                <button type="button" onClick={() => setIsModalOpen(false)} className="px-12 bg-white text-gray-400 hover:text-gray-900 py-6 rounded-[2rem] font-black uppercase tracking-[0.2em] border border-gray-100 hover:bg-gray-50 transition-all">Đóng</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .form-input-custom { width: 100%; padding: 1.5rem; background: white; border: 1.5px solid #f3f4f6; border-radius: 1.5rem; font-weight: 800; color: #1f2937; outline: none; transition: all 0.3s; box-shadow: 0 2px 4px rgba(0,0,0,0.02); }
        .form-input-custom:focus { border-color: #dc2626; box-shadow: 0 15px 30px -10px rgba(220, 38, 38, 0.15); transform: translateY(-2px); }
        .no-scrollbar::-webkit-scrollbar { display: none; }
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-thumb { background: #e5e7eb; border-radius: 10px; }
      `}</style>
    </div>
  );
};

export default AdminProducts;
