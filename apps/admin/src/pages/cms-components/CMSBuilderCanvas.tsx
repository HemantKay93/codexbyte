import { Button } from '@byteevolvr/ui';
import { MapPin, Phone, Mail, Globe } from 'lucide-react';

import { PAGES } from './useCMSBuilder';

interface CMSBuilderCanvasProps {
  device: 'desktop' | 'mobile';
  selectedPage: string;
  selectedSection: string;
  cmsData: Record<string, any>;
  currentPage: (typeof PAGES)[0] | undefined;
}

export function CMSBuilderCanvas({
  device,
  selectedPage,
  selectedSection,
  cmsData,
  currentPage,
}: CMSBuilderCanvasProps) {
  return (
    <div className="flex-1 bg-surface-dim overflow-y-auto p-8 flex justify-center">
      <div
        className={`bg-white shadow-xl min-h-full border border-outline-variant transition-all duration-300 relative ${device === 'mobile' ? 'w-[375px]' : 'w-full max-w-5xl'}`}
      >
        {selectedPage === 'home' && (
          <>
            {/* Navbar Preview */}
            <div
              className={`p-4 border-b flex items-center justify-between bg-white ${selectedSection === 'navbar' ? 'ring-2 ring-primary ring-inset' : ''}`}
            >
              <div className="font-bold text-xl text-primary">
                {cmsData.navbar?.logoText || 'Logo'}
              </div>
              <div className="flex gap-4 text-sm font-medium text-gray-600">
                {cmsData.navbar?.links?.map((link: any, i: number) => (
                  <span key={i}>{link.label}</span>
                ))}
              </div>
            </div>

            {/* Hero Preview */}
            <div
              className={`relative py-24 px-10 text-center flex flex-col items-center justify-center text-white bg-cover bg-center overflow-hidden ${selectedSection === 'hero' ? 'ring-2 ring-primary ring-inset' : ''}`}
              style={{
                backgroundImage: `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.5)), url(${cmsData.hero?.backgroundImage})`,
              }}
            >
              <h1 className="text-4xl font-bold mb-4 z-10">
                {cmsData.hero?.title || 'Main Title'}
              </h1>
              <p className="max-w-2xl mb-8 opacity-90 z-10">{cmsData.hero?.subtitle}</p>
              <Button className="z-10">{cmsData.hero?.buttonText || 'Action'}</Button>
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
                      <MapPin size={16} /> {cmsData.contact?.address} {cmsData.contact?.pincode}
                    </div>
                    <div className="flex items-center gap-2">
                      <Phone size={16} /> {cmsData.contact?.phone}
                    </div>
                    <div className="flex items-center gap-2">
                      <Mail size={16} /> {cmsData.contact?.email}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        )}

        {(selectedPage === 'about' ||
          selectedPage === 'terms' ||
          selectedPage === 'refund' ||
          selectedPage === 'privacy') && (
          <div className="p-12">
            <h1 className="text-3xl font-bold mb-6">{cmsData.main?.title || currentPage?.label}</h1>
            <div className="prose max-w-none text-gray-600 whitespace-pre-wrap">
              {cmsData.main?.content || 'Content goes here...'}
            </div>
          </div>
        )}

        {selectedPage === 'contact_page' && (
          <div className="p-12">
            <h1 className="text-3xl font-bold mb-8 text-center">Get in Touch</h1>
            <div className="grid grid-cols-2 gap-12">
              <div className="space-y-6">
                <div>
                  <h3 className="font-bold text-lg mb-2">Our Office</h3>
                  <p className="text-gray-600">{cmsData.details?.address}</p>
                  <p className="text-gray-600">PIN: {cmsData.details?.pincode}</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Contact</h3>
                  <p className="text-gray-600">Phone: {cmsData.details?.phone}</p>
                  <p className="text-gray-600">Email: {cmsData.details?.email}</p>
                </div>
                <div>
                  <h3 className="font-bold text-lg mb-2">Hours</h3>
                  <p className="text-gray-600">{cmsData.details?.workingHours}</p>
                </div>
              </div>
              <div className="overflow-hidden rounded-lg bg-gray-100 h-[300px]">
                <iframe
                  src={
                    cmsData.details?.mapUrl ||
                    `https://www.google.com/maps?q=${encodeURIComponent(cmsData.details?.address || '')}&output=embed`
                  }
                  width="100%"
                  height="100%"
                  style={{ border: 0 }}
                  loading="lazy"
                ></iframe>
              </div>
            </div>
          </div>
        )}

        {selectedPage === 'global' && (
          <div className="p-12 text-center">
            <Globe className="h-16 w-16 mx-auto mb-4 text-primary opacity-20" />
            <h2 className="text-2xl font-bold mb-2">Global Site Settings</h2>
            <p className="text-gray-500">
              Configure settings that apply across your entire website.
            </p>

            <div className="mt-8 flex justify-center gap-4">
              {cmsData.social?.facebook && (
                <div className="h-10 w-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-bold">
                  F
                </div>
              )}
              {cmsData.social?.twitter && (
                <div className="h-10 w-10 rounded-full bg-sky-400 flex items-center justify-center text-white font-bold">
                  T
                </div>
              )}
              {cmsData.social?.instagram && (
                <div className="h-10 w-10 rounded-full bg-pink-500 flex items-center justify-center text-white font-bold">
                  I
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
