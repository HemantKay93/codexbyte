import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  ChevronDown,
  Sparkles,
  Smartphone,
  Laptop,
  Watch,
  Headphones,
  Gamepad,
  Gift,
} from 'lucide-react';

export function ShopMegaMenu() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div
      className="relative"
      onMouseEnter={() => setIsOpen(true)}
      onMouseLeave={() => setIsOpen(false)}
    >
      <button className="flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium text-brand-muted hover:text-white hover:bg-white/5 transition-colors duration-200">
        Categories
        <motion.div animate={{ rotate: isOpen ? 180 : 0 }} transition={{ duration: 0.2 }}>
          <ChevronDown className="w-4 h-4" />
        </motion.div>
      </button>

      {/* Adding a small padding area to bridge the gap and prevent losing hover state */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 15, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className="absolute top-full left-1/2 -translate-x-1/2 pt-4 w-[600px] z-50"
          >
            <div className="bg-[#04080F]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-6 shadow-2xl overflow-hidden relative">
              {/* Glow Effect */}
              <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[200px] h-[100px] bg-primary/20 blur-[60px] rounded-full pointer-events-none" />

              <div className="grid grid-cols-2 gap-8 relative z-10">
                {/* Column 1 */}
                <div>
                  <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Laptop className="w-4 h-4 text-primary" />
                    Electronics & Gadgets
                  </h3>
                  <div className="flex flex-col gap-3">
                    <MegaMenuItem
                      icon={<Smartphone className="w-4 h-4" />}
                      title="Smartphones"
                      to="/shop?category=smartphones"
                    />
                    <MegaMenuItem
                      icon={<Laptop className="w-4 h-4" />}
                      title="Laptops & PC"
                      to="/shop?category=laptops"
                    />
                    <MegaMenuItem
                      icon={<Watch className="w-4 h-4" />}
                      title="Wearables"
                      to="/shop?category=wearables"
                    />
                  </div>
                </div>

                {/* Column 2 */}
                <div>
                  <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <Gamepad className="w-4 h-4 text-accent" />
                    Entertainment
                  </h3>
                  <div className="flex flex-col gap-3">
                    <MegaMenuItem
                      icon={<Headphones className="w-4 h-4" />}
                      title="Audio & Headphones"
                      to="/shop?category=audio"
                    />
                    <MegaMenuItem
                      icon={<Gamepad className="w-4 h-4" />}
                      title="Gaming Consoles"
                      to="/shop?category=gaming"
                    />
                    <MegaMenuItem
                      icon={<Gift className="w-4 h-4" />}
                      title="Accessories"
                      to="/shop?category=accessories"
                    />
                  </div>
                </div>
              </div>

              {/* Promotional Banner */}
              <div className="mt-8 rounded-xl bg-gradient-to-r from-primary/10 to-accent/10 p-4 border border-white/5 flex items-center justify-between relative overflow-hidden group">
                <div className="absolute inset-0 bg-gradient-to-r from-primary/20 to-accent/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 ease-in-out" />
                <div className="flex items-center gap-3 relative z-10">
                  <div className="p-2 bg-white/10 rounded-lg">
                    <Sparkles className="w-5 h-5 text-accent" />
                  </div>
                  <div>
                    <h4 className="text-sm font-semibold text-white">Summer Sale is Live!</h4>
                    <p className="text-xs text-brand-muted">
                      Get up to 50% off on all electronics.
                    </p>
                  </div>
                </div>
                <Link
                  to="/shop?sale=summer"
                  className="relative z-10 px-4 py-1.5 text-xs font-medium bg-white text-black rounded-full hover:bg-white/90 transition-colors"
                >
                  Shop Now
                </Link>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

function MegaMenuItem({ icon, title, to }: { icon: React.ReactNode; title: string; to: string }) {
  return (
    <Link
      to={to}
      className="group flex items-center gap-3 p-2 -mx-2 rounded-lg hover:bg-white/5 transition-colors duration-200"
    >
      <div className="p-1.5 rounded-md bg-white/5 text-brand-muted group-hover:bg-white/10 group-hover:text-white transition-colors">
        {icon}
      </div>
      <span className="text-sm font-medium text-brand-muted group-hover:text-white transition-colors">
        {title}
      </span>
    </Link>
  );
}
