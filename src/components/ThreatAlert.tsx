import React from 'react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ThreatDetection } from '@/types/v2x';
import { AlertTriangle, Shield, X } from 'lucide-react';

interface ThreatAlertProps {
  threat: ThreatDetection;
  onDismiss?: (threatId: string) => void;
  onMitigate?: (threatId: string) => void;
}

const getThreatIcon = (type: ThreatDetection['type']) => {
  switch (type) {
    case 'gps_spoofing':
      return '📍';
    case 'message_flooding':
      return '🌊';
    case 'replay_attack':
      return '🔄';
    case 'position_falsification':
      return '🎯';
    case 'dos_attack':
      return '🚫';
    default:
      return '⚠️';
  }
};

const getThreatDescription = (type: ThreatDetection['type']) => {
  switch (type) {
    case 'gps_spoofing':
      return 'Vehicle reporting impossible GPS coordinates';
    case 'message_flooding':
      return 'Excessive beacon messages detected from source';
    case 'replay_attack':
      return 'Duplicate message signatures detected';
    case 'position_falsification':
      return 'Vehicle position does not match movement patterns';
    case 'dos_attack':
      return 'Network resources being overwhelmed';
    default:
      return 'Unknown threat detected';
  }
};

const ThreatAlert: React.FC<ThreatAlertProps> = ({ threat, onDismiss, onMitigate }) => {
  const severityVariant = threat.severity === 'high' 
    ? 'destructive' 
    : threat.severity === 'medium' 
      ? 'default' 
      : 'secondary';

  return (
    <Alert 
      className={`relative border-l-4 transition-all duration-300 ${
        threat.severity === 'high' 
          ? 'border-l-v2x-threat-high bg-destructive/10 animate-threat-flash' 
          : threat.severity === 'medium'
            ? 'border-l-v2x-threat-medium bg-warning/10'
            : 'border-l-v2x-threat-low bg-success/10'
      }`}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-start space-x-3">
          <div className="text-2xl">{getThreatIcon(threat.type)}</div>
          <div className="flex-1">
            <AlertTitle className="flex items-center space-x-2">
              <span>Threat Detected: {threat.type.replace('_', ' ').toUpperCase()}</span>
              <Badge variant={severityVariant}>{threat.severity}</Badge>
              <Badge variant="outline">
                {Math.round(threat.confidence * 100)}% confidence
              </Badge>
            </AlertTitle>
            <AlertDescription className="mt-2 space-y-2">
              <div>{getThreatDescription(threat.type)}</div>
              <div className="text-sm space-y-1">
                <div><strong>Source:</strong> {threat.sourceId}</div>
                {threat.targetId && <div><strong>Target:</strong> {threat.targetId}</div>}
                <div><strong>Time:</strong> {new Date(threat.timestamp).toLocaleTimeString()}</div>
                <div><strong>Description:</strong> {threat.description}</div>
              </div>
            </AlertDescription>
          </div>
        </div>
        
        <div className="flex items-center space-x-2">
          {!threat.mitigated && onMitigate && (
            <Button
              size="sm"
              variant="outline"
              onClick={() => onMitigate(threat.id)}
              className="text-xs"
            >
              <Shield className="w-3 h-3 mr-1" />
              Mitigate
            </Button>
          )}
          {onDismiss && (
            <Button
              size="sm"
              variant="ghost"
              onClick={() => onDismiss(threat.id)}
              className="text-xs"
            >
              <X className="w-3 h-3" />
            </Button>
          )}
        </div>
      </div>
      
      {threat.mitigated && (
        <div className="mt-2 flex items-center space-x-1 text-sm text-success">
          <Shield className="w-4 h-4" />
          <span>Threat mitigated and countermeasures deployed</span>
        </div>
      )}
    </Alert>
  );
};

export default ThreatAlert;