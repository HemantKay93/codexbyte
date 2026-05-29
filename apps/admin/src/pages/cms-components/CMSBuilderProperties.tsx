import { Button, Input } from '@byteevolvr/ui';
import { X } from 'lucide-react';

interface CMSBuilderPropertiesProps {
  selectedSection: string;
  cmsData: Record<string, any>;
  // eslint-disable-line @typescript-eslint/no-explicit-any
  updateContent: (section: string, field: string, value: any) => void;
  // eslint-disable-line @typescript-eslint/no-explicit-any
}

export function CMSBuilderProperties({
  selectedSection,
  cmsData,
  updateContent,
}: CMSBuilderPropertiesProps) {
  return (
    <div className="w-80 border-l border-outline-variant bg-surface-container-lowest overflow-y-auto shrink-0 p-6">
      <h2 className="text-lg font-semibold text-on-surface mb-6">
        Edit {selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)}
      </h2>

      <div className="space-y-6">
        {selectedSection === 'hero' && (
          <>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Hero Title</label>
              <textarea
                value={cmsData.hero?.title}
                onChange={(e) => updateContent('hero', 'title', e.target.value)}
                className="w-full p-3 rounded-md border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Subtitle</label>
              <textarea
                value={cmsData.hero?.subtitle}
                onChange={(e) => updateContent('hero', 'subtitle', e.target.value)}
                className="w-full p-3 rounded-md border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                rows={4}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Button Text</label>
              <Input
                value={cmsData.hero?.buttonText}
                onChange={(e) => updateContent('hero', 'buttonText', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Background Image URL
              </label>
              <Input
                value={cmsData.hero?.backgroundImage}
                onChange={(e) => updateContent('hero', 'backgroundImage', e.target.value)}
              />
            </div>
          </>
        )}

        {selectedSection === 'navbar' && (
          <>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Logo Text</label>
              <Input
                value={cmsData.navbar?.logoText}
                onChange={(e) => updateContent('navbar', 'logoText', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-3">
                Navigation Links
              </label>
              <div className="space-y-4">
                {cmsData.navbar?.links?.map((link: any, i: number) => (
                  // eslint-disable-line @typescript-eslint/no-explicit-any
                  <div
                    key={i}
                    className="p-3 border border-outline rounded-lg bg-surface-container-lowest space-y-3 relative group"
                  >
                    <Input
                      placeholder="Label"
                      value={link.label}
                      onChange={(e) => {
                        const newLinks = [...cmsData.navbar.links];
                        newLinks[i] = { ...newLinks[i], label: e.target.value };
                        updateContent('navbar', 'links', newLinks);
                      }}
                    />
                    <Input
                      placeholder="URL"
                      value={link.href}
                      onChange={(e) => {
                        const newLinks = [...cmsData.navbar.links];
                        newLinks[i] = { ...newLinks[i], href: e.target.value };
                        updateContent('navbar', 'links', newLinks);
                      }}
                    />
                    <button
                      onClick={() => {
                        const newLinks = cmsData.navbar.links.filter(
                          (_: any, idx: number) => idx !== i
                          // eslint-disable-line @typescript-eslint/no-explicit-any
                        );
                        updateContent('navbar', 'links', newLinks);
                      }}
                      className="absolute -top-2 -right-2 h-6 w-6 bg-error text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                    >
                      <X size={12} />
                    </button>
                  </div>
                ))}
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full"
                  onClick={() => {
                    const newLinks = [
                      ...(cmsData.navbar?.links || []),
                      { label: 'New Link', href: '/' },
                    ];
                    updateContent('navbar', 'links', newLinks);
                  }}
                >
                  + Add Nav Link
                </Button>
              </div>
            </div>
          </>
        )}

        {selectedSection === 'contact' && (
          <>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Physical Address
              </label>
              <textarea
                value={cmsData.contact?.address}
                onChange={(e) => updateContent('contact', 'address', e.target.value)}
                className="w-full p-3 rounded-md border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Pin Code</label>
              <Input
                value={cmsData.contact?.pincode}
                onChange={(e) => updateContent('contact', 'pincode', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Phone Number</label>
              <Input
                value={cmsData.contact?.phone}
                onChange={(e) => updateContent('contact', 'phone', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Email Address
              </label>
              <Input
                value={cmsData.contact?.email}
                onChange={(e) => updateContent('contact', 'email', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Working Hours
              </label>
              <Input
                value={cmsData.contact?.workingHours}
                onChange={(e) => updateContent('contact', 'workingHours', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Google Maps URL
              </label>
              <textarea
                value={cmsData.contact?.mapUrl}
                onChange={(e) => updateContent('contact', 'mapUrl', e.target.value)}
                placeholder="Paste Google Maps embed URL here"
                className="w-full p-3 rounded-md border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none resize-none text-xs"
                rows={4}
              />
            </div>
          </>
        )}

        {selectedSection === 'main' && (
          <>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Page Title</label>
              <Input
                value={cmsData.main?.title}
                onChange={(e) => updateContent('main', 'title', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Content</label>
              <textarea
                value={cmsData.main?.content}
                onChange={(e) => updateContent('main', 'content', e.target.value)}
                className="w-full p-3 rounded-md border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                rows={15}
              />
            </div>
          </>
        )}

        {selectedSection === 'details' && (
          <>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Office Address
              </label>
              <textarea
                value={cmsData.details?.address}
                onChange={(e) => updateContent('details', 'address', e.target.value)}
                className="w-full p-3 rounded-md border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                rows={3}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Pin Code</label>
              <Input
                value={cmsData.details?.pincode}
                onChange={(e) => updateContent('details', 'pincode', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Phone</label>
              <Input
                value={cmsData.details?.phone}
                onChange={(e) => updateContent('details', 'phone', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Email</label>
              <Input
                value={cmsData.details?.email}
                onChange={(e) => updateContent('details', 'email', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Working Hours
              </label>
              <Input
                value={cmsData.details?.workingHours}
                onChange={(e) => updateContent('details', 'workingHours', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Google Maps URL / Embed Link
              </label>
              <textarea
                value={cmsData.details?.mapUrl}
                onChange={(e) => updateContent('details', 'mapUrl', e.target.value)}
                placeholder="Paste Google Maps embed URL here"
                className="w-full p-3 rounded-md border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none resize-none text-xs"
                rows={4}
              />
            </div>
          </>
        )}

        {selectedSection === 'social' && (
          <div className="space-y-4">
            {['facebook', 'twitter', 'instagram', 'linkedin', 'youtube'].map((platform) => (
              <div key={platform}>
                <label className="block text-sm font-medium text-on-surface mb-2 capitalize">
                  {platform} URL
                </label>
                <Input
                  value={cmsData.social?.[platform]}
                  onChange={(e) => updateContent('social', platform, e.target.value)}
                />
              </div>
            ))}
          </div>
        )}

        {selectedSection === 'seo' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">Meta Title</label>
              <Input
                value={cmsData.seo?.metaTitle}
                onChange={(e) => updateContent('seo', 'metaTitle', e.target.value)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-on-surface mb-2">
                Meta Description
              </label>
              <textarea
                value={cmsData.seo?.metaDescription}
                onChange={(e) => updateContent('seo', 'metaDescription', e.target.value)}
                className="w-full p-3 rounded-md border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                rows={3}
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
