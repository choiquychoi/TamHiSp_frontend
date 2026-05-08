import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { ShoppingCart, Zap, ShieldCheck, Truck, RefreshCw, ChevronRight, Minus, Plus } from 'lucide-react';
import { motion } from 'framer-motion';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useCart } from '@/context/CartContext';
import CONFIG from '@/lib/config';
import infographic from '@/assets/inforgraphic.png';

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
  category: string;
  brand: string;
  sku: string;
  mainImage: string;
  gallery: string[];
  specifications: any;
  variants: IVariant[];
  slug: string;
}

import api from '@/lib/axios';

const ProductDetail: React.FC = () => {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  
  const [product, setProduct] = useState<IProduct | null>(null);
  const [activeImg, setActiveImg] = useState('');
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedColor, setSelectedColor] = useState('');
  const [showSpecs, setShowSpecs] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [loading, setLoading] = useState(true);

  // Nhóm biến thể theo màu sắc
  const variantsByColor = React.useMemo(() => {
    if (!product || !product.variants) return {};
    return product.variants.reduce((acc, v) => {
      const color = v.color || 'default';
      if (!acc[color]) acc[color] = [];
      acc[color].push(v);
      return acc;
    }, {} as Record<string, IVariant[]>);
  }, [product]);

  const availableColors = Object.keys(variantsByColor);

  useEffect(() => {
    const fetchProductData = async () => {
      setLoading(true);
      try {
        const { data } = await api.get(`/products/${slug}`);
        setProduct(data);
        setActiveImg(data.mainImage);
        
        // Tự động chọn màu đầu tiên nếu có biến thể
        const colors = Object.keys(data.variants?.reduce((acc: any, v: any) => {
          const color = v.color || 'default';
          if (!acc[color]) acc[color] = true;
          return acc;
        }, {}) || {});

        if (colors.length > 0 && colors[0] !== 'default') {
          setSelectedColor(colors[0]);
        }
      } catch (error) {
        console.error('Lỗi tải dữ liệu:', error);
      } finally {
        setLoading(false);
      }
    };
    fetchProductData();
    window.scrollTo(0, 0);
  }, [slug]);

  if (loading) return <div className="min-h-screen flex items-center justify-center font-bold uppercase tracking-widest text-red-600 animate-pulse">Đang tải siêu phẩm...</div>;
  if (!product) return <div className="min-h-screen flex items-center justify-center font-bold">Không tìm thấy sản phẩm!</div>;

  const discountPercentage = product.salePrice ? Math.round(((product.price - product.salePrice) / product.price) * 100) : 0;

  // Lấy danh sách size khả dụng cho màu đã chọn
  const availableSizes = selectedColor 
    ? (variantsByColor[selectedColor] || [])
    : (variantsByColor['default'] || []);

  const handleAddToCart = () => {
    // Kiểm tra nếu sản phẩm có biến thể thì bắt buộc phải chọn
    if (product.variants && product.variants.length > 0) {
      if (availableColors.length > 0 && availableColors[0] !== 'default' && !selectedColor) {
        alert('Vui lòng chọn màu sắc!');
        return false;
      }
      if (availableSizes.length > 0 && !selectedSize) {
        alert('Vui lòng chọn kích thước (Size)!');
        return false;
      }
    }

    addToCart({
      _id: product._id,
      name: product.name,
      price: product.salePrice || product.price,
      image: product.mainImage,
      category: product.category,
      slug: product.slug,
      selectedSize,
      selectedColor: selectedColor === 'default' ? '' : selectedColor
    }, quantity);
    return true;
  };

  const handleBuyNow = () => {
    if (handleAddToCart()) {
      navigate('/cart');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <SEO 
        title={`${product.name} - ${product.category}`}
        description={`${product.name} chính hãng từ ${product.brand}. ${product.description.substring(0, 150)}...`}
        keywords={`${product.name}, ${product.brand}, ${product.category}, Tâm Hí Sports`}
        image={product.mainImage}
        type="product"
      />
      <Navbar />
      
      <section className="bg-white pt-20">
        <main className="max-w-7xl mx-auto px-4 md:px-8 py-6 md:py-10">
          {/* Breadcrumb */}
          <div className="flex items-center space-x-2 text-[9px] md:text-xs font-bold text-gray-400 uppercase tracking-widest mb-6 md:mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide">
            <Link to="/" className="hover:text-red-600 transition-colors">Trang chủ</Link>
            <ChevronRight size={12} />
            <Link to={`/category/${product.category}`} className="hover:text-red-600 transition-colors">{product.category}</Link>
            <ChevronRight size={12} />
            <span className="text-red-600 truncate">{product.name}</span>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16">
            {/* Cột trái: Hình ảnh */}
            <div className="space-y-4 md:space-y-6">
              <div className="relative aspect-square rounded-[2rem] md:rounded-[3rem] overflow-hidden border border-gray-100 shadow-xl md:shadow-2xl group bg-white">
                <img src={activeImg} alt={product.name} className="w-full h-full object-contain p-4 md:p-8 transition-transform duration-700 group-hover:scale-110" />
                {discountPercentage > 0 && (
                  <div className="absolute top-4 left-4 md:top-6 md:left-6 bg-red-600 text-white px-3 py-1.5 md:px-4 md:py-2 rounded-xl md:rounded-2xl font-black text-xs md:text-sm shadow-xl">
                    -{discountPercentage}%
                  </div>
                )}
              </div>
              <div className="flex space-x-3 md:space-x-4 overflow-x-auto no-scrollbar pb-2">
                {[product.mainImage, ...product.gallery].map((img, idx) => (
                  <button 
                    key={idx} onClick={() => setActiveImg(img)}
                    className={`flex-shrink-0 w-16 h-20 md:w-20 md:h-24 rounded-xl md:rounded-2xl overflow-hidden border-2 transition-all ${activeImg === img ? 'border-red-600 scale-95 shadow-lg' : 'border-gray-50 hover:border-gray-200'}`}
                  >
                    <img src={img} className="w-full h-full object-contain p-1.5 md:p-2 bg-white" alt="" />
                  </button>
                ))}
              </div>
            </div>

            {/* Cột phải: Thông tin */}
            <div className="flex flex-col space-y-6 md:space-y-8">
              <div className="space-y-3 md:space-y-4">
                <div className="inline-block px-3 py-1 bg-red-50 text-red-600 rounded-full text-[8px] md:text-[10px] font-black uppercase tracking-widest border border-red-100">{product.brand}</div>
                <h1 className="text-2xl md:text-5xl font-black leading-tight tracking-tighter uppercase">{product.name}</h1>
                <p className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Mã sản phẩm: <span className="text-gray-900">{product.sku}</span></p>
              </div>

              <div className="flex items-end space-x-3 md:space-x-4 py-4 md:py-6 border-y border-gray-50">
                <div className="text-3xl md:text-4xl font-black text-red-600">{(product.salePrice || product.price).toLocaleString()}đ</div>
                {product.salePrice && <div className="text-lg md:text-xl font-bold text-gray-300 line-through mb-1">{product.price.toLocaleString()}đ</div>}
              </div>

              <div className="space-y-6">
                {/* PHẦN CHỌN BIẾN THỂ (MÀU & SIZE) */}
                {product.variants && product.variants.length > 0 && (
                  <div className="space-y-6 md:space-y-8 py-4 md:py-6 border-y border-gray-50">
                    {/* 1. Chọn màu sắc */}
                    {availableColors.length > 0 && availableColors[0] !== 'default' && (
                      <div className="space-y-3 md:space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">
                            Màu sắc: <span className="text-gray-900">{selectedColor}</span>
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                          {availableColors.map(color => (
                            <button
                              key={color}
                              onClick={() => {
                                setSelectedColor(color);
                                setSelectedSize('');
                              }}
                              className={`px-4 py-2 md:px-6 md:py-3 rounded-lg md:rounded-xl flex items-center justify-center text-[9px] md:text-[10px] font-black uppercase tracking-widest transition-all border-2 ${selectedColor === color ? 'bg-red-600 border-red-600 text-white shadow-lg' : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'}`}
                            >
                              {color}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* 2. Chọn kích thước */}
                    {availableSizes.length > 0 && (
                      <div className="space-y-3 md:space-y-4">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">
                            Kích thước: <span className="text-gray-900">{selectedSize}</span>
                          </span>
                          {(product.category === 'Quần áo' || product.category === 'Giày Thể Thao') && (
                            <button className="text-[9px] font-bold text-red-600 uppercase underline underline-offset-4">Quy đổi size</button>
                          )}
                        </div>
                        <div className="flex flex-wrap gap-2 md:gap-3">
                          {availableSizes.map((v, idx) => (
                            <button
                              key={idx}
                              onClick={() => setSelectedSize(v.size || '')}
                              className={`min-w-[3rem] md:min-w-[3.5rem] h-10 md:h-12 rounded-lg md:rounded-xl flex flex-col items-center justify-center transition-all border-2 relative overflow-hidden ${
                                selectedSize === v.size 
                                  ? 'bg-black border-black text-white shadow-lg scale-105 z-10' 
                                  : 'bg-white border-gray-100 text-gray-400 hover:border-gray-300'
                              }`}
                            >
                              <span className="text-[11px] md:text-xs font-black">{v.size}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                <div className="flex items-center space-x-6">
                  <span className="text-[10px] md:text-xs font-black uppercase tracking-widest text-gray-400">Số lượng:</span>
                  <div className="flex items-center border-2 border-gray-100 rounded-xl md:rounded-2xl p-0.5 md:p-1 bg-gray-50">
                    <button onClick={() => setQuantity(Math.max(1, quantity - 1))} className="p-1.5 md:p-2 hover:text-red-600 transition-colors font-bold text-lg md:text-xl px-3">-</button>
                    <span className="w-10 md:w-12 text-center font-black text-sm md:text-lg">{quantity}</span>
                    <button onClick={() => setQuantity(quantity + 1)} className="p-1.5 md:p-2 hover:text-red-600 transition-colors font-bold text-lg md:text-xl px-3">+</button>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row gap-3 md:gap-4">
                  <button 
                    onClick={handleAddToCart}
                    className="flex-1 bg-black text-white py-4 md:py-5 rounded-xl md:rounded-[2rem] font-black uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-center shadow-xl hover:bg-gray-800 transition-all active:scale-95"
                  >
                    <ShoppingCart size={18} className="mr-2" /> Thêm vào giỏ
                  </button>
                  <button 
                    onClick={handleBuyNow}
                    className="flex-1 bg-red-600 text-white py-4 md:py-5 rounded-xl md:rounded-[2rem] font-black uppercase tracking-widest text-[10px] md:text-xs flex items-center justify-center shadow-xl shadow-red-200 hover:bg-red-700 transition-all active:scale-95"
                  >
                    <Zap size={18} className="mr-2" /> Mua ngay
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 md:gap-4 pt-4 md:pt-6">
                <div className="flex items-center sm:flex-col sm:text-center gap-3 p-3 md:p-4 bg-blue-50/30 rounded-2xl md:rounded-3xl border border-blue-50">
                  <ShieldCheck className="text-blue-600 shrink-0" size={20} />
                  <span className="text-[8px] md:text-[9px] font-black uppercase leading-tight">Chính hãng 100%</span>
                </div>
                <div className="flex items-center sm:flex-col sm:text-center gap-3 p-3 md:p-4 bg-green-50/30 rounded-2xl md:rounded-3xl border border-green-50">
                  <Truck className="text-green-600 shrink-0" size={20} />
                  <span className="text-[8px] md:text-[9px] font-black uppercase leading-tight">Giao hàng hỏa tốc</span>
                </div>
                <div className="flex items-center sm:flex-col sm:text-center gap-3 p-3 md:p-4 bg-orange-50/30 rounded-2xl md:rounded-3xl border border-orange-50">
                  <RefreshCw className="text-orange-600 shrink-0" size={20} />
                  <span className="text-[8px] md:text-[9px] font-black uppercase leading-tight">7 ngày đổi trả</span>
                </div>
              </div>
            </div>
          </div>
        </main>
      </section>

      {/* Phần mô tả & thông số */}
      <section className="bg-slate-50/50 py-12 md:py-24 border-y border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-center space-x-6 md:space-x-12 mb-10 md:mb-16">
            <button onClick={() => setShowSpecs(false)} className={`pb-3 md:pb-4 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.4em] transition-all border-b-2 md:border-b-4 ${!showSpecs ? 'border-red-600 text-red-600' : 'border-transparent text-gray-300 hover:text-gray-400'}`}>Mô tả</button>
            <button onClick={() => setShowSpecs(true)} className={`pb-3 md:pb-4 text-[10px] md:text-xs font-black uppercase tracking-[0.2em] md:tracking-[0.4em] transition-all border-b-2 md:border-b-4 ${showSpecs ? 'border-red-600 text-red-600' : 'border-transparent text-gray-300 hover:text-gray-400'}`}>Thông số</button>
          </div>

          <div className="max-w-4xl mx-auto">
            {!showSpecs ? (
              <div className="relative bg-white p-6 md:p-16 rounded-[2rem] md:rounded-[3rem] shadow-sm border border-gray-100">
                <div className={`prose prose-red max-w-none text-gray-600 leading-relaxed font-medium transition-all duration-700 overflow-hidden ${!isExpanded ? 'max-h-[400px] md:max-h-[500px]' : 'max-h-[10000px]'}`}>
                  <p className="whitespace-pre-line text-base md:text-lg">{product.description}</p>
                </div>
                {!isExpanded && (
                  <div className="absolute bottom-0 left-0 right-0 h-32 md:h-48 bg-gradient-to-t from-white via-white/80 to-transparent flex items-end justify-center pb-6 md:pb-10 rounded-b-[2rem] md:rounded-b-[3rem]">
                    <button onClick={() => setIsExpanded(true)} className="bg-gray-950 text-white px-8 md:px-10 py-3 md:py-4 rounded-full font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:bg-red-600 transition-all shadow-xl">Xem thêm</button>
                  </div>
                )}
                {isExpanded && <button onClick={() => setIsExpanded(false)} className="mt-8 md:mt-12 block mx-auto text-gray-400 font-black uppercase text-[9px] md:text-[10px] tracking-widest hover:text-red-600 transition-colors underline underline-offset-8">Thu gọn</button>}
              </div>
            ) : (
              <div className="bg-white rounded-[2rem] md:rounded-[3rem] border border-gray-100 shadow-xl overflow-hidden">
                <div className="bg-gray-950 p-4 md:p-6 flex items-center space-x-3">
                  <div className="w-1.5 h-1.5 md:w-2 md:h-2 bg-red-600 rounded-full animate-pulse" />
                  <span className="text-[8px] md:text-[10px] font-black text-white uppercase tracking-[0.2em] md:tracking-[0.4em]">Engineered Specifications</span>
                </div>
                <div className="p-6 md:p-10 grid grid-cols-1 md:grid-cols-2 gap-x-8 lg:gap-x-12 gap-y-4 md:gap-y-6">
                  {/* ... specifications map logic ... */}
                  {(() => {
                    let specsToDisplay: any = {};
                    const specs = product.specifications || {};
                    if (product.category === 'Cầu lông') specsToDisplay = specs.badminton || {};
                    else if (product.category === 'Pickleball') specsToDisplay = specs.pickleball || {};
                    else if (product.category === 'Tennis') specsToDisplay = specs.tennis || {};
                    else if (product.category === 'Giày Thể Thao') specsToDisplay = specs.shoes || {};
                    else if (product.category === 'Quần áo') specsToDisplay = specs.clothes || {};

                    const entries = Object.entries(specsToDisplay);
                    if (entries.length === 0) return <p className="col-span-2 text-center text-gray-400 font-bold uppercase text-[10px] tracking-widest">Không có thông số kỹ thuật chi tiết.</p>;

                    return entries.map(([key, value]) => {
                      if (!value || (Array.isArray(value) && value.length === 0)) return null;
                      // Skip sizes and colors as they are already shown in selection
                      if (product.category === 'Quần áo' && (key === 'sizes' || key === 'colors')) return null;

                      const labels: any = { 
                        weightGrip: 'Trọng lượng / Cán', 
                        balance: 'Độ cân bằng', 
                        maxTension: 'Mức căng tối đa',
                        surface: 'Mặt vợt',
                        core: 'Lõi vợt',
                        technology: 'Công nghệ',
                        origin: 'Xuất xứ',
                        material: 'Chất liệu',
                        soleMaterial: 'Chất liệu đế',
                        upperMaterial: 'Chất liệu thân'
                      };
                      return (
                        <div key={key} className="group border-b border-gray-50 pb-4">
                          <div className="text-[9px] font-black text-gray-400 uppercase tracking-widest mb-2">{labels[key] || key}</div>
                          <div className="text-sm font-bold text-gray-950">{Array.isArray(value) ? value.join(', ') : String(value)}</div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* TẤM ẢNH INFOGRAPHIC THƯƠNG HIỆU - ĐÃ PHÌNH TO */}
      <section className="py-10 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <motion.div 
            initial={{ opacity: 0, scale: 0.98 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 1 }}
            className="rounded-[2.5rem] md:rounded-[4rem] overflow-hidden shadow-[0_50px_100px_-20px_rgba(0,0,0,0.15)] border border-gray-100 group"
          >
            <img 
              src={infographic} 
              alt="Tâm Hí Sports Infographic" 
              className="w-full h-auto transition-transform duration-1000 group-hover:scale-105"
            />
          </motion.div>
          <p className="text-center mt-8 text-[11px] font-black uppercase tracking-[0.5em] text-gray-200">
            Professional Equipment — Authentic Quality
          </p>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default ProductDetail;
