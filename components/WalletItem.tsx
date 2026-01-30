
import React from 'react';
import { PaymentMethod, PaymentType } from '../types';

interface WalletItemProps {
  method: PaymentMethod;
  onRemove: (id: string) => void;
}

const WalletItem: React.FC<WalletItemProps> = ({ method, onRemove }) => {
  const getStyle = () => {
    switch (method.type) {
      case PaymentType.CARD: return { icon: 'fa-credit-card', bg: 'bg-emerald-50', text: 'text-emerald-600', border: 'border-emerald-100' };
      case PaymentType.WALLET: return { icon: 'fa-wallet', bg: 'bg-teal-50', text: 'text-teal-600', border: 'border-teal-100' };
      case PaymentType.APP: return { icon: 'fa-mobile-screen-button', bg: 'bg-green-50', text: 'text-green-600', border: 'border-green-100' };
      case PaymentType.LOYALTY: return { icon: 'fa-crown', bg: 'bg-lime-50', text: 'text-lime-600', border: 'border-lime-100' };
      default: return { icon: 'fa-circle-question', bg: 'bg-slate-50', text: 'text-slate-600', border: 'border-slate-100' };
    }
  };

  const style = getStyle();

  return (
    <div className={`group flex items-center justify-between p-4 bg-white/80 rounded-2xl border ${style.border} shadow-sm hover:shadow-md hover:bg-white transition-all duration-300 animate-item`}>
      <div className="flex items-center gap-3">
        <div className={`w-11 h-11 rounded-xl ${style.bg} ${style.text} flex items-center justify-center transition-transform group-hover:scale-110 shadow-sm`}>
          <i className={`fa-solid ${style.icon} text-lg`}></i>
        </div>
        <div className="overflow-hidden">
          <h4 className="font-bold text-slate-800 text-sm truncate max-w-[150px]">{method.provider}</h4>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-tight truncate max-w-[150px] opacity-70">{method.name}</p>
        </div>
      </div>
      <button 
        onClick={() => onRemove(method.id)}
        className="opacity-0 group-hover:opacity-100 w-8 h-8 rounded-full bg-rose-50 text-rose-500 hover:bg-rose-500 hover:text-white transition-all flex items-center justify-center shadow-inner"
        aria-label="Xóa"
      >
        <i className="fa-solid fa-trash-can text-xs"></i>
      </button>
    </div>
  );
};

export default WalletItem;
