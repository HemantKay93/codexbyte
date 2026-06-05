import { Card, Button, Input } from '@byteevolvr/ui';
import {
  Save,
  Send,
  Eye,
  Image as ImageIcon,
  AlignLeft,
  Type,
  Link as LinkIcon,
  SplitSquareHorizontal,
} from 'lucide-react';

export function CampaignBuilderPage() {
  return (
    <div className="space-y-6 max-w-6xl mx-auto h-[calc(100vh-100px)] flex flex-col">
      <div className="flex items-center justify-between shrink-0">
        <div>
          <h1 className="text-display-sm font-semibold text-on-background">Campaign Builder</h1>
          <p className="text-body-sm text-on-surface-variant mt-1">
            Design and configure your email/SMS marketing campaign
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2">
            <Save className="h-4 w-4" />
            Save Draft
          </Button>
          <Button variant="outline" className="gap-2">
            <Eye className="h-4 w-4" />
            Preview & Test
          </Button>
          <Button className="gap-2">
            <Send className="h-4 w-4" />
            Schedule/Send
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 flex-1 min-h-0">
        {/* Left Toolbar - Settings */}
        <div className="lg:col-span-1 flex flex-col gap-4 overflow-y-auto pr-2 pb-4">
          <Card className="p-4 space-y-4">
            <h3 className="font-semibold text-on-surface text-sm">Campaign Setup</h3>
            <div>
              <label className="block text-xs font-medium text-on-surface mb-1">
                Campaign Name
              </label>
              <Input defaultValue="Holiday Sale 2023" />
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface mb-1">
                Target Audience
              </label>
              <select
                className="w-full rounded-md border border-outline-variant bg-surface-container-lowest p-2 text-sm"
                defaultValue="vip"
              >
                <option value="all">All Subscribers</option>
                <option value="vip">VIP Customers</option>
                <option value="churn">Churn Risk</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-on-surface mb-1">Channel</label>
              <select
                className="w-full rounded-md border border-outline-variant bg-surface-container-lowest p-2 text-sm"
                defaultValue="email"
              >
                <option value="email">Email</option>
                <option value="sms">SMS</option>
              </select>
            </div>
          </Card>

          <Card className="p-4 space-y-4 flex-1">
            <h3 className="font-semibold text-on-surface text-sm">Blocks</h3>
            <div className="grid grid-cols-2 gap-2">
              <button className="flex flex-col items-center justify-center p-3 border border-outline-variant rounded-lg bg-surface-container-lowest hover:border-primary hover:bg-primary/5 transition-colors text-on-surface-variant">
                <Type className="h-5 w-5 mb-1" />
                <span className="text-[10px] font-medium">Text</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 border border-outline-variant rounded-lg bg-surface-container-lowest hover:border-primary hover:bg-primary/5 transition-colors text-on-surface-variant">
                <ImageIcon className="h-5 w-5 mb-1" />
                <span className="text-[10px] font-medium">Image</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 border border-outline-variant rounded-lg bg-surface-container-lowest hover:border-primary hover:bg-primary/5 transition-colors text-on-surface-variant">
                <LinkIcon className="h-5 w-5 mb-1" />
                <span className="text-[10px] font-medium">Button</span>
              </button>
              <button className="flex flex-col items-center justify-center p-3 border border-outline-variant rounded-lg bg-surface-container-lowest hover:border-primary hover:bg-primary/5 transition-colors text-on-surface-variant">
                <SplitSquareHorizontal className="h-5 w-5 mb-1" />
                <span className="text-[10px] font-medium">Divider</span>
              </button>
            </div>
          </Card>
        </div>

        {/* Center - Canvas */}
        <div className="lg:col-span-3 flex flex-col bg-surface-container-lowest border border-outline-variant rounded-xl overflow-hidden">
          {/* Email Subject Header */}
          <div className="p-4 border-b border-outline-variant bg-surface flex flex-col gap-3">
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-on-surface w-20">Subject:</label>
              <Input className="flex-1" defaultValue="Exclusive 20% off for our VIPs! 🎁" />
            </div>
            <div className="flex items-center gap-3">
              <label className="text-sm font-medium text-on-surface w-20">Preview:</label>
              <Input
                className="flex-1 text-on-surface-variant"
                defaultValue="Don't miss out on these holiday savings inside..."
              />
            </div>
          </div>

          {/* Email Body Canvas */}
          <div className="flex-1 overflow-y-auto bg-surface-container/30 p-8 flex justify-center">
            {/* The Email Template */}
            <div className="w-full max-w-[600px] bg-white border border-outline-variant shadow-sm rounded-md overflow-hidden min-h-[500px] flex flex-col">
              {/* Header Image Placeholder */}
              <div className="h-48 bg-primary/10 flex items-center justify-center group cursor-pointer relative">
                <div className="absolute inset-0 bg-black/5 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Button variant="secondary" size="sm" className="gap-2">
                    <ImageIcon className="h-4 w-4" /> Replace Image
                  </Button>
                </div>
                <ImageIcon className="h-12 w-12 text-primary/40" />
              </div>

              {/* Text Block */}
              <div className="p-8 text-center border-b border-dashed border-outline-variant hover:bg-primary/5 cursor-text group relative">
                <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                  <button className="p-1 bg-surface shadow-sm rounded text-on-surface">
                    <AlignLeft className="h-3 w-3" />
                  </button>
                </div>
                <h1 className="text-2xl font-bold text-gray-900 mb-4">Holiday VIP Early Access</h1>
                <p className="text-gray-600 leading-relaxed mb-6">
                  Because you're one of our most valued customers, we're giving you 24 hours of
                  early access to our biggest sale of the year. Use your exclusive code below.
                </p>

                {/* Button Block */}
                <div className="inline-block px-6 py-3 bg-black text-white font-bold rounded-lg cursor-pointer hover:bg-gray-800">
                  SHOP EARLY ACCESS
                </div>
              </div>

              {/* Footer Block */}
              <div className="p-6 text-center text-xs text-gray-400 bg-gray-50 mt-auto">
                <p>ByteEvolvr Inc. • 123 Tech Lane, San Francisco, CA</p>
                <p className="mt-2 hover:underline cursor-pointer">Unsubscribe</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
