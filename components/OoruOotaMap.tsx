'use client';

import React, { useEffect, useRef } from 'react';
import { VerifiedKitchen } from '@/lib/spatial';

interface OoruOotaMapProps {
  kitchens: VerifiedKitchen[];
  selectedKitchenId: string | null;
  onSelectKitchen: (id: string) => void;
  valleyCoords: { lat: number; lng: number; zoom: number; name: string };
}

export default function OoruOotaMap({
  kitchens,
  selectedKitchenId,
  onSelectKitchen,
  valleyCoords,
}: OoruOotaMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  // Initialize Map
  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    let isMounted = true;

    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      if (!isMounted || !mapRef.current || mapInstanceRef.current) return;

      const map = L.map(mapRef.current, {
        center: [valleyCoords.lat, valleyCoords.lng],
        zoom: valleyCoords.zoom,
        zoomControl: false,
        attributionControl: false,
      });

      // OpenStreetMap Tile style (no watermark / API key needed)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Attribution
      L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

      mapInstanceRef.current = map;
    };

    initMap();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update Center when valley changes
  useEffect(() => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([valleyCoords.lat, valleyCoords.lng], valleyCoords.zoom, {
        duration: 1.2,
      });
    }
  }, [valleyCoords]);

  // Update Markers
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear previous markers
      markersRef.current.forEach(m => m.remove());
      markersRef.current = [];

      kitchens.forEach(k => {
        const isSelected = k.id === selectedKitchenId;

        // Custom HTML DivIcon matching Stitch design
        const iconHtml = isSelected
          ? `
            <div class="relative flex items-center justify-center">
              <span class="animate-ping absolute -inset-2 rounded-full bg-[#00685f] opacity-60"></span>
              <div class="relative w-10 h-10 rounded-full bg-[#00685f] text-white shadow-xl flex items-center justify-center ring-4 ring-white cursor-pointer transform scale-110">
                <span class="material-symbols-outlined text-[20px]">outdoor_grill</span>
              </div>
              <div class="absolute -bottom-6 whitespace-nowrap bg-white text-[#1b1c1a] px-2 py-0.5 rounded shadow-md text-[10px] font-bold border border-[#00685f]/30">
                ${k.name.slice(0, 16)}...
              </div>
            </div>
          `
          : `
            <div class="relative flex items-center justify-center group cursor-pointer">
              <div class="w-8 h-8 rounded-full bg-[#9a452c] text-white shadow-md flex items-center justify-center transition-transform hover:scale-110">
                <span class="material-symbols-outlined text-[17px]">restaurant</span>
              </div>
              <div class="absolute -bottom-5 whitespace-nowrap bg-white text-[#3d4947] px-1.5 py-0.5 rounded shadow-xs text-[9px] font-semibold opacity-90 group-hover:opacity-100">
                ${k.name.split(' ')[0]}
              </div>
            </div>
          `;

        const icon = L.divIcon({
          className: 'custom-kitchen-marker',
          html: iconHtml,
          iconSize: [40, 40],
          iconAnchor: [20, 20],
        });

        const marker = L.marker([k.latitude, k.longitude], { icon })
          .addTo(map)
          .on('click', () => {
            onSelectKitchen(k.id);
          });

        markersRef.current.push(marker);
      });
    };

    updateMarkers();
  }, [kitchens, selectedKitchenId, onSelectKitchen]);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleLocateValley = () => {
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyTo([valleyCoords.lat, valleyCoords.lng], valleyCoords.zoom);
    }
  };

  return (
    <div className="relative w-full h-[580px] rounded-xl overflow-hidden shadow-md bg-[#eae8e5]">
      {/* Leaflet Map Canvas */}
      <div ref={mapRef} className="w-full h-full" />

      {/* Top Map Overlay Controls (From Stitch Screen) */}
      <div className="absolute top-3 left-3 right-3 z-[1000] flex items-center justify-between pointer-events-none">
        <div className="pointer-events-auto bg-white/95 backdrop-blur-md px-3 py-1.5 rounded-lg shadow-sm flex items-center gap-2 border border-[#eae8e5]">
          <span className="material-symbols-outlined text-[#9a452c] text-[18px]">explore</span>
          <span className="text-xs font-semibold text-[#9a452c]">
            {valleyCoords.name === 'All Valleys'
              ? 'Malaprabha River Basin Heritage Grid'
              : `${valleyCoords.name} Valley • 5km Radius Grid`}
          </span>
        </div>
        <div className="pointer-events-auto flex items-center gap-1 bg-white/95 backdrop-blur-md p-1 rounded-lg shadow-sm border border-[#eae8e5]">
          <button
            onClick={handleZoomIn}
            className="p-1.5 rounded text-[#1b1c1a] hover:bg-[#efeeeb] transition-colors"
            title="Zoom In"
          >
            <span className="material-symbols-outlined text-[18px]">add</span>
          </button>
          <button
            onClick={handleZoomOut}
            className="p-1.5 rounded text-[#1b1c1a] hover:bg-[#efeeeb] transition-colors"
            title="Zoom Out"
          >
            <span className="material-symbols-outlined text-[18px]">remove</span>
          </button>
          <button
            onClick={handleLocateValley}
            className="p-1.5 rounded text-[#00685f] hover:bg-[#00685f]/10 transition-colors"
            title="Locate Current Valley"
          >
            <span className="material-symbols-outlined text-[18px]">my_location</span>
          </button>
        </div>
      </div>

      {/* Bottom Map Legend Pill (From Stitch Screen) */}
      <div className="absolute bottom-3 left-3 z-[1000] bg-white/95 backdrop-blur-md px-3 py-2 rounded-lg shadow-sm flex items-center gap-3 text-xs text-[#3d4947] border border-[#eae8e5]">
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-[#9a452c] inline-block"></span>
          <span>Home Mess</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-3 h-3 rounded-full bg-[#00685f] inline-block"></span>
          <span>Selected Spot</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="material-symbols-outlined text-[14px] text-[#00685f]">verified</span>
          <span>100% Sorghum Verified</span>
        </div>
      </div>
    </div>
  );
}
