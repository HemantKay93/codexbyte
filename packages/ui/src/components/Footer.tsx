import React from 'react';
import { Mail, Phone, MapPin } from 'lucide-react';

const Facebook = (props: any) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path>
  </svg>
);
const Twitter = (props: any) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M22 4s-.7 2.1-2 3.4c1.6 10-9.4 17.3-18 11.6 2.2.1 4.4-.6 6-2C3 15.5.5 9.6 3 5c2.2 2.6 5.6 4.1 9 4-.9-4.2 4-6.6 7-3.8 1.1 0 3-1.2 3-1.2z"></path>
  </svg>
);
const Instagram = (props: any) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
    <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
  </svg>
);
const Linkedin = (props: any) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
    {...props}
  >
    <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path>
    <rect x="2" y="9" width="4" height="12"></rect>
    <circle cx="4" cy="4" r="2"></circle>
  </svg>
);

interface FooterLink {
  label: string;
  to: string;
}

interface FooterSection {
  title: string;
  links: FooterLink[];
}

interface FooterProps {
  logo: React.ReactNode;
  description: string;
  sections: FooterSection[];
  copyright: string;
  LinkComponent: React.ComponentType<any>;
  socialLinks?: {
    facebook?: string;
    twitter?: string;
    instagram?: string;
    linkedin?: string;
    youtube?: string;
  };
  contactInfo?: {
    email?: string;
    phone?: string;
    address?: string;
  };
}

export function Footer({
  logo,
  description,
  sections,
  copyright,
  LinkComponent,
  socialLinks,
  contactInfo,
}: FooterProps) {
  const socialIcons = [
    { icon: Facebook, href: socialLinks?.facebook || '#' },
    { icon: Twitter, href: socialLinks?.twitter || '#' },
    { icon: Instagram, href: socialLinks?.instagram || '#' },
    { icon: Linkedin, href: socialLinks?.linkedin || '#' },
  ].filter((item) => item.href !== '#');

  // Fallback if no social links provided
  const displaySocial =
    socialIcons.length > 0
      ? socialIcons
      : [
          { icon: Facebook, href: '#' },
          { icon: Twitter, href: '#' },
          { icon: Instagram, href: '#' },
          { icon: Linkedin, href: '#' },
        ];

  return (
    <footer className="border-t border-white/5 bg-[#04080F] py-10">
      <div className="mx-auto max-w-7xl px-6 lg:px-8">
        <div className="grid gap-12 lg:grid-cols-12">
          <div className="lg:col-span-4">
            <div className="flex items-center gap-2 mb-6 group">
              {logo}
              <span className="font-display text-xl font-bold tracking-tight text-white transition-colors group-hover:text-accent">
                ByteeVolvr
              </span>
            </div>
            <p className="mb-8 text-sm leading-relaxed text-brand-muted max-w-sm">{description}</p>
            <div className="flex gap-4">
              {displaySocial.map((item, i) => {
                const Icon = item.icon;
                return (
                  <a
                    key={i}
                    href={item.href}
                    className="flex h-10 w-10 items-center justify-center rounded-full border border-white/5 bg-white/5 text-brand-muted transition-all duration-300 hover:scale-110 hover:border-accent/50 hover:bg-accent/10 hover:text-accent hover:shadow-[0_0_15px_rgba(96,165,250,0.3)]"
                  >
                    <Icon className="h-4 w-4" />
                  </a>
                );
              })}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 lg:col-span-8">
            {sections.map((section) => (
              <div key={section.title}>
                <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-white">
                  {section.title}
                </h3>
                <ul className="space-y-4">
                  {section.links.map((link) => (
                    <li key={link.label}>
                      <LinkComponent
                        to={link.to}
                        className="text-sm text-brand-muted hover:text-white transition-colors"
                      >
                        {link.label}
                      </LinkComponent>
                    </li>
                  ))}
                </ul>
              </div>
            ))}

            <div className="sm:col-span-1">
              <h3 className="mb-6 text-xs font-bold uppercase tracking-widest text-white">
                Contact
              </h3>
              <ul className="space-y-4">
                <li className="flex items-center gap-3 text-sm text-brand-muted">
                  <Mail className="h-4 w-4 text-accent" />
                  {contactInfo?.email || 'hello@byteevolvr.com'}
                </li>
                <li className="flex items-center gap-3 text-sm text-brand-muted">
                  <Phone className="h-4 w-4 text-accent" />
                  {contactInfo?.phone || '+91 98765 00000'}
                </li>
                <li className="flex items-center gap-3 text-sm text-brand-muted">
                  <MapPin className="h-4 w-4 text-accent" />
                  {contactInfo?.address || 'Mumbai, India'}
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/5 pt-6 flex flex-col md:flex-row justify-between gap-4">
          <p className="text-xs text-brand-subtle">{copyright}</p>
          <div className="flex gap-6">
            <a href="#" className="text-xs text-brand-subtle hover:text-white transition-colors">
              Privacy Policy
            </a>
            <a href="#" className="text-xs text-brand-subtle hover:text-white transition-colors">
              Terms of Service
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
