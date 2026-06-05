import { Card, Button } from '@byteevolvr/ui';
import { Globe, Plus, Trash2 } from 'lucide-react';

export function ShippingZonesPage() {
  return (
    <div className="space-y-6 max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">
            Shipping Zones & Rates
          </h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Configure geographic zones and the shipping methods available for each
          </p>
        </div>
        <div className="flex gap-2">
          <Button className="gap-2">
            <Plus className="h-4 w-4" />
            Create Zone
          </Button>
        </div>
      </div>

      <div className="space-y-6">
        <Card className="p-0 overflow-hidden">
          <div className="bg-surface-container-low p-4 border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-primary" />
              <div>
                <h3 className="font-semibold text-on-surface">Domestic (US)</h3>
                <p className="text-xs text-on-surface-variant">United States (50 States)</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Edit Zone
              </Button>
            </div>
          </div>

          <div className="p-4 bg-surface-container-lowest border-b border-outline-variant">
            <h4 className="text-sm font-semibold text-on-surface mb-3 flex items-center justify-between">
              Rates
              <Button variant="ghost" size="sm" className="h-7 text-primary gap-1">
                <Plus className="h-3 w-3" /> Add Rate
              </Button>
            </h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 border border-outline-variant rounded-lg">
                <div>
                  <div className="font-medium text-sm text-on-surface">Standard Shipping</div>
                  <div className="text-xs text-on-surface-variant">
                    3-5 Business Days • Condition: 0kg - 5kg
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-semibold text-on-surface">$5.00</div>
                  <button className="text-on-surface-variant hover:text-error transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border border-outline-variant rounded-lg">
                <div>
                  <div className="font-medium text-sm text-on-surface">Free Standard Shipping</div>
                  <div className="text-xs text-on-surface-variant">
                    3-5 Business Days • Condition: Orders $50.00 and up
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-semibold text-success">Free</div>
                  <button className="text-on-surface-variant hover:text-error transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
              <div className="flex items-center justify-between p-3 border border-outline-variant rounded-lg">
                <div>
                  <div className="font-medium text-sm text-on-surface">Expedited Shipping</div>
                  <div className="text-xs text-on-surface-variant">1-2 Business Days</div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="font-semibold text-on-surface">$15.00</div>
                  <button className="text-on-surface-variant hover:text-error transition-colors">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        <Card className="p-0 overflow-hidden">
          <div className="bg-surface-container-low p-4 border-b border-outline-variant flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Globe className="h-5 w-5 text-on-surface-variant" />
              <div>
                <h3 className="font-semibold text-on-surface">Rest of World</h3>
                <p className="text-xs text-on-surface-variant">All other countries and regions</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                Edit Zone
              </Button>
            </div>
          </div>

          <div className="p-4 bg-surface-container-lowest">
            <div className="flex items-center justify-between p-3 border border-outline-variant rounded-lg bg-surface-container/30">
              <div className="text-sm text-on-surface-variant">
                No rates configured. Customers in these regions cannot check out.
              </div>
              <Button variant="outline" size="sm">
                Add Rate
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
