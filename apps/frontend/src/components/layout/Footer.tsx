import { Link } from 'react-router-dom';
import { Footer as SharedFooter } from '@byteevolvr/ui';
import { AppLogo } from '@/components/ui/AppLogo';
import { useCMS } from '@/features/cms/useCMS';

const footerSections = [
  {
    title: 'Company',
    links: [
      { label: 'About Us', to: '/about' },
      { label: 'Our Services', to: '/services' },
      { label: 'Contact Us', to: '/contact' },
      { label: 'Career', to: '#' },
    ],
  },
  {
    title: 'Products',
    links: [
      { label: 'Shop Store', to: '/shop' },
      { label: 'Order Tracking', to: '/shop/tracking' },
      { label: 'B2B Inquiry', to: '/contact' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Privacy Policy', to: '/legal/privacy' },
      { label: 'Terms of Service', to: '/legal/terms' },
      { label: 'Refund Policy', to: '/legal/refund' },
    ],
  },
];

export function Footer() {
  const { data: globalCms } = useCMS('global');
  const { data: homeCms } = useCMS('home');

  return (
    <SharedFooter
      logo={<AppLogo size={32} />}
      description="ByteeVolvr Enterprises is a leading IT consulting and technology trading firm. We specialize in end-to-end infrastructure management, specialized repair services, and premium technology supply for modern businesses."
      sections={footerSections}
      copyright={`© ${new Date().getFullYear()} ByteeVolvr Enterprises. All rights reserved.`}
      LinkComponent={Link}
      socialLinks={globalCms?.social}
      contactInfo={homeCms?.contact}
    />
  );
}
