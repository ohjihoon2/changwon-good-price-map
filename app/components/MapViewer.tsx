"use client";

import { useEffect, useRef, useState } from "react";
import { Store } from "../types";

interface MapViewerProps {
  stores: Store[];
  selectedStore: Store | null;
}

export default function MapViewer({ stores, selectedStore }: MapViewerProps) {
  const mapRef = useRef<any>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [apiKey] = useState(process.env.NEXT_PUBLIC_KAKAO_MAP_API_KEY || "");
  const markersRef = useRef<any[]>([]);
  const infoWindowRef = useRef<any>(null);

  useEffect(() => {
    if (!apiKey) return;
    
    // Check if script already exists
    if (document.getElementById("kakao-map-script")) {
      if (window.kakao && window.kakao.maps) {
        setMapLoaded(true);
      }
      return;
    }

    const script = document.createElement("script");
    script.id = "kakao-map-script";
    script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${apiKey}&libraries=services&autoload=false`;
    script.async = true;
    
    script.onload = () => {
      window.kakao.maps.load(() => {
        setMapLoaded(true);
        if (containerRef.current) {
          const options = {
            center: new window.kakao.maps.LatLng(35.2285, 128.6811), // 창원시청 기본 좌표
            level: 7,
          };
          mapRef.current = new window.kakao.maps.Map(containerRef.current, options);
          infoWindowRef.current = new window.kakao.maps.InfoWindow({ zIndex: 1 });
        }
      });
    };
    
    document.head.appendChild(script);
  }, [apiKey]);

  // Handle selected store
  useEffect(() => {
    if (mapLoaded && mapRef.current && selectedStore) {
      const geocoder = new window.kakao.maps.services.Geocoder();
      
      // Clean up previous markers if any
      markersRef.current.forEach(m => m.setMap(null));
      markersRef.current = [];

      geocoder.addressSearch(selectedStore.location, (result: any, status: any) => {
        if (status === window.kakao.maps.services.Status.OK) {
          const coords = new window.kakao.maps.LatLng(result[0].y, result[0].x);
          
          mapRef.current.panTo(coords);
          
          // Custom marker styling can be done here
          const marker = new window.kakao.maps.Marker({
            map: mapRef.current,
            position: coords
          });
          
          markersRef.current.push(marker);
          
          // Info window
          infoWindowRef.current.setContent(`<div style="padding:10px;font-size:14px;border-radius:8px;font-family:inherit;"><strong>${selectedStore.name}</strong></div>`);
          infoWindowRef.current.open(mapRef.current, marker);
        }
      });
    }
  }, [mapLoaded, selectedStore]);

  if (!apiKey) {
    return (
      <div className="w-full h-full flex flex-col items-center justify-center bg-slate-100 text-slate-500 p-8 text-center border-l border-slate-200">
        <div className="w-20 h-20 bg-white rounded-2xl shadow-sm flex items-center justify-center mb-6">
          <svg className="w-10 h-10 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
        </div>
        <h2 className="text-2xl font-bold text-slate-800 mb-3">지도를 불러올 수 없습니다</h2>
        <p className="mb-6 text-base text-slate-600 max-w-md leading-relaxed">
          카카오맵 API 키가 설정되지 않았습니다. 루트 디렉토리에 <code className="bg-slate-200 px-1.5 py-0.5 rounded text-slate-800">.env.local</code> 파일을 만들고 아래 환경변수를 추가해주세요.
        </p>
        <div className="bg-slate-800 text-slate-300 p-4 rounded-xl text-left w-full max-w-md shadow-inner text-sm font-mono">
          NEXT_PUBLIC_KAKAO_MAP_API_KEY=당신의_카카오맵_JS_앱키
        </div>
      </div>
    );
  }

  return (
    <div className="w-full h-full relative bg-slate-100">
      <div ref={containerRef} className="w-full h-full" />
    </div>
  );
}

declare global {
  interface Window {
    kakao: any;
  }
}
