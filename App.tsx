
import React, { useState, useEffect, useMemo } from 'react';
import { PaymentMethod, PaymentType, StructuredDeal, PromotionDatabase } from './types';
import WalletItem from './components/WalletItem';
import { POPULAR_PROVIDERS, DETAILED_CARDS } from './constants';

const CATEGORIES = [
  { id: 'Tất cả', label: 'Tất cả', icon: 'fa-border-all' },
  { id: 'Ẩm thực', label: 'Ẩm thực', icon: 'fa-utensils' },
  { id: 'Mua sắm', label: 'Mua sắm', icon: 'fa-bag-shopping' },
  { id: 'Du lịch', label: 'Du lịch', icon: 'fa-plane' },
  { id: 'Khác', label: 'Khác', icon: 'fa-ellipsis' },
];

const App: React.FC = () => {
  // DANH MỤC NGƯỜI DÙNG (Lưu Local)
  const [wallet, setWallet] = useState<PaymentMethod[]>([]);
  const [provider, setProvider] = useState('');
  const [methodName, setMethodName] = useState('');
  const [methodType, setMethodType] = useState<PaymentType>(PaymentType.CARD);
  
  // DỮ LIỆU TỪ BACKEND (Đã được admin cập nhật)
  const [localDB, setLocalDB] = useState<PromotionDatabase>({ lastUpdated: 0, deals: [] });
  const [displayDeals, setDisplayDeals] = useState<StructuredDeal[]>([]);
  
  // SEARCH & FILTER
  const [merchantQuery, setMerchantQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tất cả');

  // Load Database và Wallet khi khởi động
  useEffect(() => {
    const savedWallet = localStorage.getItem('smartpay_wallet_v3');
    if (savedWallet) setWallet(JSON.parse(savedWallet));

    const savedDB = localStorage.getItem('smartpay_global_db');
    if (savedDB) {
      const parsedDB: PromotionDatabase = JSON.parse(savedDB);
      setLocalDB(parsedDB);
      setDisplayDeals(parsedDB.deals);
    }
  }, []);

  // Tự động lưu ví
  useEffect(() => {
    localStorage.setItem('smartpay_wallet_v3', JSON.stringify(wallet));
  }, [wallet]);

  // TRUY VẤN TỨC THỜI (LOCAL SEARCH)
  const handleLocalSearch = (query: string) => {
    setMerchantQuery(query);
    if (!query.trim()) {
      setDisplayDeals(localDB.deals);
      return;
    }
    const searchKey = query.toLowerCase();
    const filtered = localDB.deals.filter(deal => 
      deal.partnerName.toLowerCase().includes(searchKey) ||
      deal.paymentMethodSource.toLowerCase().includes(searchKey) ||
      deal.category.toLowerCase().includes(searchKey)
    );
    setDisplayDeals(filtered);
  };

  // BỘ LỌC THÔNG MINH
  const finalDeals = useMemo(() => {
    return displayDeals.filter(d => {
      const matchCat = activeFilter === 'Tất cả' || d.category.includes(activeFilter);
      // Logic: Nếu ví có thẻ, ưu tiên hiện deal phù hợp. Nếu ví trống, hiện tất cả.
      const matchWallet = wallet.length === 0 || wallet.some(w => 
        d.paymentMethodSource.toLowerCase().includes(w.provider.toLowerCase())
      );
      return matchCat && matchWallet;
    });
  }, [displayDeals, activeFilter, wallet]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 relative z-10">
      {/* Header Người dùng */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6 animate-item">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-gradient-to-br from-emerald-600 to-teal-800 rounded-2xl flex items-center justify-center shadow-2xl shadow-emerald-200 rotate-2">
            <i className="fa-solid fa-gift text-white text-3xl"></i>
          </div>
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter">SmartPay <span className="text-emerald-600">Rewards</span></h1>
            <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.4em]">Săn ưu đãi thông minh cho thẻ & ví của bạn</p>
          </div>
        </div>

        <div className="glass px-6 py-3 rounded-2xl border border-emerald-100 flex flex-col items-end shadow-sm">
           <div className="flex items-center gap-2 mb-1">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Dữ liệu thị trường</p>
           </div>
           <p className="text-xs font-black text-slate-700">
              {localDB.lastUpdated > 0 ? `Cập nhật: ${new Date(localDB.lastUpdated).toLocaleDateString('vi-VN')}` : 'Đang tải dữ liệu...'}
           </p>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Sidebar - Quản lý Thẻ */}
        <div className="lg:col-span-4 space-y-6 lg:sticky lg:top-6 animate-item">
          <section className="glass p-8 rounded-[3rem] shadow-2xl shadow-emerald-100/20 border-emerald-50 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-emerald-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-40"></div>
            
            <h2 className="text-[11px] font-black mb-6 flex items-center gap-3 text-slate-400 uppercase tracking-[0.3em]">
              <i className="fa-solid fa-credit-card text-emerald-500 text-lg"></i>
              Ví của tôi
            </h2>

            <form onSubmit={(e) => {
              e.preventDefault();
              if(!provider) return;
              setWallet([...wallet, { id: Date.now().toString(), provider, name: methodName || "Tiêu chuẩn", type: methodType }]);
              setMethodName('');
            }} className="space-y-4 mb-8">
              <div className="flex bg-slate-100/60 p-1.5 rounded-2xl border border-slate-200/40">
                {[PaymentType.CARD, PaymentType.WALLET, PaymentType.APP].map(t => (
                  <button key={t} type="button" onClick={() => setMethodType(t)} className={`flex-1 py-2.5 text-[10px] font-black uppercase rounded-xl transition-all ${methodType === t ? 'bg-white text-emerald-600 shadow-md' : 'text-slate-400 hover:text-emerald-500'}`}>
                    {t === PaymentType.CARD ? 'Thẻ' : t === PaymentType.WALLET ? 'Ví' : 'App'}
                  </button>
                ))}
              </div>

              <select 
                value={provider} 
                onChange={e => {setProvider(e.target.value); setMethodName('');}}
                className="w-full p-4.5 rounded-[1.25rem] bg-white border border-emerald-50 text-xs font-bold text-slate-900 outline-none focus:ring-4 focus:ring-emerald-500/10 transition-all shadow-sm cursor-pointer"
              >
                <option value="">Chọn đơn vị phát hành...</option>
                {(methodType === PaymentType.CARD || methodType === PaymentType.APP ? POPULAR_PROVIDERS.BANKS : POPULAR_PROVIDERS.WALLETS).map(p => <option key={p} value={p}>{p}</option>)}
              </select>

              {provider && methodType === PaymentType.CARD && DETAILED_CARDS[provider] && (
                 <select 
                    value={methodName} 
                    onChange={e => setMethodName(e.target.value)}
                    className="w-full p-4.5 rounded-[1.25rem] bg-emerald-50/30 border border-emerald-100 text-xs font-bold text-emerald-700 outline-none cursor-pointer shadow-sm"
                  >
                    <option value="">Chọn loại thẻ cụ thể...</option>
                    {DETAILED_CARDS[provider].map(card => <option key={card} value={card}>{card}</option>)}
                  </select>
              )}

              <button type="submit" className="w-full bg-slate-900 text-white py-5 rounded-[1.25rem] font-black text-[11px] uppercase tracking-[0.25em] hover:bg-black active:scale-[0.97] transition-all shadow-xl shadow-slate-200">
                THÊM VÀO BỘ LỌC
              </button>
            </form>

            <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
              {wallet.length === 0 ? (
                <div className="text-center py-12 border-2 border-dashed border-emerald-100 rounded-[2.5rem] bg-emerald-50/20">
                  <p className="text-[10px] font-black text-emerald-300 uppercase tracking-widest leading-relaxed px-4">Hãy thêm các thẻ bạn đang có để lọc ưu đãi phù hợp nhất!</p>
                </div>
              ) : (
                wallet.map(m => <WalletItem key={m.id} method={m} onRemove={id => setWallet(wallet.filter(x => x.id !== id))} />)
              )}
            </div>
          </section>
        </div>

        {/* Main Content - Tra cứu */}
        <div className="lg:col-span-8 space-y-8">
          {/* Search Bar */}
          <section className="animate-item">
            <div className="glass p-3 rounded-[3.5rem] shadow-2xl shadow-emerald-100/40 border-white relative group">
              <i className="fa-solid fa-magnifying-glass absolute left-10 top-1/2 -translate-y-1/2 text-emerald-500 text-xl z-10 group-focus-within:scale-110 transition-transform"></i>
              <input 
                value={merchantQuery}
                onChange={e => handleLocalSearch(e.target.value)}
                placeholder="Bạn muốn đi đâu ăn, mua sắm ở đâu? VD: Highlands, Shopee..."
                className="w-full pl-20 pr-10 py-7 bg-white rounded-[3rem] text-lg font-bold text-slate-900 placeholder:text-slate-300 outline-none focus:ring-16 focus:ring-emerald-500/5 transition-all shadow-inner border border-slate-50"
              />
            </div>
          </section>

          {/* Categories */}
          <section className="animate-item">
            <div className="flex flex-wrap gap-3 overflow-x-auto pb-4 no-scrollbar">
              {CATEGORIES.map(c => (
                <button 
                  key={c.id}
                  onClick={() => setActiveFilter(c.id)}
                  className={`px-8 py-4.5 rounded-2xl text-[11px] font-black uppercase tracking-[0.15em] transition-all flex items-center gap-3 whitespace-nowrap border-2 ${activeFilter === c.id ? 'bg-slate-900 border-slate-900 text-white shadow-2xl scale-105' : 'bg-white border-slate-50 text-slate-400 hover:border-emerald-100 hover:text-emerald-500 shadow-sm'}`}
                >
                  <i className={`fa-solid ${c.icon} text-sm`}></i>
                  {c.label}
                </button>
              ))}
            </div>
          </section>

          {/* Deals Grid */}
          <section className="min-h-[600px] pb-20">
            {finalDeals.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {finalDeals.map((deal, i) => (
                  <div key={i} className="voucher-card p-8 flex flex-col h-full animate-item group" style={{animationDelay: `${0.05 * i}s`}}>
                    <div className="flex justify-between items-start mb-6">
                      <div className="px-4 py-2 bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest rounded-xl border border-emerald-100/50 shadow-sm">
                        {deal.category}
                      </div>
                      <span className="text-[10px] font-black text-slate-300 uppercase italic tracking-wider">
                        {deal.cardNetwork || 'Tất cả thẻ'}
                      </span>
                    </div>

                    <h3 className="text-2xl font-black text-slate-900 mb-4 tracking-tight group-hover:text-emerald-600 transition-colors">
                      {deal.partnerName}
                    </h3>
                    
                    <div className="bg-gradient-to-br from-emerald-50/40 to-white p-7 rounded-[2rem] border-2 border-dashed border-emerald-100/80 mb-8 relative">
                       <p className="text-emerald-800 font-black text-xl leading-snug tracking-tight">{deal.discountDetail}</p>
                       <div className="flex items-center gap-2 mt-4 text-[10px] text-slate-400 font-bold border-t border-emerald-100/50 pt-3 uppercase tracking-tighter">
                          <i className="fa-regular fa-calendar-check"></i>
                          <span>Hạn dùng: {deal.expiryDate || 'Đang diễn ra'}</span>
                       </div>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-6 border-t border-slate-50">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center text-white shadow-xl rotate-3 group-hover:rotate-0 transition-transform">
                           <i className="fa-solid fa-credit-card"></i>
                        </div>
                        <div>
                          <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest leading-none mb-1.5">Áp dụng cho</p>
                          <p className="text-[14px] font-black text-slate-700 truncate max-w-[180px]">{deal.paymentMethodSource}</p>
                        </div>
                      </div>
                      <button className="w-12 h-12 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center hover:bg-emerald-600 hover:text-white transition-all shadow-sm">
                        <i className="fa-solid fa-arrow-right text-sm"></i>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-40 text-center animate-item">
                <div className="w-32 h-32 bg-emerald-50/50 rounded-full flex items-center justify-center mb-10 border border-emerald-100 shadow-inner group">
                   <i className="fa-solid fa-database text-6xl text-emerald-100 group-hover:scale-110 transition-transform"></i>
                </div>
                <h3 className="text-3xl font-black text-slate-900 tracking-tight mb-4">Không tìm thấy ưu đãi</h3>
                <p className="text-base max-w-sm font-bold text-slate-400 leading-relaxed px-6">
                  Hãy thử tìm từ khóa khác hoặc xóa bớt bộ lọc thẻ của bạn.
                </p>
              </div>
            )}
            
            {/* Sources indicator */}
            {localDB.sources && localDB.sources.length > 0 && (
              <div className="mt-12 text-center">
                 <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.4em]">Dữ liệu được xác thực bởi AI Scraper từ {localDB.sources.length} nguồn tin cậy</p>
              </div>
            )}
          </section>
        </div>
      </div>

      {/* Footer */}
      <footer className="mt-20 py-12 border-t border-slate-100 text-center animate-item">
        <p className="text-[10px] font-black text-slate-300 uppercase tracking-[0.6em] mb-4">SmartPay Rewards Platform</p>
        <p className="text-xs text-slate-400 font-bold max-w-lg mx-auto leading-loose">Toàn bộ dữ liệu về thẻ của bạn được lưu trữ tuyệt mật ngay trên trình duyệt và không bao giờ được gửi về máy chủ của chúng tôi.</p>
      </footer>
    </div>
  );
};

export default App;
