import { useState, useEffect, useCallback } from 'react';
import { Vehicle, RSU, ThreatDetection, NetworkMetrics } from '@/types/v2x';

const SIMULATION_INTERVAL = 2000; // 2 seconds
const NYC_BOUNDS = {
  north: 40.8176,
  south: 40.7489,
  east: -73.9441,
  west: -74.0059,
};

// Generate random position within NYC bounds
const randomPosition = (): [number, number] => [
  NYC_BOUNDS.south + Math.random() * (NYC_BOUNDS.north - NYC_BOUNDS.south),
  NYC_BOUNDS.west + Math.random() * (NYC_BOUNDS.east - NYC_BOUNDS.west),
];

// Generate initial vehicles
const generateVehicles = (count: number): Vehicle[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `V-${String(i + 1).padStart(3, '0')}`,
    position: randomPosition(),
    speed: Math.random() * 60 + 20, // 20-80 km/h
    heading: Math.random() * 360,
    status: Math.random() > 0.9 ? 'suspicious' : 'normal',
    lastBeacon: Date.now(),
    communicationRange: 300 + Math.random() * 200, // 300-500m
    threatLevel: Math.random() > 0.95 ? 'high' : Math.random() > 0.85 ? 'medium' : 'low',
    connectedRSUs: [],
  }));
};

// Generate initial RSUs
const generateRSUs = (count: number): RSU[] => {
  return Array.from({ length: count }, (_, i) => ({
    id: `RSU-${String(i + 1).padStart(2, '0')}`,
    position: randomPosition(),
    range: 800 + Math.random() * 400, // 800-1200m
    status: Math.random() > 0.95 ? 'compromised' : 'active',
    connectedVehicles: [],
    detectionCapabilities: [
      'gps_spoofing',
      'message_flooding',
      'replay_attack',
      'position_falsification',
      'dos_attack',
    ],
    lastUpdate: Date.now(),
    threatDetections: [],
  }));
};

// Simulate threat detection
const generateThreat = (vehicles: Vehicle[], rsus: RSU[]): ThreatDetection | null => {
  if (Math.random() > 0.3) return null; // 30% chance of threat per cycle

  const threatTypes: ThreatDetection['type'][] = [
    'gps_spoofing',
    'message_flooding',
    'replay_attack',
    'position_falsification',
    'dos_attack',
  ];

  const type = threatTypes[Math.floor(Math.random() * threatTypes.length)];
  const severity: ThreatDetection['severity'] = 
    Math.random() > 0.8 ? 'high' : Math.random() > 0.5 ? 'medium' : 'low';

  const sourceVehicle = vehicles[Math.floor(Math.random() * vehicles.length)];
  const detectingRSU = rsus[Math.floor(Math.random() * rsus.length)];

  return {
    id: `T-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    type,
    severity,
    timestamp: Date.now(),
    sourceId: sourceVehicle.id,
    targetId: Math.random() > 0.5 ? vehicles[Math.floor(Math.random() * vehicles.length)].id : undefined,
    description: getRandomThreatDescription(type),
    confidence: 0.7 + Math.random() * 0.3, // 70-100% confidence
    mitigated: false,
    evidence: {
      detectedBy: detectingRSU.id,
      signalStrength: Math.random(),
      anomalyScore: Math.random(),
    },
  };
};

const getRandomThreatDescription = (type: ThreatDetection['type']): string => {
  const descriptions = {
    gps_spoofing: [
      'Vehicle reporting coordinates outside physical road network',
      'GPS coordinates jumping beyond maximum vehicle acceleration',
      'Position data inconsistent with nearby vehicle reports',
    ],
    message_flooding: [
      'Beacon transmission rate exceeding protocol limits',
      'Duplicate message IDs from same source detected',
      'Network congestion caused by excessive messaging',
    ],
    replay_attack: [
      'Identical message signatures detected from different timestamps',
      'Previously seen beacon replayed after extended delay',
      'Message replay pattern consistent with attack scenario',
    ],
    position_falsification: [
      'Reported position conflicts with movement physics',
      'Vehicle claiming to be in multiple locations simultaneously',
      'Speed and direction changes violate kinematic constraints',
    ],
    dos_attack: [
      'Network resources overwhelmed by malicious traffic',
      'Communication channels saturated with invalid requests',
      'RSU processing capacity exceeded by attack vectors',
    ],
  };

  const typeDescriptions = descriptions[type];
  return typeDescriptions[Math.floor(Math.random() * typeDescriptions.length)];
};

export const useV2XSimulation = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>(() => generateVehicles(25));
  const [rsus, setRSUs] = useState<RSU[]>(() => generateRSUs(8));
  const [threats, setThreats] = useState<ThreatDetection[]>([]);
  const [isRunning, setIsRunning] = useState(true);

  // Update vehicle positions and status
  const updateVehicles = useCallback((currentVehicles: Vehicle[]): Vehicle[] => {
    return currentVehicles.map(vehicle => {
      // Random movement simulation
      const speedKmh = vehicle.speed + (Math.random() - 0.5) * 10;
      const heading = vehicle.heading + (Math.random() - 0.5) * 30;
      
      // Convert speed to lat/lng change (very rough approximation)
      const speedMs = speedKmh / 3.6; // km/h to m/s
      const distanceM = speedMs * (SIMULATION_INTERVAL / 1000);
      const latChange = (distanceM * Math.cos(heading * Math.PI / 180)) / 111111; // rough lat conversion
      const lngChange = (distanceM * Math.sin(heading * Math.PI / 180)) / (111111 * Math.cos(vehicle.position[0] * Math.PI / 180));

      let newLat = vehicle.position[0] + latChange;
      let newLng = vehicle.position[1] + lngChange;

      // Keep within NYC bounds
      newLat = Math.max(NYC_BOUNDS.south, Math.min(NYC_BOUNDS.north, newLat));
      newLng = Math.max(NYC_BOUNDS.west, Math.min(NYC_BOUNDS.east, newLng));

      // Occasionally change vehicle status
      let newStatus = vehicle.status;
      if (Math.random() > 0.98) {
        newStatus = Math.random() > 0.7 ? 'normal' : Math.random() > 0.5 ? 'suspicious' : 'compromised';
      }

      return {
        ...vehicle,
        position: [newLat, newLng],
        speed: Math.max(0, Math.min(120, speedKmh)),
        heading: ((heading % 360) + 360) % 360,
        status: newStatus,
        lastBeacon: Date.now(),
      };
    });
  }, []);

  // Update RSU connections and status
  const updateRSUs = useCallback((currentRSUs: RSU[], currentVehicles: Vehicle[]): RSU[] => {
    return currentRSUs.map(rsu => {
      // Find vehicles within range
      const connectedVehicles = currentVehicles.filter(vehicle => {
        const distance = getDistance(rsu.position, vehicle.position);
        return distance <= rsu.range;
      }).map(v => v.id);

      return {
        ...rsu,
        connectedVehicles,
        lastUpdate: Date.now(),
      };
    });
  }, []);

  // Calculate network metrics
  const calculateMetrics = useCallback((currentVehicles: Vehicle[], currentRSUs: RSU[], currentThreats: ThreatDetection[]): NetworkMetrics => {
    const compromisedNodes = currentVehicles.filter(v => v.status === 'compromised').length +
                           currentRSUs.filter(r => r.status === 'compromised').length;

    const threatsByType = currentThreats.reduce((acc, threat) => {
      acc[threat.type] = (acc[threat.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const networkHealth = Math.max(0, 100 - (compromisedNodes * 10) - (currentThreats.length * 2));

    return {
      totalVehicles: currentVehicles.length,
      activeRSUs: currentRSUs.filter(r => r.status === 'active').length,
      threatsDetected: currentThreats.length,
      threatsByType,
      networkHealth,
      messagesSent: currentVehicles.length * 60, // Assume 1 beacon per second per vehicle
      messagesReceived: Math.round(currentVehicles.length * 60 * 0.95), // 95% success rate
      averageLatency: 15 + Math.random() * 10, // 15-25ms
      compromisedNodes,
    };
  }, []);

  // Simulation loop
  useEffect(() => {
    if (!isRunning) return;

    const interval = setInterval(() => {
      setVehicles(currentVehicles => {
        const updatedVehicles = updateVehicles(currentVehicles);
        
        setRSUs(currentRSUs => {
          const updatedRSUs = updateRSUs(currentRSUs, updatedVehicles);
          
          // Generate new threat
          const newThreat = generateThreat(updatedVehicles, updatedRSUs);
          if (newThreat) {
            setThreats(currentThreats => {
              const updatedThreats = [newThreat, ...currentThreats].slice(0, 100); // Keep last 100 threats
              return updatedThreats;
            });
          }

          return updatedRSUs;
        });

        return updatedVehicles;
      });
    }, SIMULATION_INTERVAL);

    return () => clearInterval(interval);
  }, [isRunning, updateVehicles, updateRSUs]);

  const metrics = calculateMetrics(vehicles, rsus, threats);

  const dismissThreat = useCallback((threatId: string) => {
    setThreats(current => current.filter(t => t.id !== threatId));
  }, []);

  const mitigateThreat = useCallback((threatId: string) => {
    setThreats(current => 
      current.map(t => 
        t.id === threatId ? { ...t, mitigated: true } : t
      )
    );
  }, []);

  const toggleSimulation = useCallback(() => {
    setIsRunning(current => !current);
  }, []);

  const resetSimulation = useCallback(() => {
    setVehicles(generateVehicles(25));
    setRSUs(generateRSUs(8));
    setThreats([]);
  }, []);

  return {
    vehicles,
    rsus,
    threats,
    metrics,
    isRunning,
    dismissThreat,
    mitigateThreat,
    toggleSimulation,
    resetSimulation,
  };
};

// Helper function to calculate distance between two points
function getDistance(pos1: [number, number], pos2: [number, number]): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = pos1[0] * Math.PI / 180;
  const φ2 = pos2[0] * Math.PI / 180;
  const Δφ = (pos2[0] - pos1[0]) * Math.PI / 180;
  const Δλ = (pos2[1] - pos1[1]) * Math.PI / 180;

  const a = Math.sin(Δφ/2) * Math.sin(Δφ/2) +
            Math.cos(φ1) * Math.cos(φ2) *
            Math.sin(Δλ/2) * Math.sin(Δλ/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));

  return R * c;
}
