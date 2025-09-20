import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { NetworkMetrics as NetworkMetricsType } from '@/types/v2x';
import { 
  Activity, 
  Shield, 
  AlertTriangle, 
  Wifi, 
  Users, 
  Radio,
  Clock,
  TrendingUp 
} from 'lucide-react';

interface NetworkMetricsProps {
  metrics: NetworkMetricsType;
  className?: string;
}

const NetworkMetrics: React.FC<NetworkMetricsProps> = ({ metrics, className }) => {
  const healthColor = metrics.networkHealth >= 80 
    ? 'text-success' 
    : metrics.networkHealth >= 60 
      ? 'text-warning' 
      : 'text-destructive';

  const healthVariant = metrics.networkHealth >= 80 
    ? 'default' 
    : metrics.networkHealth >= 60 
      ? 'secondary' 
      : 'destructive';

  return (
    <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 ${className}`}>
      {/* Network Health */}
      <Card className="bg-gradient-cyber border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Network Health</CardTitle>
          <Activity className={`h-4 w-4 ${healthColor}`} />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.networkHealth}%</div>
          <Progress value={metrics.networkHealth} className="mt-2" />
          <p className="text-xs text-muted-foreground mt-2">
            {metrics.compromisedNodes > 0 
              ? `${metrics.compromisedNodes} nodes compromised` 
              : 'All nodes secure'}
          </p>
        </CardContent>
      </Card>

      {/* Active Vehicles */}
      <Card className="bg-gradient-cyber border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Active Vehicles</CardTitle>
          <Users className="h-4 w-4 text-v2x-vehicle" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.totalVehicles}</div>
          <div className="flex items-center space-x-2 mt-2">
            <Badge variant="outline" className="text-xs">
              <Wifi className="w-3 h-3 mr-1" />
              {metrics.activeRSUs} RSUs
            </Badge>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Connected to network
          </p>
        </CardContent>
      </Card>

      {/* Threats Detected */}
      <Card className="bg-gradient-cyber border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Threats Detected</CardTitle>
          <AlertTriangle className="h-4 w-4 text-v2x-threat-high" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold">{metrics.threatsDetected}</div>
          <div className="flex flex-wrap gap-1 mt-2">
            {Object.entries(metrics.threatsByType).map(([type, count]) => (
              <Badge key={type} variant="destructive" className="text-xs">
                {type}: {count}
              </Badge>
            ))}
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Real-time monitoring
          </p>
        </CardContent>
      </Card>

      {/* Network Performance */}
      <Card className="bg-gradient-cyber border-border/50">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Network Performance</CardTitle>
          <TrendingUp className="h-4 w-4 text-primary" />
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Latency:</span>
              <span className="font-mono">{metrics.averageLatency}ms</span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Messages/s:</span>
              <span className="font-mono">
                {Math.round(metrics.messagesSent / 60)}
              </span>
            </div>
            <div className="flex justify-between text-sm">
              <span>Success Rate:</span>
              <span className="font-mono">
                {Math.round((metrics.messagesReceived / metrics.messagesSent) * 100)}%
              </span>
            </div>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            <Clock className="w-3 h-3 inline mr-1" />
            Last updated: {new Date().toLocaleTimeString()}
          </p>
        </CardContent>
      </Card>
    </div>
  );
};

export default NetworkMetrics;