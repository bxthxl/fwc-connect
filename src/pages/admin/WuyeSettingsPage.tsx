import React from 'react';
import { DashboardLayout } from '@/components/layout/DashboardLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { MapPin, Construction } from 'lucide-react';

export default function WuyeSettingsPage() {
  return (
    <DashboardLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="space-y-1">
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MapPin className="h-8 w-8 text-primary" />
            Wuye Settings
          </h1>
          <p className="text-muted-foreground">Branch-specific features and configuration</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Construction className="h-5 w-5 text-[hsl(var(--accent))]" />
              Coming Soon
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-muted-foreground">
              Branch-specific features for Wuye are being developed. This section will include:
            </p>
            <ul className="list-disc pl-6 space-y-2 text-sm text-muted-foreground">
              <li>Branch-specific attendance tracking</li>
              <li>Branch member management</li>
              <li>Branch-specific reports and analytics</li>
              <li>Multi-branch coordination tools</li>
            </ul>
            <p className="text-sm text-muted-foreground">
              The platform architecture is designed to support multiple branches when ready.
            </p>
          </CardContent>
        </Card>
      </div>
    </DashboardLayout>
  );
}
