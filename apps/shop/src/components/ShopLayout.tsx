import { Link, NavLink, Outlet } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { useAppSelector } from '@/hooks/useStoreHooks';
import { supabase } from '@/lib/supabase';
import { Phone, Mail, MapPin, Clock } from 'lucide-react';

export function ShopLayout() {
  const itemCount = useAppSelector((state) =>
    state.cart.items.reduce((sum, item) => sum + item.quantity, 0)
  );

  const [cmsData, setCmsData] = useState<any>({
    navbar: { logoText: 'ByteeVolvr', links: [] },
    contact: { address: '', phone: '', email: '', workingHours: '' }
  });

  useEffect(() => {
    fetchCMS();
  }, []);

  const fetchCMS = async () => {
    try {
      const { data } = await supabase
        .from('cms_content')
        .select('*')
        .eq('page_slug', 'home')
        .in('section_key', ['navbar', 'contact']);
      
      const formatted: any = { ...cmsData };
      data?.forEach(item => {
        formatted[item.section_key] = item.content;
      });
      setCmsData(formatted);
    } catch (err) {
      console.error('Error fetching CMS:', err);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'var(--color-bg)', color: 'var(--color-text)' }}>
      <header
        style={{
          position: 'sticky',
          top: 0,
          zIndex: 100,
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          padding: 'var(--space-4) var(--space-8)',
          borderBottom: '1px solid var(--color-border)',
          background: 'rgba(4, 8, 15, 0.85)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <Link to="/" style={{ color: '#fff', textDecoration: 'none', fontWeight: 900, fontSize: 24, letterSpacing: '-0.02em', display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ width: 32, height: 32, background: 'var(--color-primary)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 18 }}>
            {cmsData.navbar.logoText?.[0] || 'B'}
          </div>
          {cmsData.navbar.logoText || 'ByteeVolvr'} <span style={{ color: 'var(--color-primary-light)', fontWeight: 400 }}>Shop</span>
        </Link>
        <nav style={{ display: 'flex', gap: 'var(--space-8)', alignItems: 'center' }}>
          <NavLink 
            to="/" 
            style={({ isActive }) => ({ 
              color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)', 
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 15,
              transition: 'var(--transition-fast)'
            })}
          >
            Products
          </NavLink>
          <NavLink 
            to="/orders" 
            style={({ isActive }) => ({ 
              color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)', 
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 15,
              transition: 'var(--transition-fast)'
            })}
          >
            My Orders
          </NavLink>
          <NavLink 
            to="/profile" 
            style={({ isActive }) => ({ 
              color: isActive ? 'var(--color-accent)' : 'var(--color-text-muted)', 
              textDecoration: 'none',
              fontWeight: 600,
              fontSize: 15,
              transition: 'var(--transition-fast)'
            })}
          >
            Profile
          </NavLink>
          <Link
            to="/cart"
            style={{
              color: '#fff',
              textDecoration: 'none',
              padding: '10px 20px',
              borderRadius: 'var(--radius-full)',
              background: 'var(--color-primary)',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: 8,
              boxShadow: 'var(--shadow-glow)',
              transition: 'var(--transition-base)'
            }}
          >
            <span>🛒</span>
            <span>Cart</span>
            <span style={{ 
              background: 'rgba(255,255,255,0.2)', 
              padding: '2px 8px', 
              borderRadius: 6, 
              fontSize: 12 
            }}>
              {itemCount}
            </span>
          </Link>
        </nav>
      </header>
      <Outlet />
      
      <footer style={{ padding: 'var(--space-16) var(--space-8)', borderTop: '1px solid var(--color-border)', marginTop: 'var(--space-16)', background: 'var(--color-bg-secondary)' }}>
        <div style={{ maxWidth: 1280, margin: '0 auto', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 'var(--space-12)' }}>
          <div>
            <h3 style={{ marginBottom: 'var(--space-4)', color: '#fff' }}>{cmsData.navbar.logoText || 'ByteeVolvr'}</h3>
            <p style={{ color: 'var(--color-text-muted)', fontSize: 14, lineHeight: 1.6 }}>
              Enterprise technology solutions for the modern Indian market.
            </p>
            <div style={{ marginTop: 'var(--space-6)', display: 'grid', gap: 'var(--space-2)', fontSize: 13, color: 'var(--color-text-muted)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><MapPin size={14} /> {cmsData.contact.address}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Phone size={14} /> {cmsData.contact.phone}</div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Mail size={14} /> {cmsData.contact.email}</div>
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: 'var(--space-4)', color: '#fff' }}>Quick Links</h4>
            <div style={{ display: 'grid', gap: 'var(--space-2)', fontSize: 14, color: 'var(--color-text-muted)' }}>
              <Link to="/" style={{ color: 'inherit', textDecoration: 'none' }}>All Products</Link>
              <Link to="/orders" style={{ color: 'inherit', textDecoration: 'none' }}>Order Tracking</Link>
              <span>Returns Policy</span>
            </div>
          </div>
          <div>
            <h4 style={{ marginBottom: 'var(--space-4)', color: '#fff' }}>Hours</h4>
            <div style={{ display: 'grid', gap: 'var(--space-2)', fontSize: 14, color: 'var(--color-text-muted)' }}>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}><Clock size={14} /> {cmsData.contact.workingHours}</div>
              <span>24/7 Enterprise Helpdesk</span>
              <span>GST Invoicing</span>
            </div>
          </div>
        </div>
        <div style={{ maxWidth: 1280, margin: 'var(--space-12) auto 0', paddingTop: 'var(--space-8)', borderTop: '1px solid var(--color-border)', textAlign: 'center', fontSize: 12, color: 'var(--color-text-subtle)' }}>
          © 2026 ByteeVolvr Enterprises. All rights reserved. Razorpay & Shiprocket integrated.
        </div>
      </footer>
    </div>
  );
}
