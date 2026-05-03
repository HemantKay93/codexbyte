import { Outlet } from 'react-router-dom';
import { Footer } from './Footer';
import { Header } from './Header';

export function MainLayout() {
  return (
    <main className="min-h-screen overflow-x-hidden bg-brand-bg">
      <Header />
      <Outlet />
      <Footer />
    </main>
  );
}
