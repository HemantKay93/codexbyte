import { Helmet } from 'react-helmet-async';

interface PageSeoProps {
  title: string;
  description: string;
  image?: string;
  url?: string;
}

export function PageSeo({ title, description, image, url }: PageSeoProps) {
  const siteName = 'ByteeVolvr Enterprises';
  const fullTitle = `${title} | ${siteName}`;
  const defaultImage = 'https://byteevolvr.com/og-image.jpg'; // Placeholder
  const siteUrl = 'https://byteevolvr.com';

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url || siteUrl} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:image" content={image || defaultImage} />

      {/* Twitter */}
      <meta property="twitter:card" content="summary_large_image" />
      <meta property="twitter:url" content={url || siteUrl} />
      <meta property="twitter:title" content={fullTitle} />
      <meta property="twitter:description" content={description} />
      <meta property="twitter:image" content={image || defaultImage} />

      {/* Additional SEO */}
      <link rel="canonical" href={url || siteUrl} />
      <meta name="robots" content="index, follow" />
    </Helmet>
  );
}
