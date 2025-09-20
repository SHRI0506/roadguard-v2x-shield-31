import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from 'recharts';
import { ThreatDetection } from '@/types/v2x';

interface ThreatAnalyticsProps {
  threats: ThreatDetection[];
  className?: string;
}

const THREAT_COLORS = {
  gps_spoofing: '#ef4444',
  message_flooding: '#f59e0b',
  replay_attack: '#8b5cf6',
  position_falsification: '#10b981',
  dos_attack: '#f97316',
};

const ThreatAnalytics: React.FC<ThreatAnalyticsProps> = ({ threats, className }) => {
  // Prepare data for charts
  const now = Date.now();
  const hourlyData = Array.from({ length: 24 }, (_, i) => {
    const hour = now - (23 - i) * 60 * 60 * 1000;
    const threatsInHour = threats.filter(
      t => t.timestamp >= hour && t.timestamp < hour + 60 * 60 * 1000
    );
    
    return {
      time: new Date(hour).getHours() + ':00',
      threats: threatsInHour.length,
      high: threatsInHour.filter(t => t.severity === 'high').length,
      medium: threatsInHour.filter(t => t.severity === 'medium').length,
      low: threatsInHour.filter(t => t.severity === 'low').length,
    };
  });

  const threatTypeData = Object.entries(
    threats.reduce((acc, threat) => {
      acc[threat.type] = (acc[threat.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>)
  ).map(([type, count]) => ({
    type: type.replace('_', ' ').toUpperCase(),
    count,
    fill: THREAT_COLORS[type as keyof typeof THREAT_COLORS] || '#6b7280',
  }));

  const severityData = [
    { name: 'High', value: threats.filter(t => t.severity === 'high').length, fill: '#ef4444' },
    { name: 'Medium', value: threats.filter(t => t.severity === 'medium').length, fill: '#f59e0b' },
    { name: 'Low', value: threats.filter(t => t.severity === 'low').length, fill: '#10b981' },
  ];

  const confidenceData = Array.from({ length: 10 }, (_, i) => {
    const min = i * 0.1;
    const max = (i + 1) * 0.1;
    return {
      range: `${Math.round(min * 100)}-${Math.round(max * 100)}%`,
      count: threats.filter(t => t.confidence >= min && t.confidence < max).length,
    };
  });

  return (
    <div className={`grid grid-cols-1 lg:grid-cols-2 gap-6 ${className}`}>
      {/* Threat Timeline */}
      <Card className="bg-gradient-cyber border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Threat Detection Timeline</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={hourlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="time" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Line 
                type="monotone" 
                dataKey="threats" 
                stroke="#10b981" 
                strokeWidth={2}
                dot={{ fill: '#10b981', strokeWidth: 2 }}
              />
              <Line 
                type="monotone" 
                dataKey="high" 
                stroke="#ef4444" 
                strokeWidth={2}
                dot={{ fill: '#ef4444', strokeWidth: 2 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Threat Types Distribution */}
      <Card className="bg-gradient-cyber border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Threat Types Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={threatTypeData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis 
                dataKey="type" 
                stroke="#9ca3af" 
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Severity Distribution */}
      <Card className="bg-gradient-cyber border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Threat Severity Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={severityData}
                cx="50%"
                cy="50%"
                outerRadius={80}
                dataKey="value"
                label={({ name, value }) => `${name}: ${value}`}
              >
                {severityData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.fill} />
                ))}
              </Pie>
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Detection Confidence */}
      <Card className="bg-gradient-cyber border-border/50">
        <CardHeader>
          <CardTitle className="text-lg">Detection Confidence Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={confidenceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
              <XAxis dataKey="range" stroke="#9ca3af" />
              <YAxis stroke="#9ca3af" />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#1f2937', 
                  border: '1px solid #374151',
                  borderRadius: '8px'
                }}
              />
              <Bar dataKey="count" fill="#8b5cf6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  );
};

export default ThreatAnalytics;