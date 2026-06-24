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
    <div className="flex flex-col md:flex-row h-full w-full">
      {/* Sidebar Area */}
      <aside className="w-full md:w-[400px] lg:w-[480px] h-1/2 md:h-full bg-white/80 backdrop-blur-xl border-r border-slate-200 flex flex-col z-10 shadow-[4px_0_24px_rgba(0,0,0,0.04)]">
        <div className="p-6 border-b border-slate-100 flex-shrink-0">
          <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-rose-500 to-pink-400 mb-6 tracking-tight">
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

      {/* Map Area */}
      <main className="flex-1 h-1/2 md:h-full relative bg-slate-100">
        <MapViewer stores={filteredStores} selectedStore={selectedStore} />
      </main>
    </div>
  );
}
