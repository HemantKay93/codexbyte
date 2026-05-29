import { useState, useEffect } from 'react';
import { CMSService } from '@byteevolvr/api-client';
import { LayoutTemplate, Type, Columns, ArrowLeft, Globe, Phone } from 'lucide-react';

interface CmsContentRow {
  section_key: string;
  content: any;
  // eslint-disable-line @typescript-eslint/no-explicit-any
}

const DEFAULT_SECTION_CONTENT: Record<string, any> = {
  // eslint-disable-line @typescript-eslint/no-explicit-any
  details: {
    address: 'Chaltakonda, Routhkhanda,Near Kali Mata Mandir, Joypur, Bankura, West Bengal',
    pincode: '722138',
    phone: '+91 78889 57575',
    email: 'hello@byteevolvr.com',
    workingHours: 'Mon-Sat: 9:00 AM - 7:00 PM',
    mapUrl: '',
  },
  contact: {
    address: 'Chaltakonda, Routhkhanda,Near Kali Mata Mandir, Joypur, Bankura, West Bengal',
    pincode: '722138',
    phone: '+91 78889 57575',
    email: 'hello@byteevolvr.com',
    workingHours: 'Mon-Sat: 9:00 AM - 7:00 PM',
    mapUrl: '',
  },
  social: {
    facebook: 'https://www.facebook.com/BYTEEVOLVRENTERPRISE/',
    twitter: 'https://x.com/byteevolvr73336',
    instagram: 'https://www.instagram.com/byteevolvr/',
    linkedin: 'https://www.linkedin.com/company/byteevolvr/',
    whatsapp: '+917888957575',
  },
  hero: {
    title: 'Modern IT Solutions for Growing Businesses',
    subtitle:
      'From infrastructure management to specialized hardware trading, we provide end-to-end technology services.',
    buttonText: 'Get Started',
  },
  seo: {
    title: 'ByteeVolvr - Technology Trading & IT Consulting',
    description:
      'Expert infrastructure management, specialized repair services, and premium technology supply.',
    keywords: 'IT Consulting, Hardware Trading, Network Infrastructure, Server Repair',
  },
  main: {
    title: 'Page Content',
    content: 'Welcome to ByteeVolvr. We are committed to providing the best technology services.',
    lastUpdated: new Date().toLocaleDateString(),
  },
};

export const PAGES = [
  {
    id: 'home',
    label: 'Home Page',
    icon: LayoutTemplate,
    sections: ['hero', 'navbar', 'contact'],
  },
  { id: 'about', label: 'About Us', icon: Type, sections: ['main'] },
  { id: 'contact_page', label: 'Contact Page', icon: Phone, sections: ['details'] },
  { id: 'terms', label: 'Terms & Conditions', icon: Columns, sections: ['main'] },
  { id: 'refund', label: 'Refund Policy', icon: ArrowLeft, sections: ['main'] },
  { id: 'privacy', label: 'Privacy Policy', icon: Type, sections: ['main'] },
  { id: 'global', label: 'Global Settings', icon: Globe, sections: ['social', 'seo', 'contact'] },
];

export function useCMSBuilder() {
  const [device, setDevice] = useState<'desktop' | 'mobile'>('desktop');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [selectedPage, setSelectedPage] = useState('home');
  const [selectedSection, setSelectedSection] = useState('hero');
  const [cmsData, setCmsData] = useState<Record<string, any>>({
    // eslint-disable-line @typescript-eslint/no-explicit-any
    hero: { title: '', subtitle: '', buttonText: '', buttonLink: '', backgroundImage: '' },
    navbar: { logoText: '', links: [] },
    contact: { address: '', pincode: '', phone: '', email: '', workingHours: '' },
    main: { title: '', content: '', lastUpdated: '' },
    details: { address: '', pincode: '', phone: '', email: '', mapUrl: '' },
    social: { facebook: '', twitter: '', instagram: '', linkedin: '', youtube: '' },
    seo: { metaTitle: '', metaDescription: '', keywords: '' },
  });
  const [dirtySections, setDirtySections] = useState<Set<string>>(new Set());

  const fetchCMSContent = async (page: string) => {
    setLoading(true);
    setCmsData({}); // Clear current state to prevent bleeding between pages
    try {
      const data = await CMSService.getContent(page);

      const pageInfo = PAGES.find((p) => p.id === page);
      const formattedData: any = {};
      // eslint-disable-line @typescript-eslint/no-explicit-any

      // Initialize with defaults if available
      pageInfo?.sections.forEach((s) => {
        formattedData[s] = DEFAULT_SECTION_CONTENT[s] || {};
      });

      // Overwrite with actual data from DB
      data?.forEach((item: CmsContentRow) => {
        formattedData[item.section_key] = item.content;
      });
      setCmsData(formattedData);
      setDirtySections(new Set()); // Reset on fresh load

      if (pageInfo && !pageInfo.sections.includes(selectedSection)) {
        setSelectedSection(pageInfo.sections[0]);
      }
    } catch (err) {
      console.error('Error fetching CMS content:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchCMSContent(selectedPage);
    // eslint-disable-line react-hooks/set-state-in-effect
  }, [selectedPage]);
  // eslint-disable-line react-hooks/exhaustive-deps

  const handleSave = async () => {
    // Determine which sections have actually changed
    const modifiedSections = Array.from(dirtySections);

    if (modifiedSections.length === 0) {
      alert('No changes detected to save.');
      return;
    }

    setSaving(true);

    // Create payload with ONLY dirty sections
    const dataToSave: Record<string, any> = {};
    // eslint-disable-line @typescript-eslint/no-explicit-any
    modifiedSections.forEach((section) => {
      dataToSave[section] = cmsData[section];
    });

    console.log('[CMS] Publishing modified sections:', selectedPage, modifiedSections);
    // eslint-disable-line no-console
    try {
      await CMSService.updatePageContent(selectedPage, dataToSave);
      setDirtySections(new Set()); // Reset tracking after success
      await fetchCMSContent(selectedPage);
      alert(`Successfully updated: ${modifiedSections.join(', ')}`);
    } catch (err) {
      console.error('Error saving CMS content:', err);
      alert('Failed to save changes. Please check backend logs.');
    } finally {
      setSaving(false);
    }
  };

  const updateContent = (section: string, field: string, value: any) => {
    // eslint-disable-line @typescript-eslint/no-explicit-any
    // Mark this section as "dirty" (modified)
    setDirtySections((prev) => {
      const next = new Set(prev);
      next.add(section);
      return next;
    });

    setCmsData((prev) => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value,
      },
    }));
  };

  const currentPage = PAGES.find((p) => p.id === selectedPage);

  return {
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
    PAGES,
    currentPage,
  };
}
