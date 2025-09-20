import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Circle, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { Vehicle, RSU, ThreatDetection } from '@/types/v2x';
import { Badge } from '@/components/ui/badge';

// Fix for default markers in react-leaflet
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: '/placeholder.svg',
  iconUrl: '/placeholder.svg',
  shadowUrl: '/placeholder.svg',
});

interface V2XMapProps {
  vehicles: Vehicle[];
  rsus: RSU[];
  threats: ThreatDetection[];
  className?: string;
}

// Custom icons for vehicles and RSUs
const createVehicleIcon = (status: Vehicle['status'], threatLevel: Vehicle['threatLevel']) => {
  const color = status === 'compromised' 
    ? '#ef4444' 
    : status === 'suspicious' 
      ? '#f59e0b' 
      : '#10b981';
  
  return L.divIcon({
    html: `
      <div class="relative">
        <div class="w-4 h-4 rounded-full border-2 border-white" style="background-color: ${color}">
        </div>
        ${threatLevel === 'high' ? '<div class="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>' : ''}
      </div>
    `,
    className: 'vehicle-marker',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
};

const createRSUIcon = (status: RSU['status']) => {
  const color = status === 'compromised' 
    ? '#ef4444' 
    : status === 'offline' 
      ? '#6b7280' 
      : '#8b5cf6';
  
  return L.divIcon({
    html: `
      <div class="w-6 h-6 rounded-lg border-2 border-white flex items-center justify-center text-xs font-bold text-white" 
           style="background-color: ${color}">
        R
      </div>
    `,
    className: 'rsu-marker',
    iconSize: [24, 24],
    iconAnchor: [12, 12],
  });
};

const ThreatIndicator: React.FC<{ threat: ThreatDetection }> = ({ threat }) => {
  const map = useMap();
  
  useEffect(() => {
    if (threat.severity === 'high') {
      // Flash the map briefly for high severity threats
      const mapContainer = map.getContainer();
      mapContainer.style.filter = 'brightness(1.5) hue-rotate(10deg)';
      setTimeout(() => {
        mapContainer.style.filter = '';
      }, 500);
    }
  }, [threat, map]);

  return null;
};

const V2XMap: React.FC<V2XMapProps> = ({ vehicles, rsus, threats, className }) => {
  const mapRef = useRef<L.Map>(null);
  const [selectedNode, setSelectedNode] = useState<string | null>(null);

  const center: [number, number] = [40.7831, -73.9712]; // New York area
  
  return (
    <div className={`relative ${className}`}>
      <MapContainer
        center={center}
        zoom={13}
        className="w-full h-full rounded-lg"
        ref={mapRef}
      >
        <TileLayer
          url="https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png"
          attribution='&copy; <a href="https://carto.com/attributions">CARTO</a>'
        />
        
        {/* Vehicle markers */}
        {vehicles.map((vehicle) => (
          <React.Fragment key={vehicle.id}>
            <Marker
              position={vehicle.position}
              icon={createVehicleIcon(vehicle.status, vehicle.threatLevel)}
              eventHandlers={{
                click: () => setSelectedNode(vehicle.id),
              }}
            >
              <Popup>
                <div className="text-sm space-y-2">
                  <div className="font-semibold">Vehicle {vehicle.id}</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={vehicle.status === 'normal' ? 'default' : 'destructive'}>
                        {vehicle.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Speed:</span>
                      <span>{vehicle.speed} km/h</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Threat Level:</span>
                      <Badge variant={
                        vehicle.threatLevel === 'low' ? 'default' : 
                        vehicle.threatLevel === 'medium' ? 'secondary' : 'destructive'
                      }>
                        {vehicle.threatLevel}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Connected RSUs:</span>
                      <span>{vehicle.connectedRSUs.length}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
            
            {/* Communication range circle */}
            <Circle
              center={vehicle.position}
              radius={vehicle.communicationRange}
              pathOptions={{
                color: vehicle.status === 'compromised' ? '#ef4444' : '#10b981',
                fillOpacity: 0.1,
                weight: 1,
              }}
            />
          </React.Fragment>
        ))}
        
        {/* RSU markers */}
        {rsus.map((rsu) => (
          <React.Fragment key={rsu.id}>
            <Marker
              position={rsu.position}
              icon={createRSUIcon(rsu.status)}
              eventHandlers={{
                click: () => setSelectedNode(rsu.id),
              }}
            >
              <Popup>
                <div className="text-sm space-y-2">
                  <div className="font-semibold">RSU {rsu.id}</div>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span>Status:</span>
                      <Badge variant={rsu.status === 'active' ? 'default' : 'destructive'}>
                        {rsu.status}
                      </Badge>
                    </div>
                    <div className="flex justify-between">
                      <span>Range:</span>
                      <span>{rsu.range}m</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Connected Vehicles:</span>
                      <span>{rsu.connectedVehicles.length}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Threats Detected:</span>
                      <span>{rsu.threatDetections.length}</span>
                    </div>
                  </div>
                </div>
              </Popup>
            </Marker>
            
            {/* RSU coverage area */}
            <Circle
              center={rsu.position}
              radius={rsu.range}
              pathOptions={{
                color: rsu.status === 'compromised' ? '#ef4444' : '#8b5cf6',
                fillOpacity: 0.05,
                weight: 2,
                dashArray: '10, 10',
              }}
            />
          </React.Fragment>
        ))}
        
        {/* Threat indicators */}
        {threats.map((threat) => (
          <ThreatIndicator key={threat.id} threat={threat} />
        ))}
      </MapContainer>
      
      {/* Map overlay with scan line animation */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute w-full h-0.5 bg-gradient-to-r from-transparent via-primary to-transparent animate-scan-line opacity-30"></div>
      </div>
    </div>
  );
};

export default V2XMap;