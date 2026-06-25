"use client";

import { useEffect, useRef, useState } from "react";
import { Store } from "../types";

interface MapViewerProps {
  stores: Store[];
  selectedStore: Store | null;
  onSelectStore: (store: Store) => void;
}

export default function MapViewer({ stores, selectedStore, onSelectStore }: MapViewerProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [apiKey] = useState(process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || "");
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);

  useEffect(() => {
    if (!apiKey) return;
    
    if (document.getElementById("kakao-map-script")) {
      if (window.kakao && window.kakao.maps) {
        setMapLoaded(true);
      }
      return;
    }

    const script = document.createElement("script");
    script.id = "kakao-map-script";
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services,clusterer&autoload=false`;
    script.async = true;
    
    script.onload = () => {
      window.kakao.maps.load(() => {
        setMapLoaded(true);
        if (containerRef.current) {
          const options = {
            center: new window.kakao.maps.LatLng(35.2285, 128.6811), // 창원시청
            level: 7,
          };
          mapRef.current = new window.kakao.maps.Map(containerRef.current, options);
          infoWindowRef.current = new window.kakao.maps.InfoWindow({ 
            zIndex: 1,
            removable: true // X 닫기 버튼 활성화
          });
        }
      });
    };
    
    document.head.appendChild(script);
  }, [apiKey]);

  // Load all markers
  useEffect(() => {
    if (!mapLoaded || !mapRef.current || stores.length === 0) return;

    // Clear existing markers
    markersRef.current.forEach(m => m.setMap(null));
    markersRef.current = [];

    // Clear old cache just in case
    localStorage.removeItem('changwon_coords');
    const geocoder = new window.kakao.maps.services.Geocoder();
    const cachedCoords = JSON.parse(localStorage.getItem('changwon_coords_v2') || '{}');
    
    const createMarker = (store: Store, coords: any) => {
      let iconSvg = '';
      let bgColor = 'bg-rose-500';
      let shadowColor = 'shadow-[0_4px_12px_rgba(244,63,94,0.4)]';
      let hoverBg = 'hover:bg-rose-400';
      let hoverScale = 'hover:scale-110';

      if (store.category.includes('제과') || store.mainMenu.includes('빵')) {
        // 크로와상 (제과점)
        iconSvg = `<path d="m4.6 13.11 5.79-3.21c1.89-1.05 4.79 1.78 3.71 3.71l-3.22 5.81C8.8 23.16.79 15.23 4.6 13.11Z"/><path d="m10.5 9.5-1-2.29C9.2 6.48 8.8 6 8 6H4.5C2.79 6 2 7.5 2 8.5a7.05 7.05 0 0 0 2.11 4.89"/><path d="m14.5 13.5 2.29 1c.73.3 1.21.7 1.21 1.5v3.5c0 1.71-1.5 2.5-2.5 2.5a7.05 7.05 0 0 1-4.89-2.11"/>`;
        bgColor = 'bg-amber-500';
        shadowColor = 'shadow-[0_4px_12px_rgba(245,158,11,0.4)]';
        hoverBg = 'hover:bg-amber-400';
      } else if (store.category.includes('카페') || store.mainMenu.includes('커피') || store.mainMenu.includes('음료') || store.mainMenu.includes('차')) {
        // 커피잔 (메뉴에 커피, 음료, 차가 있거나 카테고리가 카페인 경우)
        iconSvg = `<path d="M17 8h1a4 4 0 1 1 0 8h-1"/><path d="M3 8h14v9a4 4 0 0 1-4 4H7a4 4 0 0 1-4-4Z"/><line x1="6" x2="6" y1="2" y2="4"/><line x1="10" x2="10" y1="2" y2="4"/><line x1="14" x2="14" y1="2" y2="4"/>`;
        bgColor = 'bg-stone-600';
        shadowColor = 'shadow-[0_4px_12px_rgba(87,83,78,0.4)]';
        hoverBg = 'hover:bg-stone-500';
      } else {
        // 하트 (일반음식점, default: SVG는 fill)
        iconSvg = `<path fill="currentColor" d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>`;
      }

      // 커스텀 마커 (DOM 요소로 생성)
      const content = document.createElement('div');
      content.innerHTML = `
        <div class="relative group cursor-pointer">
          <div class="w-10 h-10 ${bgColor} rounded-full flex items-center justify-center ${shadowColor} border-2 border-white transition-transform transform ${hoverScale} ${hoverBg} z-10">
            <svg class="w-5 h-5 text-white pointer-events-none" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
              ${iconSvg}
            </svg>
          </div>
          <div class="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block whitespace-nowrap bg-white text-slate-800 text-xs font-bold py-1 px-3 rounded-lg shadow-lg pointer-events-none">
            ${store.name}
            <div class="absolute top-full left-1/2 -translate-x-1/2 -mt-1 border-4 border-transparent border-t-white"></div>
          </div>
        </div>
      `;
      
      // 마커 클릭 시 스토어 선택 함수 호출
      content.addEventListener('click', () => {
        onSelectStore(store);
      });

      const customOverlay = new window.kakao.maps.CustomOverlay({
        position: coords,
        content: content,
        yAnchor: 1,
        zIndex: 0
      });

      customOverlay.setMap(mapRef.current);
      markersRef.current.push(customOverlay);

      // Save to cache
      if (!cachedCoords[store.location]) {
        cachedCoords[store.location] = { lat: coords.getLat(), lng: coords.getLng() };
        localStorage.setItem('changwon_coords_v2', JSON.stringify(cachedCoords));
      }
    };

    // Render all markers using pre-calculated coordinates or cache
    const processStores = async () => {
      const storesToGeocode: Store[] = [];

      stores.forEach(store => {
        if (store.lat && store.lng) {
          const coords = new window.kakao.maps.LatLng(store.lat, store.lng);
          createMarker(store, coords);
        } else if (cachedCoords[store.location]) {
          const coords = new window.kakao.maps.LatLng(cachedCoords[store.location].lat, cachedCoords[store.location].lng);
          createMarker(store, coords);
        } else {
          storesToGeocode.push(store);
        }
      });

      // Queue system to prevent client-side rate limits
      for (let i = 0; i < storesToGeocode.length; i++) {
        const store = storesToGeocode[i];
        await new Promise(resolve => setTimeout(resolve, 200)); // 200ms delay between requests
        
        // 주소 정제 (건물명 등 제거하고 순수 도로명/지번만 추출)
        let searchAddr = store.location.split('(')[0].split(',')[0].trim();
        const match = searchAddr.match(/^(.*?(?:로|길|동|읍|면|리)\\s*\\d+(?:-\\d+)?)/);
        if (match) {
          searchAddr = match[1];
        }
        
        geocoder.addressSearch(searchAddr, (result: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK) {
            const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
            createMarker(store, coords);
            cachedCoords[store.location] = { lat: result[0].y, lng: result[0].x };
            localStorage.setItem('changwon_coords_v2', JSON.stringify(cachedCoords));
          }
        });
      }
    };

    processStores();

  }, [mapLoaded, stores]);

  // Handle selected store
  useEffect(() => {
    if (mapLoaded && mapRef.current && selectedStore) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      const cachedCoords = JSON.parse(localStorage.getItem('changwon_coords') || '{}');
      
      const moveToStore = (lat: number, lng: number) => {
        const coords = new window.kakao.maps.LatLng(lat, lng);
        mapRef.current.panTo(coords);
        
        // Open central info window (padding-right: 35px 추가하여 X 버튼과 겹치지 않게 함)
        const directionUrl = selectedStore.lat && selectedStore.lng ? `https://map.kakao.com/link/to/${selectedStore.name},${selectedStore.lat},${selectedStore.lng}` : `https://map.kakao.com/link/search/창원 ${selectedStore.name}`;
        infoWindowRef.current.setContent(`<div style="padding:15px 35px 15px 15px;font-size:14px;border-radius:12px;font-family:inherit;min-width:180px;"><strong style="color:#e11d48;font-size:16px;">${selectedStore.name}</strong><br><span style="font-size:12px;color:#64748b;margin-top:4px;display:block;">${selectedStore.category}</span><a href="${directionUrl}" target="_blank" style="display:inline-flex;align-items:center;gap:4px;margin-top:10px;background:#eff6ff;color:#2563eb;padding:6px 12px;border-radius:6px;text-decoration:none;font-weight:bold;font-size:13px;transition:all 0.2s;"><svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 20l-5.447-2.724A1 1 0 013 16.382V5.618a1 1 0 011.447-.894L9 7m0 13l6-3m-6 3V7m6 10l4.553 2.276A1 1 0 0021 18.382V7.618a1 1 0 00-.553-.894L15 4m0 13V4m0 0L9 7"></path></svg>카카오맵 길찾기</a></div>`);
        infoWindowRef.current.setPosition(coords);
        infoWindowRef.current.setMap(mapRef.current);
      };

      if (selectedStore.lat && selectedStore.lng) {
        moveToStore(selectedStore.lat, selectedStore.lng);
      } else if (cachedCoords[selectedStore.location]) {
        moveToStore(cachedCoords[selectedStore.location].lat, cachedCoords[selectedStore.location].lng);
      } else {
        let searchAddr = selectedStore.location.split('(')[0].split(',')[0].trim();
        const match = searchAddr.match(/^(.*?(?:로|길|동|읍|면|리)\\s*\\d+(?:-\\d+)?)/);
        if (match) {
          searchAddr = match[1];
        }

        geocoder.addressSearch(searchAddr, (result: any, status: any) => {
          if (status === window.kakao.maps.services.Status.OK) {
            moveToStore(result[0].y, result[0].x);
          }
        });
      }
    }
  }, [mapLoaded, selectedStore]);

  // 내 위치 기능
  const moveToMyLocation = () => {
    if (navigator.geolocation && mapRef.current) {
      navigator.geolocation.getCurrentPosition((position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        const locPosition = new window.kakao.maps.LatLng(lat, lon);
        mapRef.current.panTo(locPosition);
        
        // Add a simple marker for my location if not exists
        if (!(window as any).myLocMarker) {
          const content = document.createElement('div');
          content.innerHTML = `<div class="w-5 h-5 bg-blue-500 rounded-full border-[3px] border-white shadow-[0_0_12px_rgba(59,130,246,0.6)] animate-pulse"></div>`;
          (window as any).myLocMarker = new window.kakao.maps.CustomOverlay({
            position: locPosition,
            content: content
          });
          (window as any).myLocMarker.setMap(mapRef.current);
        } else {
          (window as any).myLocMarker.setPosition(locPosition);
        }
      });
    } else {
      alert("현재 위치를 가져올 수 없습니다. 브라우저의 위치 권한을 허용해주세요.");
    }
  };

  if (!apiKey) return null;

  return (
    <div className="w-full h-full relative bg-slate-100">
      <div ref={containerRef} className="w-full h-full" />
      {/* 내 위치 버튼 */}
      <button 
        onClick={moveToMyLocation}
        className="absolute bottom-6 right-6 z-10 bg-white p-3.5 rounded-2xl shadow-[0_4px_20px_rgba(0,0,0,0.15)] border border-slate-100 hover:bg-slate-50 hover:scale-105 active:scale-95 transition-all text-slate-700 group"
        title="내 위치로 이동"
      >
        <svg className="w-6 h-6 group-hover:text-blue-500 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
      </button>
    </div>
  );
}

declare global {
  interface Window {
    kakao: any;
  }
}
