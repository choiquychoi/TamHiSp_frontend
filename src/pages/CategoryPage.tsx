import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import axios from 'axios';
import { motion, AnimatePresence } from 'framer-motion';
import SEO from '../components/SEO';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { ChevronRight, Filter, ShoppingCart, Eye, ChevronLeft, ArrowUpDown, X } from 'lucide-react';
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import CONFIG from '@/lib/config';

interface IProduct {
  _id: string;
  name: string;
  slug: string;
  mainImage: string;
  price: number;
  salePrice?: number;
  category: string;
  brand: string;
}

import api from '@/lib/axios';

const CategoryPage: React.FC = () => {
  const { categoryName } = useParams<{ categoryName: string }>();
  const [products, setProducts] = useState<IProduct[]>([]);
  const [availableBrands, setBrands] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  
  // State Filter & Sort
  const [page, setPage] = useState(1);
  const [pages, setPages] = useState(1);
  const [sort, setSort] = useState('newest');
  const [brand, setBrand] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const fetchProducts = async () => {
    setLoading(true);
    try {
      let url = `/products?category=${categoryName}&page=${page}&limit=12&sort=${sort}`;
      if (brand) url += `&brand=${brand}`;
      if (minPrice) url += `&minPrice=${minPrice}`;
      if (maxPrice) url += `&maxPrice=${maxPrice}`;

      const { data } = await api.get(url);
      setProducts(data.products);
      setPages(data.pages);
      if (data.brands) setBrands(data.brands);
    } catch (error) {
      console.error('Lỗi khi lấy sản phẩm:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [categoryName, page, sort, brand]);

  const handlePriceApply = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchProducts();
  };

  const clearFilters = () => {
    setBrand('');
    setMinPrice('');
    setMaxPrice('');
    setSort('newest');
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-white font-sans text-gray-900">
      <SEO 
        title={`Danh mục ${categoryName}`}
        description={`Khám phá danh sách sản phẩm ${categoryName} chính hãng tại Tâm Hí Sports. Chất lượng hàng đầu, giá cả cạnh tranh.`}
        keywords={`${categoryName}, vợt cầu lông, dụng cụ thể thao, Tâm Hí Sports`}
      />
      <Navbar />

      <main className="max-w-7xl mx-auto px-4 md:px-8 py-8 md:py-12">
        {/* Breadcrumb */}
        <div className="flex items-center space-x-2 text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-6 md:mb-8 overflow-x-auto whitespace-nowrap scrollbar-hide pb-1">
          <Link to="/" className="hover:text-red-600 transition-colors">Trang chủ</Link>
          <ChevronRight size={10} />
          <span className="text-red-600 font-black uppercase">{categoryName}</span>
        </div>

        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          
          {/* CỘT TRÁI: BỘ LỌC (Sidebar) - Mobile Responsive */}
          <aside className="w-full lg:w-64 space-y-6 md:space-y-10">
            <div className="bg-white lg:bg-transparent">
              <div className="flex justify-between items-center mb-4 md:mb-6">
                <h3 className="text-base md:text-lg font-black uppercase tracking-tighter italic flex items-center">
                  <Filter size={16} className="mr-2 text-red-600" /> Bộ lọc
                </h3>
                {(brand || minPrice || maxPrice) && (
                  <button onClick={clearFilters} className="text-[9px] md:text-[10px] font-bold text-gray-400 hover:text-red-600 flex items-center uppercase">
                    Xóa <X size={10} className="ml-1" />
                  </button>
                )}
              </div>

              <div className="space-y-6">
                {/* Lọc theo Thương hiệu - Scrollable on mobile */}
                <div className="pb-6 lg:pb-8 border-b border-gray-100 lg:block">
                  <h4 className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Thương hiệu</h4>
                  <div className="flex overflow-x-auto lg:flex-col gap-2 pb-2 lg:pb-0 no-scrollbar">
                    <button 
                      onClick={() => setBrand('')}
                      className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold text-left transition-all whitespace-nowrap ${brand === '' ? 'bg-red-600 text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                    >
                      Tất cả
                    </button>
                    {availableBrands.map((b) => (
                      <button 
                        key={b}
                        onClick={() => { setBrand(b); setPage(1); }}
                        className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold text-left transition-all whitespace-nowrap ${brand === b ? 'bg-red-600 text-white shadow-md' : 'bg-gray-50 text-gray-500 hover:bg-gray-100'}`}
                      >
                        {b}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lọc theo Giá */}
                <div className="pt-2 pb-6 lg:pb-8 lg:border-b border-gray-100">
                  <h4 className="text-[9px] md:text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Giá (VNĐ)</h4>
                  <form onSubmit={handlePriceApply} className="flex lg:flex-col gap-2 md:gap-3">
                    <input 
                      type="number" placeholder="Từ" 
                      className="w-full p-2.5 md:p-3 bg-gray-50 border border-transparent rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold outline-none focus:border-red-600"
                      value={minPrice} onChange={e => setMinPrice(e.target.value)}
                    />
                    <input 
                      type="number" placeholder="Đến" 
                      className="w-full p-2.5 md:p-3 bg-gray-50 border border-transparent rounded-lg md:rounded-xl text-[10px] md:text-xs font-bold outline-none focus:border-red-600"
                      value={maxPrice} onChange={e => setMaxPrice(e.target.value)}
                    />
                    <Button type="submit" className="shrink-0 lg:w-full bg-black hover:bg-gray-800 text-white font-black text-[8px] md:text-[10px] uppercase tracking-widest rounded-lg md:rounded-xl h-10 md:h-12 px-4">
                      Lọc
                    </Button>
                  </form>
                </div>
              </div>
            </div>
          </aside>

          {/* CỘT PHẢI: DANH SÁCH SẢN PHẨM */}
          <div className="flex-1">
            {/* Header List & Sort */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-10 gap-4 md:gap-6">
              <h1 className="text-3xl md:text-5xl font-black uppercase tracking-tighter italic leading-none">
                {categoryName}
              </h1>
              
              <div className="flex items-center space-x-2 md:space-x-3 bg-gray-50 p-1.5 md:p-2 rounded-xl md:rounded-2xl border border-gray-100 w-full md:w-auto">
                <div className="p-1.5 md:p-2 bg-white rounded-lg md:rounded-xl shadow-sm text-red-600">
                  <ArrowUpDown size={14} />
                </div>
                <select 
                  className="flex-1 bg-transparent text-[9px] md:text-[10px] font-black uppercase tracking-widest outline-none pr-4 cursor-pointer"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  <option value="newest">Mới nhất</option>
                  <option value="price-asc">Giá: Thấp → Cao</option>
                  <option value="price-desc">Giá: Cao → Thấp</option>
                  <option value="oldest">Cũ nhất</option>
                </select>
              </div>
            </div>

            {/* Product Grid */}
            {loading ? (
              <div className="py-20 md:py-32 text-center font-black text-red-600 animate-pulse uppercase tracking-[0.2em] text-xs">
                Đang tải dữ liệu...
              </div>
            ) : products.length === 0 ? (
              <div className="py-20 md:py-32 text-center bg-gray-50 rounded-[2rem] md:rounded-[3rem] border-2 border-dashed border-gray-100 px-6">
                <p className="text-gray-400 font-black uppercase tracking-widest italic text-xs">Không tìm thấy sản phẩm.</p>
                <button onClick={clearFilters} className="mt-6 inline-block bg-black text-white px-6 md:px-8 py-2 md:py-3 rounded-full text-[10px] font-black uppercase tracking-widest">Xóa bộ lọc</button>
              </div>
            ) : (
              <div className="grid grid-cols-2 md:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-8">
                <AnimatePresence mode="popLayout">
                  {products.map((product) => {
                    const hasSale = product.salePrice && product.salePrice > 0;
                    const discount = hasSale ? Math.round(((product.price - product.salePrice!) / product.price) * 100) : 0;

                    return (
                      <motion.div
                        key={product._id}
                        layout
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.2 }}
                      >
                        <Link to={`/product/${product.slug}`}>
                          <Card className="group overflow-hidden border-none shadow-sm hover:shadow-xl transition-all duration-300 bg-white cursor-pointer rounded-[1.5rem] md:rounded-[2.5rem]">
                            <CardContent className="p-0 relative aspect-[4/5] overflow-hidden bg-gray-50/50 m-2 md:m-4 rounded-xl md:rounded-[2rem]">
                              <img src={product.mainImage} alt={product.name} className="w-full h-full object-contain p-3 md:p-6 transition-transform duration-700 group-hover:scale-110" />
                              {discount > 0 && <Badge className="absolute top-2 left-2 md:top-4 md:left-4 bg-red-600 font-black px-2 py-0.5 md:px-3 md:py-1 rounded-lg md:rounded-xl shadow-lg border-none text-white text-[8px] md:text-[10px]">-{discount}%</Badge>}
                            </CardContent>
                            <CardFooter className="flex flex-col items-center p-3 md:p-6 pt-0 md:pt-2 text-center">
                              <span className="text-[8px] md:text-[9px] font-black text-red-600 uppercase tracking-widest mb-0.5 md:mb-1">{product.brand}</span>
                              <h3 className="font-bold text-[10px] md:text-sm mb-2 md:mb-3 line-clamp-1 group-hover:text-red-600 transition-colors uppercase px-1">{product.name}</h3>
                              <div className="flex flex-col md:flex-row items-center gap-1 md:gap-3">
                                <span className="text-xs md:text-lg font-black text-gray-900 tracking-tighter">{(product.salePrice || product.price).toLocaleString()}₫</span>
                                {hasSale && <span className="text-[9px] md:text-xs text-gray-300 line-through font-bold">{product.price.toLocaleString()}₫</span>}
                              </div>
                            </CardFooter>
                          </Card>
                        </Link>
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            )}

            {/* Pagination */}
            {pages > 1 && (
              <div className="mt-12 md:mt-24 flex items-center justify-center space-x-2 md:space-x-4">
                <button
                  onClick={() => setPage(Math.max(1, page - 1))}
                  disabled={page === 1}
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-all border border-gray-100"
                >
                  <ChevronLeft size={16} md:size={20} />
                </button>
                <div className="flex items-center space-x-1.5 md:space-x-2">
                  {[...Array(pages).keys()].map((x) => (
                    <button
                      key={x + 1}
                      onClick={() => setPage(x + 1)}
                      className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl font-black text-[10px] md:text-xs transition-all border ${page === x + 1 ? 'bg-red-600 text-white border-red-600 shadow-lg scale-105 md:scale-110' : 'bg-white text-gray-400 border-gray-100 hover:border-red-200 hover:text-red-600'}`}
                    >
                      {x + 1}
                    </button>
                  ))}
                </div>
                <button
                  onClick={() => setPage(Math.min(pages, page + 1))}
                  disabled={page === pages}
                  className="w-10 h-10 md:w-12 md:h-12 flex items-center justify-center rounded-xl md:rounded-2xl bg-gray-50 text-gray-400 hover:bg-gray-100 disabled:opacity-30 transition-all border border-gray-100"
                >
                  <ChevronRight size={16} md:size={20} />
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default CategoryPage;
