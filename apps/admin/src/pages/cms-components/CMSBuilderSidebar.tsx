import { LayoutTemplate } from 'lucide-react';

import { PAGES } from './useCMSBuilder';

interface CMSBuilderSidebarProps {
  selectedPage: string;
  setSelectedPage: (page: string) => void;
  selectedSection: string;
  setSelectedSection: (section: string) => void;
  currentPage: (typeof PAGES)[0] | undefined;
}

export function CMSBuilderSidebar({
  selectedPage,
  setSelectedPage,
  selectedSection,
  setSelectedSection,
  currentPage,
}: CMSBuilderSidebarProps) {
  return (
    <div className="w-64 border-r border-outline-variant bg-surface-container-lowest flex flex-col overflow-y-auto shrink-0">
      <div className="p-4 border-b border-outline-variant">
        <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
          Pages
        </h3>
        <div className="space-y-1">
          {PAGES.map((page) => (
            <div
              key={page.id}
              className={`flex items-center text-sm p-2.5 rounded-lg cursor-pointer transition-colors ${selectedPage === page.id ? 'bg-primary text-on-primary font-medium' : 'hover:bg-surface-container text-on-surface'}`}
              onClick={() => setSelectedPage(page.id)}
            >
              <page.icon className="h-4 w-4 mr-2" />
              {page.label}
            </div>
          ))}
        </div>
      </div>

      <div className="p-4">
        <h3 className="text-xs font-bold text-on-surface-variant uppercase tracking-wider mb-3">
          Sections
        </h3>
        <div className="space-y-1">
          {currentPage?.sections.map((section) => (
            <div
              key={section}
              className={`flex items-center text-sm p-2.5 rounded-lg cursor-pointer transition-colors ${selectedSection === section ? 'bg-primary/10 text-primary border border-primary/20 font-medium' : 'hover:bg-surface-container text-on-surface'}`}
              onClick={() => setSelectedSection(section)}
            >
              <LayoutTemplate className="h-4 w-4 mr-2" />
              {section.charAt(0).toUpperCase() + section.slice(1)}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
