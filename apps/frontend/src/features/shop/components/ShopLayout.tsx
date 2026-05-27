import { Outlet, Link, useNavigate } from 'react-router-dom';

export function ShopLayout() {
  const navigate = useNavigate();
  return (
    <div className="flex flex-col min-h-screen bg-stitch-surface text-stitch-on-surface font-stitch-body-md dark">
      {/* TopAppBar */}
      <header className="fixed top-0 w-full z-50 bg-stitch-surface/80 backdrop-blur-xl border-b border-stitch-outline-variant/30 shadow-2xl">
        <div className="flex items-center justify-between px-stitch-container-padding-mobile md:px-stitch-container-padding-desktop h-20 w-full">
          <div className="flex items-center gap-4">
            <button className="material-symbols-outlined text-stitch-primary scale-95 active:scale-90 transition-transform">
              menu
            </button>
            <h1 className="font-stitch-display-lg text-stitch-display-lg-mobile tracking-tighter text-stitch-primary dark:text-stitch-primary-fixed-dim uppercase">
              NEON_CORE
            </h1>
          </div>
          <div className="flex items-center gap-stitch-gutter">
            <nav className="hidden md:flex gap-8 items-center">
              <Link
                to="/shop/category/laptops"
                className="font-stitch-label-sm text-stitch-label-sm text-stitch-on-surface-variant hover:text-stitch-secondary transition-colors"
              >
                LAPTOPS
              </Link>
              <Link
                to="/shop/category/components"
                className="font-stitch-label-sm text-stitch-label-sm text-stitch-on-surface-variant hover:text-stitch-secondary transition-colors"
              >
                COMPONENTS
              </Link>
              <Link
                to="/contact"
                className="font-stitch-label-sm text-stitch-label-sm text-stitch-on-surface-variant hover:text-stitch-secondary transition-colors"
              >
                SUPPORT
              </Link>
            </nav>
            <button
              onClick={() => navigate('/shop/cart')}
              className="font-stitch-label-sm text-stitch-label-sm text-stitch-primary dark:text-stitch-primary-fixed-dim flex items-center gap-2 hover:text-stitch-secondary transition-colors scale-95 active:scale-90 duration-300"
            >
              <span className="material-symbols-outlined">shopping_cart</span>
              <span className="hidden md:block">Cart</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-grow pt-20">
        <Outlet />
      </div>

      {/* Footer */}
      <footer className="w-full relative border-t border-stitch-outline-variant/10 bg-stitch-surface-container-lowest">
        <div className="max-w-7xl mx-auto px-stitch-container-padding-desktop py-12 flex flex-col md:flex-row justify-between gap-stitch-gutter items-center">
          <div className="flex flex-col gap-2 text-center md:text-left">
            <p className="font-stitch-display-lg text-stitch-display-lg-mobile text-stitch-primary tracking-tighter uppercase">
              NEON_CORE
            </p>
            <p className="font-stitch-body-md text-stitch-body-md text-stitch-outline">
              © 2024 NEON_CORE PRECISI0N. ALL RIGHTS RESERVED.
            </p>
          </div>
          <div className="flex gap-8">
            <Link to="/contact" className="font-stitch-label-sm text-stitch-label-sm text-stitch-outline hover:text-stitch-secondary-fixed-dim underline-offset-4 underline transition-all">Support</Link>
            <Link to="/legal/terms" className="font-stitch-label-sm text-stitch-label-sm text-stitch-outline hover:text-stitch-secondary-fixed-dim underline-offset-4 underline transition-all">Terms & Conditions</Link>
            <Link to="/legal/refund" className="font-stitch-label-sm text-stitch-label-sm text-stitch-outline hover:text-stitch-secondary-fixed-dim underline-offset-4 underline transition-all">Refund Policy</Link>
            <Link to="/legal/privacy" className="font-stitch-label-sm text-stitch-label-sm text-stitch-outline hover:text-stitch-secondary-fixed-dim underline-offset-4 underline transition-all">Privacy Policy</Link>
          </div>
        </div>
      </footer>

      {/* BottomNavBar (Mobile only) */}
      <div className="md:hidden fixed bottom-0 left-0 w-full flex justify-around items-center h-16 pb-safe bg-stitch-surface-container/90 backdrop-blur-md border-t border-stitch-outline-variant/20 z-50 rounded-t-xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
        <button onClick={() => navigate('/shop')} className="flex flex-col items-center justify-center text-stitch-outline hover:bg-stitch-surface-variant/50 active:scale-95 transition-all">
          <span className="material-symbols-outlined">home</span>
          <span className="font-stitch-label-sm text-stitch-label-sm">Home</span>
        </button>
        <button onClick={() => navigate('/shop')} className="flex flex-col items-center justify-center text-stitch-outline hover:bg-stitch-surface-variant/50 active:scale-95 transition-all">
          <span className="material-symbols-outlined">search</span>
          <span className="font-stitch-label-sm text-stitch-label-sm">Search</span>
        </button>
        <button onClick={() => navigate('/shop/cart')} className="flex flex-col items-center justify-center text-stitch-primary brightness-125 hover:bg-stitch-surface-variant/50 active:scale-95 transition-all">
          <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>shopping_cart</span>
          <span className="font-stitch-label-sm text-stitch-label-sm">Cart</span>
        </button>
        <button onClick={() => navigate('/shop/dashboard')} className="flex flex-col items-center justify-center text-stitch-outline hover:bg-stitch-surface-variant/50 active:scale-95 transition-all">
          <span className="material-symbols-outlined">person</span>
          <span className="font-stitch-label-sm text-stitch-label-sm">Account</span>
        </button>
      </div>
    </div>
  );
}
