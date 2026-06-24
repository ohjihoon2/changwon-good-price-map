import { useEffect } from "react";
import { Store } from "../types";
import StoreCard from "./StoreCard";

interface StoreListProps {
  stores: Store[];
  selectedStore: Store | null;
  onSelectStore: (store: Store) => void;
}

export default function StoreList({ stores, selectedStore, onSelectStore }: StoreListProps) {
  // 스토어가 선택될 때 해당 카드로 자동 스크롤
  useEffect(() => {
    if (selectedStore) {
      const element = document.getElementById(`store-card-${selectedStore.name}`);
      if (element) {
        element.scrollIntoView({ behavior: 'auto', block: 'center' });
      }
    }
  }, [selectedStore]);

  if (stores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-full min-h-[300px] text-slate-500 bg-white/50 rounded-2xl border border-dashed border-slate-200 m-2">
        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
          <span className="text-3xl">🫥</span>
        </div>
        <h3 className="text-lg font-bold text-slate-700 mb-1">앗! 일치하는 식당이 없어요</h3>
        <p className="text-sm text-slate-500">다른 검색어나 카테고리를 선택해보세요!</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 pb-8">
      {stores.map((store, idx) => (
        <StoreCard 
          key={`${store.name}-${idx}`} 
          id={`store-card-${store.name}`}
          store={store} 
          isSelected={selectedStore?.name === store.name}
          onClick={() => onSelectStore(store)}
        />
      ))}
    </div>
  );
}
