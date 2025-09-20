import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import V2XMap from '@/components/V2XMap';
import ThreatAlert from '@/components/ThreatAlert';
import NetworkMetrics from '@/components/NetworkMetrics';
import ThreatAnalytics from '@/components/ThreatAnalytics';
import { useV2XSimulation } from '@/hooks/useV2XSimulation';
import { 
  Play, 
  Pause, 
  RotateCcw, 
  Shield, 
  Activity, 
  AlertTriangle,
  Radio,
  Eye,
  Brain
} from 'lucide-react';

const Index = () => {
  const {
    vehicles,
    rsus,
    threats,
    metrics,
    isRunning,
    dismissThreat,
    mitigateThreat,
    toggleSimulation,
    resetSimulation,
  } = useV2XSimulation();

  const [activeTab, setActiveTab] = useState<'overview' | 'analytics'>('overview');
  
  const recentThreats = threats.slice(0, 5);
  const activeThreatCount = threats.filter(t => !t.mitigated).length;

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="border-b border-border/50 bg-gradient-cyber">
        <div className="container mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="flex items-center space-x-2">
                <Shield className="w-8 h-8 text-primary" />
                <div>
                  <h1 className="text-2xl font-bold bg-gradient-primary bg-clip-text text-transparent">
                    V2X Intrusion Detection System
                  </h1>
                  <p className="text-sm text-muted-foreground">
                    Real-time Vehicle-to-Everything Security Monitoring
                  </p>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-4">
              <Badge variant={isRunning ? 'default' : 'secondary'} className="animate-pulse-glow">
                <Activity className="w-3 h-3 mr-1" />
                {isRunning ? 'Live' : 'Paused'}
              </Badge>
              
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={toggleSimulation}
                  className="border-primary/20"
                >
                  {isRunning ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetSimulation}
                  className="border-primary/20"
                >
                  <RotateCcw className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-6">
        {/* Navigation Tabs */}
        <div className="flex space-x-4 mb-6">
          <Button
            variant={activeTab === 'overview' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('overview')}
            className="flex items-center space-x-2"
          >
            <Eye className="w-4 h-4" />
            <span>Overview</span>
          </Button>
          <Button
            variant={activeTab === 'analytics' ? 'default' : 'ghost'}
            onClick={() => setActiveTab('analytics')}
            className="flex items-center space-x-2"
          >
            <Brain className="w-4 h-4" />
            <span>Analytics</span>
          </Button>
        </div>

        {/* Network Metrics */}
        <NetworkMetrics metrics={metrics} className="mb-6" />

        {activeTab === 'overview' ? (
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
            {/* Map View */}
            <div className="xl:col-span-3">
              <Card className="bg-gradient-cyber border-border/50">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center space-x-2">
                      <Radio className="w-5 h-5 text-primary" />
                      <span>V2X Network Map</span>
                    </CardTitle>
                    <div className="flex items-center space-x-4 text-sm">
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-full bg-v2x-vehicle"></div>
                        <span>Vehicles ({vehicles.length})</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 rounded-lg bg-v2x-rsu"></div>
                        <span>RSUs ({rsus.length})</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="p-0">
                  <V2XMap 
                    vehicles={vehicles}
                    rsus={rsus}
                    threats={threats}
                    className="h-[600px]"
                  />
                </CardContent>
              </Card>
            </div>

            {/* Threat Panel */}
            <div className="xl:col-span-1">
              <Card className="bg-gradient-cyber border-border/50 h-[662px]">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <AlertTriangle className="w-5 h-5 text-destructive" />
                      <span>Active Threats</span>
                    </div>
                    <Badge 
                      variant={activeThreatCount > 0 ? 'destructive' : 'default'}
                      className={activeThreatCount > 0 ? 'animate-threat-flash' : ''}
                    >
                      {activeThreatCount}
                    </Badge>
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-0">
                  <ScrollArea className="h-[570px] px-6">
                    <div className="space-y-4">
                      {recentThreats.length > 0 ? (
                        recentThreats.map((threat) => (
                          <div key={threat.id}>
                            <ThreatAlert
                              threat={threat}
                              onDismiss={dismissThreat}
                              onMitigate={mitigateThreat}
                            />
                            <Separator className="my-4" />
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8 text-muted-foreground">
                          <Shield className="w-12 h-12 mx-auto mb-2" />
                          <p>No active threats detected</p>
                          <p className="text-sm">Network is secure</p>
                        </div>
                      )}
                    </div>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>
          </div>
        ) : (
          <ThreatAnalytics threats={threats} />
        )}
      </main>
    </div>
  );
};

export default Index;
