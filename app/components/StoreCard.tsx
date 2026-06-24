import { Store } from "../types";

interface StoreCardProps {
  store: Store;
  isSelected: boolean;
  onClick: () => void;
  id?: string;
}

export default function StoreCard({ store, isSelected, onClick, id }: StoreCardProps) {
  return (
    <div 
      id={id}
      onClick={onClick}
      className={`p-4 rounded-2xl cursor-pointer transition-all duration-200 border ${
        isSelected 
          ? "bg-rose-50 border-rose-300 shadow-[0_4px_20px_rgba(244,63,94,0.15)] scale-[1.02]" 
          : "bg-white border-slate-100 hover:border-slate-200 hover:shadow-md hover:bg-slate-50/80"
      }`}
    >
      <div className="flex justify-between items-start mb-2">
        <h3 className={`text-lg font-bold ${isSelected ? "text-rose-700" : "text-slate-800"}`}>
          {store.name}
        </h3>
        <span className="px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg text-xs font-medium shrink-0 ml-3">
          {store.category}
        </span>
      </div>
      
      <div className="flex items-start text-sm text-slate-600 mb-2 gap-1.5">
        <svg className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        <span className="leading-snug">{store.location}</span>
      </div>
      
      <div className="flex items-start text-sm text-slate-600 gap-1.5">
        <svg className="w-4 h-4 text-orange-400 mt-0.5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" /></svg>
        <span className="leading-snug line-clamp-2">대표메뉴: {store.mainMenu}</span>
      </div>
    </div>
  );
}
