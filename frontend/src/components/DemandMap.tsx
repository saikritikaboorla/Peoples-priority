'use client';

import { useEffect, useRef } from 'react';
import type { HeatmapPoint } from '@/lib/api';

interface Props {
  points: HeatmapPoint[];
  center?: [number, number];
}

export default function DemandMap({ points, center = [28.6139, 77.209] }: Props) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstance = useRef<{ remove: () => void } | null>(null);

  useEffect(() => {
    if (!mapRef.current || typeof window === 'undefined') return;

    let cancelled = false;

    import('leaflet').then((L) => {
      if (cancelled || !mapRef.current) return;

      import('leaflet/dist/leaflet.css');

      if (mapInstance.current) {
        mapInstance.current.remove();
      }

      const map = L.map(mapRef.current).setView(center, 11);
      mapInstance.current = map;

      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; OpenStreetMap',
      }).addTo(map);

      const maxWeight = Math.max(...points.map((p) => p.weight), 1);

      points.forEach((p) => {
        const intensity = p.weight / maxWeight;
        const radius = 8 + intensity * 20;
        const color = intensity > 0.7 ? '#dc2626' : intensity > 0.4 ? '#f59e0b' : '#3b82f6';

        L.circleMarker([p.latitude, p.longitude], {
          radius,
          fillColor: color,
          color: color,
          weight: 1,
          opacity: 0.8,
          fillOpacity: 0.5,
        })
          .bindPopup(`<strong>${p.district || 'Area'}</strong><br/>${p.theme || 'Feedback'}: ${p.weight} requests`)
          .addTo(map);
      });
    });

    return () => {
      cancelled = true;
      mapInstance.current?.remove();
      mapInstance.current = null;
    };
  }, [points, center]);

  return <div ref={mapRef} className="h-[400px] w-full rounded-xl" />;
}
