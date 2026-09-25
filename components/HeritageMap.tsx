'use client';

import React, { useEffect, useRef } from 'react';

interface MapMarker {
  id: string;
  lat: number;
  lng: number;
  severity: string;
  title: string;
  status: string;
  category: string;
}

interface HeritageMapProps {
  markers: MapMarker[];
  onMarkerClick?: (id: string) => void;
}

export default function HeritageMap({ markers, onMarkerClick }: HeritageMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<any[]>([]);

  useEffect(() => {
    if (typeof window === 'undefined' || !mapRef.current) return;

    // Dynamic import Leaflet (client-side only)
    const initMap = async () => {
      const L = (await import('leaflet')).default;
      await import('leaflet/dist/leaflet.css');

      // Only initialize once
      if (mapInstanceRef.current) return;

      const map = L.map(mapRef.current!, {
        center: [15.9187, 75.6900],
        zoom: 12,
        zoomControl: false,
        attributionControl: false,
      });

      // OpenStreetMap tiles (no API key required)
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19,
      }).addTo(map);

      // Zoom controls positioned top-right
      L.control.zoom({ position: 'topright' }).addTo(map);

      // Attribution bottom-right
      L.control.attribution({ position: 'bottomright', prefix: false }).addTo(map);

      mapInstanceRef.current = map;

      // Add landmark labels
      const landmarks = [
        { lat: 15.9187, lng: 75.6784, label: 'Badami Caves 1-4' },
        { lat: 15.9210, lng: 75.6810, label: 'Agastya Tirtha' },
        { lat: 15.9150, lng: 75.6750, label: 'Badami North Fort' },
        { lat: 16.0300, lng: 75.8230, label: 'Pattadakal UNESCO' },
        { lat: 16.0150, lng: 75.8819, label: 'Aihole Complex' },
        { lat: 15.8900, lng: 75.7200, label: 'Mahakuta Temple' },
      ];

      landmarks.forEach(lm => {
        L.marker([lm.lat, lm.lng], {
          icon: L.divIcon({
            className: 'landmark-label',
            html: `<span style="background:rgba(255,255,255,0.85);backdrop-filter:blur(4px);padding:2px 8px;border-radius:4px;font-size:11px;font-weight:600;color:#3d4947;white-space:nowrap;box-shadow:0 1px 3px rgba(0,0,0,0.1);font-family:Inter,sans-serif">${lm.label}</span>`,
            iconSize: [0, 0],
            iconAnchor: [-10, 10],
          }),
          interactive: false,
        }).addTo(map);
      });
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  // Update markers when data changes
  useEffect(() => {
    if (!mapInstanceRef.current || typeof window === 'undefined') return;

    const updateMarkers = async () => {
      const L = (await import('leaflet')).default;
      const map = mapInstanceRef.current;
      if (!map) return;

      // Clear existing markers
      markersRef.current.forEach(m => {
        try {
          if (map && typeof map.removeLayer === 'function') {
            map.removeLayer(m);
          }
        } catch {
          // ignore cleanup errors on unmounted map
        }
      });
      markersRef.current = [];

      markers.forEach(m => {
        const getColor = () => {
          if (m.status === 'resolved' || m.status === 'closed') return '#008378';
          switch (m.severity) {
            case 'critical': return '#ba1a1a';
            case 'high': return '#ba1a1a';
            case 'medium': return '#9a452c';
            default: return '#00685f';
          }
        };

        const getIcon = () => {
          if (m.status === 'resolved' || m.status === 'closed') return '✓';
          switch (m.category) {
            case 'Structural Damage': return '⚠';
            case 'Sanitation & Waste': return '🗑';
            case 'Encroachment & Transit': return '🚫';
            case 'Monument Signage': return '🪧';
            default: return '📍';
          }
        };

        const isPulsing = m.severity === 'critical' || m.severity === 'high';
        const color = getColor();
        const size = m.severity === 'critical' ? 36 : m.severity === 'high' ? 32 : 28;

        const icon = L.divIcon({
          className: 'heritage-marker',
          html: `
            <div style="position:relative;width:${size}px;height:${size}px;">
              ${isPulsing ? `<span style="position:absolute;inset:-6px;border-radius:9999px;background:${color}30;animation:ping 1.5s cubic-bezier(0, 0, 0.2, 1) infinite"></span>` : ''}
              <div style="position:relative;width:100%;height:100%;border-radius:9999px;background:${color};color:white;display:flex;align-items:center;justify-content:center;font-size:${size * 0.45}px;box-shadow:0 2px 8px ${color}60;border:2px solid white;cursor:pointer;">
                ${getIcon()}
              </div>
            </div>
          `,
          iconSize: [size, size],
          iconAnchor: [size / 2, size / 2],
        });

        const marker = L.marker([m.lat, m.lng], { icon })
          .addTo(map)
          .bindPopup(`
            <div style="font-family:Inter,sans-serif;min-width:200px;">
              <div style="font-size:10px;font-weight:700;text-transform:uppercase;letter-spacing:0.05em;color:${color};margin-bottom:4px;">${m.category} • ${m.severity}</div>
              <div style="font-family:'Playfair Display',serif;font-size:14px;font-weight:600;color:#1b1c1a;line-height:1.3;margin-bottom:6px;">${m.title}</div>
              <div style="font-size:11px;color:#6d7a77;">${m.status.replace('_', ' ').toUpperCase()}</div>
            </div>
          `, { maxWidth: 280 });

        if (onMarkerClick) {
          marker.on('click', () => onMarkerClick(m.id));
        }

        markersRef.current.push(marker);
      });
    };

    updateMarkers();
  }, [markers, onMarkerClick]);

  return (
    <div ref={mapRef} className="w-full h-full rounded-xl overflow-hidden relative z-0 isolate" style={{ minHeight: 400, zIndex: 0 }}>
      {/* CSS for Leaflet ping animation */}
      <style jsx global>{`
        @keyframes ping {
          75%, 100% { transform: scale(2); opacity: 0; }
        }
        .leaflet-popup-content-wrapper {
          border-radius: 12px !important;
          box-shadow: 0 4px 20px rgba(0,0,0,0.15) !important;
        }
        .leaflet-popup-tip {
          box-shadow: 0 2px 6px rgba(0,0,0,0.1) !important;
        }
        .leaflet-control-zoom a {
          border-radius: 8px !important;
          width: 36px !important;
          height: 36px !important;
          line-height: 36px !important;
          font-size: 16px !important;
        }
      `}</style>
    </div>
  );
}
