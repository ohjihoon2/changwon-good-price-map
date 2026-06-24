"use client";

import { useState, useMemo } from "react";
import { Store } from "../types";
import FilterBar from "./FilterBar";
import StoreList from "./StoreList";
import MapViewer from "./MapViewer";

export default function MainApp({ initialStores }: { initialStores: Store[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("전체");
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [isMobileListOpen, setIsMobileListOpen] = useState(false);

  // Extract unique categories
  const categories = useMemo(() => {
    const cats = new Set(initialStores.map(s => s.category));
    return ["전체", ...Array.from(cats)];
  }, [initialStores]);

  // Filter stores
  const filteredStores = useMemo(() => {
    return initialStores.filter(store => {
      const matchCategory = selectedCategory === "전체" || store.category === selectedCategory;
      const matchSearch = store.name.includes(searchTerm) || store.mainMenu.includes(searchTerm) || store.location.includes(searchTerm);
      return matchCategory && matchSearch;
    });
  }, [initialStores, searchTerm, selectedCategory]);

  return (
    <div className="flex h-full w-full relative overflow-hidden bg-slate-100">
      
      {/* Map Area (Full screen on mobile, right side on desktop) */}
      <main className="absolute inset-0 md:relative md:flex-1 w-full h-full z-0">
        <MapViewer 
          stores={filteredStores} 
          selectedStore={selectedStore} 
          onSelectStore={(store) => {
            setSelectedStore(store);
            setIsMobileListOpen(true); // 모바일에서 마커 누르면 정보창(시트) 열리기
          }}
        />
      </main>

      {/* Sidebar Area (Bottom sheet on mobile, left panel on desktop) */}
      <aside className={`
        absolute md:relative z-20 
        ${isMobileListOpen ? 'bottom-0' : '-bottom-[100%]'} 
        md:bottom-auto md:left-0
        w-full md:w-[400px] lg:w-[480px] 
        h-[85vh] md:h-full 
        bg-white/95 md:bg-white/80 backdrop-blur-xl 
        rounded-t-3xl md:rounded-none
        border-t md:border-r md:border-t-0 border-slate-200 
        flex flex-col 
        shadow-[0_-8px_30px_rgba(0,0,0,0.12)] md:shadow-[4px_0_24px_rgba(0,0,0,0.04)]
        transition-all duration-300 ease-in-out
      `}>
        {/* Mobile Drag Handle */}
        <div 
          className="md:hidden w-full h-8 flex items-center justify-center cursor-pointer shrink-0" 
          onClick={() => setIsMobileListOpen(false)}
        >
          <div className="w-12 h-1.5 bg-slate-300 rounded-full"></div>
        </div>

        <div className="p-5 md:p-6 border-b border-slate-100 flex-shrink-0 pt-2 md:pt-6">
          <h1 className="text-xl md:text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-pink-400 mb-4 md:mb-6 tracking-tight">
            창원시 임산부 할인음식점
          </h1>
          <FilterBar 
            categories={categories}
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            searchTerm={searchTerm}
            onSearchChange={setSearchTerm}
          />
        </div>
        
        <div className="flex-1 overflow-y-auto p-4 bg-slate-50/50">
          <StoreList 
            stores={filteredStores} 
            selectedStore={selectedStore}
            onSelectStore={setSelectedStore}
          />
        </div>
      </aside>

      {/* Mobile Toggle FAB */}
      <button
        onClick={() => setIsMobileListOpen(!isMobileListOpen)}
        className="md:hidden fixed bottom-8 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-5 py-3.5 bg-slate-800/95 backdrop-blur text-white rounded-full shadow-[0_8px_30px_rgba(0,0,0,0.2)] font-semibold text-sm transition-transform active:scale-95"
      >
        {isMobileListOpen ? (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7" /></svg>
            지도 보기
          </>
        ) : (
          <>
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 10h16M4 14h16M4 18h16" /></svg>
            목록 보기
          </>
        )}
      </button>

    </div>
  );
}
