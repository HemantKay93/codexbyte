import { Card } from '@byteevolvr/ui';
import { Mail, Zap, Users, LayoutTemplate } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export function MarketingDashboard() {
  const navigate = useNavigate();

  const metrics = [
    { title: 'Total Campaigns', value: '24', trend: '+12%', icon: Mail },
    { title: 'Active Automations', value: '5', trend: '+2%', icon: Zap },
    { title: 'Total Audience', value: '12,450', trend: '+1.4%', icon: Users },
  ];

  return (
    <div className="space-y-6 max-w-7xl">
      <div>
        <h1 className="text-display-sm font-semibold text-on-background">
          Marketing CRM Dashboard
        </h1>
        <p className="text-body-sm text-on-surface-variant mt-1">
          Orchestrate campaigns, segments, and automations
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {metrics.map((metric, i) => (
          <Card key={i}>
            <div className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-body-sm font-medium text-on-surface-variant">{metric.title}</p>
                  <p className="text-display-sm font-bold text-on-background mt-1">
                    {metric.value}
                  </p>
                </div>
                <div className="rounded-full bg-primary/10 p-3">
                  <metric.icon className="h-5 w-5 text-primary" />
                </div>
              </div>
              <p className="text-label-sm text-green-600 mt-4">{metric.trend} from last month</p>
            </div>
          </Card>
        ))}
      </div>

      <h2 className="text-title-lg font-semibold text-on-background mt-8">Quick Actions</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="cursor-pointer" onClick={() => navigate('/marketing/campaigns')}>
          <Card className="hover:border-primary transition-colors">
            <div className="p-6 text-center">
              <div className="mx-auto rounded-full bg-blue-50 p-4 w-16 h-16 flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold text-on-background">Email & SMS Campaigns</h3>
              <p className="text-body-sm text-on-surface-variant mt-1">
                Send bulk promotional emails
              </p>
            </div>
          </Card>
        </div>

        <div className="cursor-pointer" onClick={() => navigate('/marketing/segments')}>
          <Card className="hover:border-primary transition-colors">
            <div className="p-6 text-center">
              <div className="mx-auto rounded-full bg-purple-50 p-4 w-16 h-16 flex items-center justify-center mb-4">
                <Users className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold text-on-background">Audience Segments</h3>
              <p className="text-body-sm text-on-surface-variant mt-1">Filter and target users</p>
            </div>
          </Card>
        </div>

        <div className="cursor-pointer" onClick={() => navigate('/marketing/automations')}>
          <Card className="hover:border-primary transition-colors">
            <div className="p-6 text-center">
              <div className="mx-auto rounded-full bg-amber-50 p-4 w-16 h-16 flex items-center justify-center mb-4">
                <Zap className="h-8 w-8 text-amber-600" />
              </div>
              <h3 className="font-semibold text-on-background">Automation Flows</h3>
              <p className="text-body-sm text-on-surface-variant mt-1">Event-triggered journeys</p>
            </div>
          </Card>
        </div>

        <div className="cursor-pointer" onClick={() => navigate('/marketing/templates')}>
          <Card className="hover:border-primary transition-colors">
            <div className="p-6 text-center">
              <div className="mx-auto rounded-full bg-teal-50 p-4 w-16 h-16 flex items-center justify-center mb-4">
                <LayoutTemplate className="h-8 w-8 text-teal-600" />
              </div>
              <h3 className="font-semibold text-on-background">Template Manager</h3>
              <p className="text-body-sm text-on-surface-variant mt-1">Reusable design blocks</p>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
