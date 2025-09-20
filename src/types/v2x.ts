export interface Vehicle {
  id: string;
  position: [number, number]; // [lat, lng]
  speed: number;
  heading: number;
  status: 'normal' | 'compromised' | 'suspicious';
  lastBeacon: number;
  communicationRange: number;
  threatLevel: 'low' | 'medium' | 'high';
  connectedRSUs: string[];
}

export interface RSU {
  id: string;
  position: [number, number]; // [lat, lng]
  range: number;
  status: 'active' | 'compromised' | 'offline';
  connectedVehicles: string[];
  detectionCapabilities: string[];
  lastUpdate: number;
  threatDetections: ThreatDetection[];
}

export interface ThreatDetection {
  id: string;
  type: 'gps_spoofing' | 'message_flooding' | 'replay_attack' | 'position_falsification' | 'dos_attack';
  severity: 'low' | 'medium' | 'high';
  timestamp: number;
  sourceId: string;
  targetId?: string;
  description: string;
  confidence: number;
  mitigated: boolean;
  evidence: any;
}

export interface CommunicationLink {
  id: string;
  type: 'V2V' | 'V2I' | 'V2RSU' | 'V2Edge';
  source: string;
  target: string;
  signalStrength: number;
  latency: number;
  status: 'active' | 'compromised' | 'weak';
  messageCount: number;
  lastActivity: number;
}

export interface BeaconMessage {
  id: string;
  senderId: string;
  timestamp: number;
  position: [number, number];
  speed: number;
  heading: number;
  messageType: 'safety' | 'traffic' | 'emergency' | 'heartbeat';
  payload: any;
  signature?: string;
  integrity: boolean;
}

export interface NetworkMetrics {
  totalVehicles: number;
  activeRSUs: number;
  threatsDetected: number;
  threatsByType: Record<string, number>;
  networkHealth: number;
  messagesSent: number;
  messagesReceived: number;
  averageLatency: number;
  compromisedNodes: number;
}