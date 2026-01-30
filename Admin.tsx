import React, { useState, useEffect } from 'react';
import { syncGlobalPromotions } from './services/geminiService';
import { PromotionDatabase } from './types';

const Admin: React.FC = () => {
  const [db, setDb] = useState<PromotionDatabase>({ lastUpdated: 0, deals: [], sources: [] });
  const [isSyncing, setIsSyncing] = useState(false);
  const [status, setStatus] = useState('Sẵn sàng cập nhật dữ liệu thị trường');

  useEffect(() => {
    const savedDB = localStorage.getItem('smartpay_global_db');
    if (savedDB) setDb(JSON.parse(savedDB));
  }, []);

  const handleFullSync = async () => {
    setIsSyncing(true);
    setStatus('AI đang quét website của hơn 20 ngân hàng và ví tại Việt Nam...');
    try {
      const result = await syncGlobalPromotions([]); 
      
      const newDB: PromotionDatabase = {
        lastUpdated: Date.now(),
        deals: result.deals,
        sources: result.sources
      };

      localStorage.setItem('smartpay_global_db', JSON.stringify(newDB));
      setDb(newDB);
      setStatus(`Cập nhật thành công! Đã tìm thấy ${result.deals.length} ưu đãi mới.`);
    } catch (error) {
      setStatus('Lỗi trong quá trình quét dữ liệu AI. Vui lòng thử lại.');
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200 p-8 font-sans">
      <div className="max-w-5xl mx-auto">
        <header className="flex justify-between items-center mb-12 border-b border-slate-800 pb-8">
          <div>
            <h1 className="text-3xl font-black text-white flex items-center gap-4">
              <span className="p-3 bg-emerald-600 rounded-2xl rotate-3 shadow-lg shadow-emerald-900/20">
                <i className="fa-solid fa-server"></i>
              </span>
              SmartPay Admin <span className="text-emerald-500 font-medium text-lg">Backend Engine</span>
            </h1>
            <p className="text-slate-500 mt-2 text-sm uppercase tracking-widest font-bold">Hệ thống quản trị dữ liệu ưu đãi AI</p>
          </div>
          <a href="/" className="px-6 py-2 bg-slate-800 hover:bg-slate-700 rounded-xl text-xs font-bold transition-all border border-slate-700">
            QUAY LẠI FRONT-END
          </a>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1 space-y-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 shadow-2xl">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-6 flex items-center gap-3">
                <i className="fa-solid fa-bolt text-emerald-500"></i>
                Điều khiển vận hành
              </h2>
              <button 
                onClick={handleFullSync}
                disabled={isSyncing}
                className={`w-full py-6 rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl ${isSyncing ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-emerald-600 hover:bg-emerald-500 text-white hover:-translate-y-1 shadow-emerald-900/20'}`}
              >
                {isSyncing ? (
                  <span className="flex items-center justify-center gap-3">
                    <i className="fa-solid fa-circle-notch fa-spin"></i>
                    Đang quét AI...
                  </span>
                ) : 'Kích hoạt Full Market Sync'}
              </button>
              <div className="mt-6 p-4 bg-slate-800/50 rounded-xl border border-slate-700/50">
                <p className="text-[11px] font-bold leading-relaxed text-slate-400 italic">
                  * Hệ thống sẽ tự động quét website chính thức của VCB, TCB, VPBank, MB, VIB, MoMo, ShopeePay... và chuẩn hóa dữ liệu.
                </p>
              </div>
            </div>

            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800">
              <h2 className="text-sm font-black uppercase tracking-widest text-slate-400 mb-4">Thống kê Database</h2>
              <div className="space-y-4">
                <div className="flex justify-between items-center py-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-500">Tổng ưu đãi</span>
                  <span className="text-lg font-black text-white">{db.deals.length}</span>
                </div>
                <div className="flex justify-between items-center py-3 border-b border-slate-800">
                  <span className="text-xs font-bold text-slate-500">Lần cuối cập nhật</span>
                  <span className="text-xs font-black text-emerald-500">
                    {db.lastUpdated > 0 ? new Date(db.lastUpdated).toLocaleString('vi-VN') : 'N/A'}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 p-8 rounded-[2.5rem] border border-slate-800 min-h-[400px]">
              <div className="flex justify-between items-center mb-6">
                 <h2 className="text-sm font-black uppercase tracking-widest text-slate-400">Trạng thái xử lý</h2>
                 <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${isSyncing ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`}></span>
                    <span className="text-[10px] font-black uppercase text-slate-500">{isSyncing ? 'Processing' : 'Idle'}</span>
                 </div>
              </div>
              <div className="bg-black/50 p-6 rounded-2xl border border-slate-800 font-mono text-xs text-emerald-400/80 leading-loose overflow-y-auto max-h-[500px]">
                <p className="text-slate-600 mb-2 font-sans italic">[{new Date().toLocaleTimeString()}] System ready.</p>
                <p className="mb-2">{`> ${status}`}</p>
                {isSyncing && (
                  <div className="space-y-1">
                    <p className="animate-pulse">{">"} Requesting Gemini 3 Flash Scraper Engine...</p>
                    <p className="animate-pulse">{">"} Analyzing DOM structures of bank websites...</p>
                    <p className="animate-pulse">{">"} Cleaning and de-duplicating data...</p>
                  </div>
                )}
                {!isSyncing && db.deals.length > 0 && (
                  <div className="grid grid-cols-1 gap-2 mt-4">
                    {db.deals.slice(0, 10).map((d, i) => (
                      <p key={i} className="text-slate-500 border-l border-slate-800 pl-3">
                        <span className="text-emerald-500">{d.partnerName}</span>: {d.discountDetail.substring(0, 40)}...
                      </p>
                    ))}
                    <p className="text-slate-700">... và {db.deals.length - 10} ưu đãi khác.</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Admin;