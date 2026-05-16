"use client";

import { useState, useEffect } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";

// Fix for default marker icons in Leaflet with Next.js
const DefaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});
L.Marker.prototype.options.icon = DefaultIcon;

interface LocationPickerProps {
  onSelect: (location: string) => void;
  initialLocation?: string;
}

function MapEvents({ onSelect }: { onSelect: (lat: number, lng: number) => void }) {
  useMapEvents({
    click(e) {
      onSelect(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

function CenterMap({ coords }: { coords: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(coords, map.getZoom());
  }, [coords, map]);
  return null;
}

export default function LocationPicker({ onSelect }: LocationPickerProps) {
  const [position, setPosition] = useState<[number, number]>([13.0827, 80.2707]); // Default to Chennai
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    // Try to get current location on mount
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition((pos) => {
        setPosition([pos.coords.latitude, pos.coords.longitude]);
      });
    }
  }, []);

  const handleMapClick = async (lat: number, lng: number) => {
    setPosition([lat, lng]);
    setLoading(true);
    try {
      const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`);
      const data = await res.json();
      if (data.display_name) {
        const addr = data.address;
        const simplified = `${addr.city || addr.town || addr.village || addr.suburb || ''}, ${addr.state || addr.country || ''}`.replace(/^, /, '');
        onSelect(simplified);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-64 rounded-xl overflow-hidden border border-gray-200 relative z-[10]">
      <MapContainer center={position} zoom={13} style={{ height: "256px", width: "100%" }}>
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        />
        <Marker position={position} />
        <MapEvents onSelect={handleMapClick} />
        <CenterMap coords={position} />
      </MapContainer>
      {loading && (
        <div className="absolute inset-0 bg-white/50 z-[1000] flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-sage-600"></div>
        </div>
      )}
      <div className="absolute bottom-2 left-2 z-[1000] bg-white px-2 py-1 rounded text-[10px] text-gray-500 shadow-sm pointer-events-none">
        Click on map to select location
      </div>
    </div>
  );
}
