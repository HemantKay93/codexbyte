import { useState, useEffect } from 'react';
import {
  Card,
  Button,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@byteevolvr/ui';
import { Download, Calendar, BarChart3, TrendingUp, Loader2 } from 'lucide-react';
import { CRMService } from '@byteevolvr/api-client';

export function SalesForecastingPage() {
  const [loading, setLoading] = useState(true);
  const [forecasts, setForecasts] = useState<any[]>([]);

  const fetchForecasts = async () => {
    try {
      const res = await CRMService.getSalesForecasts();
      if (res?.data && res.data.length > 0) {
        setForecasts(res.data);
      } else {
        // Fallback mock data
        setForecasts([
          {
            period: 'Q4 2023',
            rep: 'Jim Halpert',
            quota: 500000,
            committed: 450000,
            bestCase: 650000,
            pipeline: 1200000,
          },
          {
            period: 'Q4 2023',
            rep: 'Dwight Schrute',
            quota: 600000,
            committed: 750000,
            bestCase: 850000,
            pipeline: 900000,
          },
          {
            period: 'Q4 2023',
            rep: 'Stanley Hudson',
            quota: 300000,
            committed: 250000,
            bestCase: 300000,
            pipeline: 450000,
          },
          {
            period: 'Q4 2023',
            rep: 'Phyllis Vance',
            quota: 350000,
            committed: 350000,
            bestCase: 400000,
            pipeline: 600000,
          },
        ]);
      }
    } catch (error) {
      console.error('Failed to load forecasts', error);
      // Fallback
      setForecasts([
        {
          period: 'Q4 2023',
          rep: 'Jim Halpert',
          quota: 500000,
          committed: 450000,
          bestCase: 650000,
          pipeline: 1200000,
        },
        {
          period: 'Q4 2023',
          rep: 'Dwight Schrute',
          quota: 600000,
          committed: 750000,
          bestCase: 850000,
          pipeline: 900000,
        },
        {
          period: 'Q4 2023',
          rep: 'Stanley Hudson',
          quota: 300000,
          committed: 250000,
          bestCase: 300000,
          pipeline: 450000,
        },
        {
          period: 'Q4 2023',
          rep: 'Phyllis Vance',
          quota: 350000,
          committed: 350000,
          bestCase: 400000,
          pipeline: 600000,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchForecasts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const totalQuota = forecasts.reduce((sum, f) => sum + f.quota, 0);
  const totalCommitted = forecasts.reduce((sum, f) => sum + f.committed, 0);
  const totalBestCase = forecasts.reduce((sum, f) => sum + f.bestCase, 0);
  const percentToQuota = totalQuota > 0 ? (totalCommitted / totalQuota) * 100 : 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Sales Forecasting</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Predict revenue and track quota attainment
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Calendar className="h-4 w-4" />
            Q4 2023
          </Button>
          <Button variant="outline" className="gap-2">
            <Download className="h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="flex justify-center items-center h-64">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
            <Card className="p-6">
              <p className="text-sm text-on-surface-variant mb-1">Total Quota (Q4)</p>
              <h3 className="text-2xl font-bold text-on-surface">₹{totalQuota.toLocaleString()}</h3>
            </Card>
            <Card className="p-6 border-l-4 border-l-primary">
              <p className="text-sm text-on-surface-variant mb-1">Total Committed</p>
              <h3 className="text-2xl font-bold text-primary">
                ₹{totalCommitted.toLocaleString()}
              </h3>
            </Card>
            <Card className="p-6">
              <p className="text-sm text-on-surface-variant mb-1">Quota Attainment</p>
              <div className="flex items-center gap-2 mt-1">
                <div className="flex-1 bg-surface-container-high h-2 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${percentToQuota >= 100 ? 'bg-success' : 'bg-primary'}`}
                    style={{ width: `${Math.min(percentToQuota, 100)}%` }}
                  ></div>
                </div>
                <span className="text-sm font-bold text-on-surface">
                  {percentToQuota.toFixed(1)}%
                </span>
              </div>
            </Card>
            <Card className="p-6 flex items-center justify-between">
              <div>
                <p className="text-sm text-on-surface-variant mb-1">Projected Best Case</p>
                <h3 className="text-2xl font-bold text-success">
                  ₹{totalBestCase.toLocaleString()}
                </h3>
              </div>
              <div className="h-10 w-10 rounded-full bg-success/10 flex items-center justify-center text-success">
                <TrendingUp className="h-5 w-5" />
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="bg-surface-container-low p-4 border-b border-outline-variant flex items-center gap-2 text-on-surface">
              <BarChart3 className="h-5 w-5 text-primary" />
              <span className="font-semibold">Team Forecast Rollup</span>
            </div>

            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Sales Rep</TableHead>
                  <TableHead className="text-right">Quota</TableHead>
                  <TableHead className="text-right">Committed</TableHead>
                  <TableHead className="text-right">Best Case</TableHead>
                  <TableHead className="text-right">Open Pipeline</TableHead>
                  <TableHead className="w-32 text-center">% to Quota</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {forecasts.map((f, i) => {
                  const attainment = f.quota > 0 ? (f.committed / f.quota) * 100 : 0;
                  return (
                    <TableRow key={i}>
                      <TableCell className="font-medium text-on-surface">{f.rep}</TableCell>
                      <TableCell className="text-right text-on-surface-variant">
                        ₹{f.quota.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right font-medium text-primary">
                        ₹{f.committed.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-success">
                        ₹{f.bestCase.toLocaleString()}
                      </TableCell>
                      <TableCell className="text-right text-on-surface-variant">
                        ₹{f.pipeline.toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2 justify-end">
                          <span
                            className={`text-sm font-bold ${attainment >= 100 ? 'text-success' : 'text-on-surface'}`}
                          >
                            {attainment.toFixed(0)}%
                          </span>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          </Card>
        </>
      )}
    </div>
  );
}
