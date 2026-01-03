'use client';

import { useEffect, useState, useCallback } from 'react';
import { GoogleMap, LoadScript, Marker, InfoWindow } from '@react-google-maps/api';

interface DeliveryDriver {
  userId: string;
  email: string;
  displayName: string;
  location: {
    latitude: number;
    longitude: number;
    accuracy: number;
    speed: number | null;
    heading: number | null;
  };
  timestamp: any;
  lastUpdate: number;
  isActive: boolean;
}

interface DeliveryMapProps {
  drivers: DeliveryDriver[];
  selectedDriver: string | null;
  onDriverSelect: (userId: string | null) => void;
}

// Kuwait center coordinates
const kuwaitCenter = {
  lat: 29.3759,
  lng: 47.9774,
};

const mapContainerStyle = {
  width: '100%',
  height: '600px',
  borderRadius: '0.5rem',
};

const mapOptions = {
  zoomControl: true,
  streetViewControl: true,
  mapTypeControl: true,
  fullscreenControl: true,
  mapTypeId: 'roadmap' as google.maps.MapTypeId,
};

export default function DeliveryMap({ drivers, selectedDriver, onDriverSelect }: DeliveryMapProps) {
  const [map, setMap] = useState<google.maps.Map | null>(null);
  const [center, setCenter] = useState(kuwaitCenter);
  const [zoom, setZoom] = useState(12);

  // Update map center when a driver is selected
  useEffect(() => {
    if (selectedDriver && drivers.length > 0) {
      const driver = drivers.find(d => d.userId === selectedDriver);
      if (driver) {
        setCenter({
          lat: driver.location.latitude,
          lng: driver.location.longitude,
        });
        setZoom(15);
      }
    } else if (drivers.length > 0) {
      // Fit bounds to show all drivers
      if (map && drivers.length > 1) {
        const bounds = new google.maps.LatLngBounds();
        drivers.forEach(driver => {
          bounds.extend({
            lat: driver.location.latitude,
            lng: driver.location.longitude,
          });
        });
        map.fitBounds(bounds);
      } else if (drivers.length === 1) {
        setCenter({
          lat: drivers[0].location.latitude,
          lng: drivers[0].location.longitude,
        });
        setZoom(14);
      }
    }
  }, [selectedDriver, drivers, map]);

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map);
  }, []);

  const onUnmount = useCallback(() => {
    setMap(null);
  }, []);

  const getTimeSinceUpdate = (lastUpdate: number): string => {
    const now = Date.now();
    const diff = Math.floor((now - lastUpdate) / 1000);

    if (diff < 60) return `${diff} ثانية`;
    if (diff < 3600) return `${Math.floor(diff / 60)} دقيقة`;
    return `${Math.floor(diff / 3600)} ساعة`;
  };

  // Get Google Maps API key from environment variable
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || '';

  if (!apiKey) {
    return (
      <div className="w-full h-[600px] bg-gray-100 dark:bg-gray-700 rounded-lg flex items-center justify-center">
        <div className="text-center p-6">
          <p className="text-red-600 dark:text-red-400 font-bold mb-2">
            ⚠️ خطأ: مفتاح Google Maps API غير موجود
          </p>
          <p className="text-sm text-gray-600 dark:text-gray-400">
            يرجى إضافة NEXT_PUBLIC_GOOGLE_MAPS_API_KEY في ملف .env.local
          </p>
        </div>
      </div>
    );
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={mapContainerStyle}
        center={center}
        zoom={zoom}
        options={mapOptions}
        onLoad={onLoad}
        onUnmount={onUnmount}
      >
        {drivers.map((driver) => (
          <Marker
            key={driver.userId}
            position={{
              lat: driver.location.latitude,
              lng: driver.location.longitude,
            }}
            title={driver.displayName}
            icon={{
              url: 'https://maps.google.com/mapfiles/ms/icons/green-dot.png',
              scaledSize: new google.maps.Size(40, 40),
            }}
            onClick={() => onDriverSelect(driver.userId)}
          >
            {selectedDriver === driver.userId && (
              <InfoWindow
                position={{
                  lat: driver.location.latitude,
                  lng: driver.location.longitude,
                }}
                onCloseClick={() => onDriverSelect(null)}
              >
                <div className="p-2 min-w-[200px]" dir="rtl">
                  <h3 className="font-bold text-lg mb-2">🚗 {driver.displayName}</h3>
                  <div className="text-sm space-y-1">
                    <p>📧 {driver.email}</p>
                    <p>📍 {driver.location.latitude.toFixed(6)}, {driver.location.longitude.toFixed(6)}</p>
                    <p>⏱️ آخر تحديث: {getTimeSinceUpdate(driver.lastUpdate)}</p>
                    {driver.location.speed && driver.location.speed > 0 && (
                      <p>🚀 السرعة: {Math.round(driver.location.speed * 3.6)} كم/ساعة</p>
                    )}
                    <p>🎯 دقة الموقع: {Math.round(driver.location.accuracy)} متر</p>
                    <div className="mt-2 pt-2 border-t">
                      <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        🟢 نشط
                      </span>
                    </div>
                  </div>
                </div>
              </InfoWindow>
            )}
          </Marker>
        ))}
      </GoogleMap>
    </LoadScript>
  );
}
