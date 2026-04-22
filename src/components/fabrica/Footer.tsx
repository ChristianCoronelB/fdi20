'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

interface FooterProps {
  className?: string;
}

export function Footer({ className }: FooterProps) {
  const [footerText, setFooterText] = useState('© 2024 Fábrica de Ideas - Todos los derechos reservados');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFooterText = async () => {
      try {
        const res = await fetch('/api/app-config?key=footerText');
        if (res.ok) {
          const data = await res.json();
          if (data.success && data.data?.value) {
            setFooterText(data.data.value);
          }
        }
      } catch (error) {
        console.error('Error loading footer text:', error);
      }
      setLoading(false);
    };

    loadFooterText();
  }, []);

  return (
    <motion.footer
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
      className={`sticky bottom-0 mt-auto bg-gradient-to-r from-emerald-600 to-teal-600 dark:from-emerald-900 dark:to-teal-900 text-white py-3 px-4 shadow-lg z-40 ${className || ''}`}
    >
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-sm text-center sm:text-left">
          <span className="opacity-90">{footerText}</span>
        </div>
        <div className="flex items-center gap-1 text-sm opacity-75">
          <span>Hecho con</span>
          <Heart className="w-4 h-4 text-red-400 fill-red-400 animate-pulse" />
          <span>para innovadores</span>
        </div>
      </div>
    </motion.footer>
  );
}
