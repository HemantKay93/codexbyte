import { Button, Badge } from '@byteevolvr/ui';
import { ArrowLeft, Save, Smartphone, Monitor, Loader2 } from 'lucide-react';

import { useCMSBuilder } from './cms-components/useCMSBuilder';
import { CMSBuilderSidebar } from './cms-components/CMSBuilderSidebar';
import { CMSBuilderCanvas } from './cms-components/CMSBuilderCanvas';
import { CMSBuilderProperties } from './cms-components/CMSBuilderProperties';

export function CMSBuilderPage() {
  const {
    device,
    setDevice,
    loading,
    saving,
    selectedPage,
    setSelectedPage,
    selectedSection,
    setSelectedSection,
    cmsData,
    updateContent,
    handleSave,
    currentPage,
  } = useCMSBuilder();

  if (loading && !saving) {
    return (
      <div className="h-full flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="h-[calc(100vh-6rem)] flex flex-col -m-6">
      {/* CMS Toolbar */}
      <div className="h-14 border-b border-outline-variant bg-surface px-6 flex items-center justify-between shrink-0">
        <div className="flex items-center gap-4">
          <Button variant="ghost" size="sm" className="px-2" onClick={() => window.history.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div className="h-6 w-px bg-outline-variant mx-2"></div>
          <span className="font-semibold text-on-surface">CMS Builder: {currentPage?.label}</span>
          <Badge variant="success">Live</Badge>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex bg-surface-container-low rounded-md p-1 mr-4 border border-outline-variant">
            <button
              className={`p-1.5 rounded ${device === 'desktop' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant'}`}
              onClick={() => setDevice('desktop')}
            >
              <Monitor className="h-4 w-4" />
            </button>
            <button
              className={`p-1.5 rounded ${device === 'mobile' ? 'bg-surface shadow-sm text-primary' : 'text-on-surface-variant'}`}
              onClick={() => setDevice('mobile')}
            >
              <Smartphone className="h-4 w-4" />
            </button>
          </div>
          <Button size="sm" className="gap-2" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            Save & Publish
          </Button>
        </div>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <CMSBuilderSidebar
          selectedPage={selectedPage}
          setSelectedPage={setSelectedPage}
          selectedSection={selectedSection}
          setSelectedSection={setSelectedSection}
          currentPage={currentPage}
        />

        <CMSBuilderCanvas
          device={device}
          selectedPage={selectedPage}
          selectedSection={selectedSection}
          cmsData={cmsData}
          currentPage={currentPage}
        />

        <CMSBuilderProperties
          selectedSection={selectedSection}
          cmsData={cmsData}
          updateContent={updateContent}
        />
      </div>
    </div>
  );
}
