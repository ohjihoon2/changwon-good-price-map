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
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  }, [selectedStore]);

  if (stores.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center h-48 text-slate-400">
        <svg className="w-12 h-12 mb-3 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
        <p>검색 결과가 없습니다.</p>
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
