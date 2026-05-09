import React, { useState, useEffect } from 'react';
import { Card, CardContent, Button, Input, Badge } from '../components/ui';
import {
  LayoutTemplate,
  Image,
  Type,
  Columns,
  ArrowLeft,
  Save,
  MousePointer2,
  Move,
  Smartphone,
  Monitor,
  Trash2,
  Globe,
  Phone,
  MapPin,
  Mail,
  Clock,
  Loader2,
  X,
} from 'lucide-react';
import { CMSService } from '@byteevolvr/api-client';

interface CmsContentRow {
  section_key: string;
  content: any;
}

export function CMSBuilderPage() {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedSection, setSelectedSection] = useState<'hero' | 'navbar' | 'contact'>('hero');
  const [cmsData, setCmsData] = useState<Record<string, any>>({
    hero: { title: '', subtitle: '', buttonText: '', buttonLink: '', backgroundImage: '' },
    navbar: { logoText: '', links: [] },
    contact: { address: '', phone: '', email: '', workingHours: '' },
  });

  useEffect(() => {
    fetchCMSContent();
  }, []);

  const fetchCMSContent = async () => {
    setLoading(true);
    try {
      const data = await CMSService.getContent('home');

      const formattedData: any = { ...cmsData };
      data?.forEach((item: CmsContentRow) => {
        formattedData[item.section_key] = item.content;
      });
      setCmsData(formattedData);
    } catch (err) {
      console.error('Error fetching CMS content:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await CMSService.updatePageContent('home', cmsData);
      alert('Changes saved and published successfully!');
    } catch (err) {
      console.error('Error saving CMS content:', err);
      alert('Failed to save changes.');
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (section: string, field: string, value: any) => {
    setCmsData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  if (loading) {
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
          <span className="font-semibold text-on-surface">Home Page CMS Builder</span>
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
        {/* Sections Panel */}
        <div className="w-64 border-r border-outline-variant bg-surface-container-lowest flex flex-col overflow-y-auto shrink-0">
          <div className="p-4 border-b border-outline-variant">
            <h3 className="text-sm font-semibold text-on-surface mb-3">Sections</h3>
            <div className="space-y-2">
              <div
                className={`flex items-center text-sm p-3 rounded-lg cursor-pointer transition-colors ${selectedSection === 'hero' ? 'bg-primary/10 text-primary border border-primary/20 font-medium' : 'hover:bg-surface-container text-on-surface'}`}
                onClick={() => setSelectedSection('hero')}
              >
                <LayoutTemplate className="h-4 w-4 mr-2" />
                Hero Section
              </div>
              <div
                className={`flex items-center text-sm p-3 rounded-lg cursor-pointer transition-colors ${selectedSection === 'navbar' ? 'bg-primary/10 text-primary border border-primary/20 font-medium' : 'hover:bg-surface-container text-on-surface'}`}
                onClick={() => setSelectedSection('navbar')}
              >
                <Globe className="h-4 w-4 mr-2" />
                Navigation Bar
              </div>
              <div
                className={`flex items-center text-sm p-3 rounded-lg cursor-pointer transition-colors ${selectedSection === 'contact' ? 'bg-primary/10 text-primary border border-primary/20 font-medium' : 'hover:bg-surface-container text-on-surface'}`}
                onClick={() => setSelectedSection('contact')}
              >
                <Phone className="h-4 w-4 mr-2" />
                Contact Info
              </div>
            </div>
          </div>
        </div>

        {/* Canvas Area (Live Preview) */}
        <div className="flex-1 bg-surface-dim overflow-y-auto p-8 flex justify-center">
          <div
            className={`bg-white shadow-xl min-h-full border border-outline-variant transition-all duration-300 relative ${device === 'mobile' ? 'w-[375px]' : 'w-full max-w-5xl'}`}
          >
            {/* Navbar Preview */}
            <div
              className={`p-4 border-b flex items-center justify-between bg-white ${selectedSection === 'navbar' ? 'ring-2 ring-primary ring-inset' : ''}`}
            >
              <div className="font-bold text-xl text-primary">
                {cmsData.navbar.logoText || 'Logo'}
              </div>
              <div className="flex gap-4 text-sm font-medium text-gray-600">
                {cmsData.navbar.links?.map((link: any, i: number) => (
                  <span key={i}>{link.label}</span>
                ))}
              </div>
            </div>

            {/* Hero Preview */}
            <div
              className={`relative py-24 px-10 text-center flex flex-col items-center justify-center text-white bg-cover bg-center overflow-hidden ${selectedSection === 'hero' ? 'ring-2 ring-primary ring-inset' : ''}`}
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${cmsData.hero.backgroundImage})`,
              }}
            >
              <h1 className="text-4xl font-bold mb-4 z-10">
                {cmsData.hero.title || 'Main Title Goes Here'}
              </h1>
              <p className="max-w-2xl mb-8 opacity-90 z-10">
                {cmsData.hero.subtitle || 'Your subtitle or description.'}
              </p>
              <Button className="z-10">{cmsData.hero.buttonText || 'Action'}</Button>
            </div>

            {/* Feature Content Placeholder */}
            <div className="p-12 bg-gray-50">
              <div className="grid grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="h-32 bg-white rounded-lg border border-gray-200"></div>
                ))}
              </div>
            </div>

            {/* Contact Preview */}
            <div
              className={`p-12 border-t bg-white ${selectedSection === 'contact' ? 'ring-2 ring-primary ring-inset' : ''}`}
            >
              <div className="grid grid-cols-2 gap-8">
                <div>
                  <h3 className="font-bold text-lg mb-4">Contact Us</h3>
                  <div className="space-y-2 text-sm text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={16} /> {cmsData.contact.address}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} /> {cmsData.contact.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={16} /> {cmsData.contact.email}
                    </div>
                  </div>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-4">Hours</h3>
                  <div className="flex items-center gap-2 text-sm text-gray-600">
                    <Clock size={16} /> {cmsData.contact.workingHours}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Properties Panel */}
        <div className="w-80 border-l border-outline-variant bg-surface-container-lowest overflow-y-auto shrink-0 p-6">
          <h2 className="text-lg font-semibold text-on-surface mb-6">
            Edit {selectedSection.charAt(0).toUpperCase() + selectedSection.slice(1)}
          </h2>

          <div className="space-y-6">
            {selectedSection === 'hero' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Hero Title
                  </label>
                  <textarea
                    value={cmsData.hero.title}
                    onChange={(e) => updateContent('hero', 'title', e.target.value)}
                    className="w-full p-3 rounded-md border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">Subtitle</label>
                  <textarea
                    value={cmsData.hero.subtitle}
                    onChange={(e) => updateContent('hero', 'subtitle', e.target.value)}
                    className="w-full p-3 rounded-md border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                    rows={4}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Button Text
                  </label>
                  <Input
                    value={cmsData.hero.buttonText}
                    onChange={(e) => updateContent('hero', 'buttonText', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Background Image URL
                  </label>
                  <Input
                    value={cmsData.hero.backgroundImage}
                    onChange={(e) => updateContent('hero', 'backgroundImage', e.target.value)}
                  />
                </div>
              </>
            )}

            {selectedSection === 'navbar' && (
              <>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Logo Text
                  </label>
                  <Input
                    value={cmsData.navbar.logoText}
                    onChange={(e) => updateContent('navbar', 'logoText', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-3">
                    Navigation Links
                  </label>
                  <div className="space-y-4">
                    {cmsData.navbar.links?.map((link: any, i: number) => (
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
                      fullWidth
                      onClick={() => {
                        const newLinks = [
                          ...(cmsData.navbar.links || []),
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
                    value={cmsData.contact.address}
                    onChange={(e) => updateContent('contact', 'address', e.target.value)}
                    className="w-full p-3 rounded-md border border-outline bg-surface text-on-surface focus:ring-2 focus:ring-primary focus:outline-none resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Phone Number
                  </label>
                  <Input
                    value={cmsData.contact.phone}
                    onChange={(e) => updateContent('contact', 'phone', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Email Address
                  </label>
                  <Input
                    value={cmsData.contact.email}
                    onChange={(e) => updateContent('contact', 'email', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-on-surface mb-2">
                    Working Hours
                  </label>
                  <Input
                    value={cmsData.contact.workingHours}
                    onChange={(e) => updateContent('contact', 'workingHours', e.target.value)}
                  />
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
