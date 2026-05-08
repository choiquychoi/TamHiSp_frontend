import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '@/lib/axios';
import axios from 'axios';
import { Badge } from '@/components/ui/badge';
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

      {/* DANH SÁCH SẢN PHẨM (CARD BASED) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-1 gap-6">
        {loading ? (
          <div className="bg-white rounded-[2rem] p-20 text-center border border-gray-100 shadow-sm col-span-full">
            <div className="animate-spin text-red-600 inline-block mb-4"><Package size={48} /></div>
            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-gray-400">Đang tìm kiếm...</p>
          </div>
        ) : products.length === 0 ? (
          <div className="bg-white rounded-[2rem] p-20 text-center border border-gray-100 shadow-sm col-span-full">
            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-300 italic">Không tìm thấy sản phẩm</p>
          </div>
        ) : products.map((product) => (
          <div key={product._id} className="bg-white p-4 md:p-6 rounded-[2rem] border border-gray-100 shadow-sm hover:shadow-xl transition-all group relative overflow-hidden">
            {!product.isActive && <div className="absolute top-0 right-0 bg-red-600 text-white px-4 py-1 text-[8px] font-black uppercase tracking-widest rounded-bl-2xl">Đang ẩn</div>}
            
            <div className="flex flex-col md:flex-row gap-6 items-start md:items-center">
              <div className="relative shrink-0 w-full md:w-32 aspect-square md:h-32 rounded-3xl overflow-hidden border border-gray-50 bg-gray-50 flex items-center justify-center p-2">
                <img src={product.mainImage} className="w-full h-full object-contain mix-blend-multiply group-hover:scale-110 transition-transform duration-500" alt="" />
              </div>
              
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex justify-between items-start">
                  <div>
                    <p className="text-[10px] font-black text-red-600 uppercase tracking-widest leading-none mb-1">{product.brand}</p>
                    <h3 className="text-lg md:text-xl font-black uppercase tracking-tighter text-gray-950 leading-tight group-hover:text-red-600 transition-colors line-clamp-2">{product.name}</h3>
                  </div>
                </div>

                <div className="flex flex-wrap gap-x-6 gap-y-2 pt-2 border-t border-gray-50">
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Giá niêm yết</p>
                    <p className="text-sm font-black text-gray-950">{product.price.toLocaleString()}₫</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Mã SKU</p>
                    <p className="text-[10px] font-bold text-gray-900 uppercase tracking-tighter italic">{product.sku}</p>
                  </div>
                  <div>
                    <p className="text-[8px] font-black text-gray-400 uppercase tracking-widest">Trạng thái</p>
                    <Badge className={`rounded-none text-[8px] font-black uppercase px-2 py-0.5 ${product.status === 'Còn hàng' ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : 'bg-red-50 text-red-600 border-red-100'}`}>
                      {product.status}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 w-full md:w-auto pt-4 md:pt-0 border-t md:border-t-0 border-gray-50 md:flex-col lg:flex-row">
                <button onClick={() => handleEditClick(product)} className="flex-1 md:flex-none p-4 bg-gray-50 text-blue-600 hover:bg-blue-600 hover:text-white rounded-2xl transition-all flex items-center justify-center gap-2">
                  <Edit size={18} /> <span className="md:hidden lg:inline text-[10px] font-black uppercase tracking-widest">Chỉnh sửa</span>
                </button>
                <button onClick={() => handleDelete(product._id)} className="flex-1 md:flex-none p-4 bg-gray-50 text-red-600 hover:bg-red-600 hover:text-white rounded-2xl transition-all flex items-center justify-center gap-2">
                  <Trash2 size={18} /> <span className="md:hidden lg:inline text-[10px] font-black uppercase tracking-widest">Xóa</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
        
      {/* PHÂN TRANG */}
      <div className="mt-12 flex justify-center items-center gap-4 bg-white p-4 rounded-[2rem] shadow-sm border border-gray-100">
        <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-3 bg-gray-50 rounded-xl disabled:opacity-30 shadow-sm hover:bg-white transition-all"><ChevronLeft size={20} /></button>
        <span className="text-[10px] font-black uppercase text-gray-400">Trang {page} / {pages}</span>
        <button onClick={() => setPage(p => Math.min(pages, p + 1))} disabled={page === pages} className="p-3 bg-gray-50 rounded-xl disabled:opacity-30 shadow-sm hover:bg-white transition-all"><ChevronRight size={20} /></button>
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-gray-950/80 backdrop-blur-md flex items-end md:items-center justify-center p-0 md:p-4 z-[60]">
          <div className="bg-white rounded-t-[3rem] md:rounded-[3rem] w-full max-w-5xl h-[94vh] md:h-[90vh] flex flex-col shadow-2xl overflow-hidden">
            <div className="p-6 md:p-10 border-b flex justify-between items-center bg-white sticky top-0 z-10">
              <div className="min-w-0">
                <h3 className="text-xl md:text-2xl font-black text-gray-900 uppercase tracking-tighter truncate pr-4">{editingProduct ? 'Cập Nhật' : 'Đăng Mới'}</h3>
                <p className="text-[9px] text-gray-400 font-bold mt-0.5 uppercase tracking-widest italic">Inventory management</p>
              </div>
              <button onClick={() => setIsModalOpen(false)} className="shrink-0 p-3 bg-gray-100 text-gray-400 hover:text-gray-900 rounded-2xl transition-all"><X size={20} /></button>
            </div>

            <div className="flex bg-white border-b overflow-x-auto no-scrollbar scroll-px-6 sticky top-0 z-10">
              {[
                { id: 'basic', label: 'Cơ bản', icon: Info },
                { id: 'specs', label: 'Biến thể', icon: Settings },
                { id: 'images', label: 'Ảnh', icon: ImageIcon },
                { id: 'status', label: 'Khác', icon: Activity },
              ].map(tab => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} className={`flex items-center px-6 md:px-8 py-5 text-[10px] font-black uppercase tracking-[0.2em] border-b-4 transition-all whitespace-nowrap ${activeTab === tab.id ? 'border-red-600 text-red-600 bg-red-50/50' : 'border-transparent text-gray-400 hover:text-gray-600'}`}>
                  <tab.icon size={14} className="mr-2" /> {tab.label}
                </button>
              ))}
            </div>

            <form onSubmit={handleFormSubmit} className="flex-1 overflow-y-auto p-6 md:p-10 custom-scrollbar bg-gray-50/30">
              {formError && <div className="mb-8 p-4 bg-red-50 border border-red-100 text-red-600 rounded-2xl font-black uppercase text-[10px] tracking-widest flex items-center"><X size={14} className="mr-2" /> {formError}</div>}

              {activeTab === 'basic' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                    <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Tên sản phẩm</label><input type="text" required className="form-input-custom" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} placeholder="Yonex Astrox 100ZZ" /></div>
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Chất liệu</label>
                          <input type="text" className="form-input-custom text-sm" value={formData.specifications.clothes?.material || ''} 
                            onChange={e => setFormData({...formData, specifications: {...formData.specifications, clothes: { ...formData.specifications.clothes, material: e.target.value }}})} 
                            placeholder="100% Polyester"
                          />
                        </div>
                        <div className="space-y-2">
                          <label className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Xuất xứ</label>
                          <input type="text" className="form-input-custom text-sm" value={formData.specifications.clothes?.origin || ''} 
                            onChange={e => setFormData({...formData, specifications: {...formData.specifications, clothes: { ...formData.specifications.clothes, origin: e.target.value }}})} 
                            placeholder="Việt Nam"
                          />
                        </div>
                      </div>
                    ) : formData.category === 'Giày Thể Thao' ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      <div className="flex flex-col items-center justify-center py-10 bg-gray-50 rounded-[2rem] border-2 border-dashed border-gray-100">
                        <Package size={24} className="text-gray-200 mb-2" />
                        <h4 className="text-[10px] font-black uppercase tracking-widest text-gray-400">Không có thông số đặc thù</h4>
                      </div>
                    )}
                  </div>

                  {/* PHẦN 2: QUẢN LÝ BIẾN THỂ */}
                  {(formData.category === 'Giày Thể Thao' || formData.category === 'Quần áo') && (
                    <div className="pt-10 border-t border-gray-100 space-y-8">
                      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                        <div>
                          <h4 className="text-sm font-black uppercase tracking-widest text-red-600">Phân loại hàng</h4>
                          <p className="text-[9px] text-gray-400 font-bold mt-1 uppercase tracking-widest">Màu sắc & Kích thước</p>
                        </div>
                        <button type="button" onClick={addVariant} className="bg-gray-950 text-white px-6 py-3 rounded-xl flex items-center transition-all shadow-lg font-black uppercase tracking-widest text-[10px] w-full md:w-auto justify-center">
                          <Plus className="w-4 h-4 mr-2 text-red-600" /> Thêm nhóm màu
                        </button>
                      </div>

                      <div className="space-y-6">
                        {Object.entries(
                          formData.variants.reduce((acc, v) => {
                            const color = v.color || '';
                            if (!acc[color]) acc[color] = [];
                            acc[color].push(v);
                            return acc;
                          }, {} as Record<string, IVariant[]>)
                        ).map(([colorName, colorVariants], colorIdx) => (
                          <div key={colorIdx} className="bg-white p-6 rounded-[2rem] border border-gray-100 shadow-sm space-y-6 relative overflow-hidden group">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-red-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            
                            <div className="flex justify-between items-center gap-4">
                              <div className="flex-1">
                                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block mb-2">Tên màu</label>
                                <input 
                                  type="text" className="form-input-custom !py-3 !text-xs" 
                                  value={colorName} 
                                  onChange={e => {
                                    const newColor = e.target.value;
                                    const newVariants = formData.variants.map(v => v.color === colorName ? { ...v, color: newColor } : v);
                                    setFormData({ ...formData, variants: newVariants });
                                  }}
                                  placeholder="VD: Đen - Đỏ"
                                />
                              </div>
                              <button type="button" onClick={() => { const newVariants = formData.variants.filter(v => v.color !== colorName); setFormData({ ...formData, variants: newVariants }); }} className="p-3 text-gray-300 hover:text-red-600 transition-all"><Trash2 size={18} /></button>
                            </div>

                            <div className="space-y-3">
                              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Chọn Size</label>
                              <div className="flex flex-wrap gap-2">
                                {(formData.category === 'Giày Thể Thao' ? SHOE_SIZES : CLOTHES_SIZES).map(size => {
                                  const isSelected = colorVariants.some(v => v.size === size);
                                  return (
                                    <button
                                      key={size} type="button"
                                      onClick={() => {
                                        if (isSelected) {
                                          const newVariants = formData.variants.filter(v => !(v.color === colorName && v.size === size));
                                          setFormData({ ...formData, variants: newVariants });
                                        } else {
                                          setFormData({ ...formData, variants: [...formData.variants, { color: colorName, size, stock: 0 }] });
                                        }
                                      }}
                                      className={`px-3 py-2 rounded-lg text-[10px] font-black transition-all border-2 ${isSelected ? 'bg-red-600 border-red-600 text-white' : 'bg-gray-50 border-transparent text-gray-400'}`}
                                    >
                                      {size}
                                    </button>
                                  );
                                })}
                              </div>
                            </div>
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
                    <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Ảnh đại diện</label>
                    <div className="flex flex-col sm:flex-row gap-6 items-start">
                      {formData.mainImage && (
                        <div className="relative group shrink-0 w-full sm:w-40 aspect-square">
                          <img src={formData.mainImage} alt="Preview" className="w-full h-full object-cover rounded-[2rem] border-2 border-red-100 shadow-xl" />
                          <button type="button" onClick={() => setFormData({...formData, mainImage: ''})} className="absolute top-2 right-2 p-2 bg-white text-red-600 rounded-full shadow-lg"><X size={16} /></button>
                        </div>
                      )}
                      <div className="flex-1 w-full space-y-4">
                        <label className={`flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-[2rem] cursor-pointer transition-all ${isUploading ? 'bg-gray-100 border-gray-200 cursor-not-allowed' : 'bg-white border-gray-200 hover:border-red-400 hover:bg-red-50/30'}`}>
                          {isUploading ? <Loader2 className="w-8 h-8 mb-2 text-red-600 animate-spin" /> : <Upload className="w-8 h-8 mb-2 text-gray-400" />}
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest text-center px-4">{isUploading ? 'ĐANG TẢI LÊN S3...' : 'CHỌN FILE ẢNH'}</span>
                          <input type="file" className="hidden" accept="image/*" disabled={isUploading} onChange={(e) => handleImageUpload(e, 'main')} />
                        </label>
                        <input type="text" className="form-input-custom !py-3 !text-xs" value={formData.mainImage} onChange={e => setFormData({...formData, mainImage: e.target.value})} placeholder="Hoặc dán URL ảnh trực tiếp..." />
                      </div>
                    </div>
                  </div>

                  <div className="pt-10 border-t space-y-6">
                    <div className="flex justify-between items-center">
                      <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Bộ sưu tập ảnh ({formData.gallery.length})</label>
                      <button type="button" onClick={() => setFormData({...formData, gallery: [...formData.gallery, '']})} className="text-[10px] font-black text-blue-600 uppercase tracking-widest underline underline-offset-4">Thêm ô</button>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:gap-8">
                      {formData.gallery.map((g, i) => (
                        <div key={i} className="bg-white p-4 rounded-[1.5rem] border border-gray-100 shadow-sm space-y-3">
                          <div className="flex gap-3 items-center">
                            {g ? <img src={g} alt="" className="w-12 h-12 rounded-lg object-cover border border-gray-100" /> : <div className="w-12 h-12 bg-gray-50 rounded-lg flex items-center justify-center text-gray-300"><ImageIcon size={18} /></div>}
                            <label className="flex-1 text-center py-2 bg-blue-50 text-blue-600 rounded-lg text-[8px] font-black uppercase tracking-widest border border-dashed border-blue-200 cursor-pointer">
                              Upload
                              <input type="file" className="hidden" accept="image/*" disabled={isUploading} onChange={(e) => handleImageUpload(e, 'gallery', i)} />
                            </label>
                            <button type="button" onClick={() => setFormData({...formData, gallery: formData.gallery.filter((_, idx) => idx !== i)})} className="p-2 text-red-300 hover:text-red-600 transition-all"><Trash2 size={16} /></button>
                          </div>
                          <input type="text" className="form-input-custom !py-2.5 !text-[10px]" value={g} onChange={e => { const ng = [...formData.gallery]; ng[i] = e.target.value; setFormData({...formData, gallery: ng}) }} placeholder="URL ảnh..." />
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'status' && (
                <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4">
                  <div className="bg-white p-6 md:p-10 rounded-[2.5rem] border border-gray-100 shadow-sm space-y-6">
                    <div className="space-y-3"><label className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Trạng thái kho</label>
                      <select className="form-input-custom font-black uppercase text-xs tracking-widest" value={formData.status} onChange={e => setFormData({...formData, status: e.target.value as any})}>
                        <option value="Còn hàng">✅ Còn hàng</option>
                        <option value="Hết hàng">❌ Hết hàng</option>
                        <option value="Ngừng kinh doanh">🚫 Ngừng kinh doanh</option>
                      </select>
                    </div>
                    <div className="grid grid-cols-1 gap-4 pt-4">
                      {[
                        { id: 'isFeatured', label: 'Nổi bật' },
                        { id: 'isFocus', label: 'Tiêu điểm' },
                        { id: 'isActive', label: 'Hiển thị Web' },
                      ].map(k => (
                        <label key={k.id} className="flex items-center p-5 bg-gray-50 rounded-2xl cursor-pointer border-2 border-transparent active:border-red-100">
                          <input type="checkbox" className="w-5 h-5 rounded-md text-red-600 mr-4 border-gray-300" checked={(formData as any)[k.id]} onChange={e => setFormData({...formData, [k.id]: e.target.checked})} />
                          <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">{k.label}</span>
                        </label>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </form>

            <div className="p-6 md:p-10 bg-white border-t flex gap-4 sticky bottom-0 z-20 shadow-[0_-10px_40px_rgba(0,0,0,0.05)]">
              <button 
                onClick={handleFormSubmit}
                disabled={isUploading}
                className={`flex-1 py-5 rounded-[1.5rem] font-black uppercase tracking-[0.2em] shadow-xl flex items-center justify-center text-xs ${isUploading ? 'bg-gray-400 cursor-not-allowed' : 'bg-red-600 hover:bg-red-700 text-white shadow-red-200'}`}
              >
                {isUploading ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <Save size={20} className="mr-2" />}
                LƯU THAY ĐỔI
              </button>
            </div>
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
