import React from 'react';

interface SafeBottomNavProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Komponen pembungkus navigasi / tombol aksi bawah layar
 * Sesuai SOP Aturan 9: Memperhitungkan gesture bar & navigation bar Android
 */
export const SafeBottomNav: React.FC<SafeBottomNavProps> = ({ children, className = '', style = {} }) => {
  return (
    <div
      className={`fixed bottom-0 left-0 right-0 z-40 bg-white/90 dark:bg-slate-900/90 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 ${className}`}
      style={{
        paddingBottom: 'max(env(safe-area-inset-bottom, 24px), 24px)',
        paddingTop: '12px',
        paddingLeft: '16px',
        paddingRight: '16px',
        ...style
      }}
    >
      {children}
    </div>
  );
};
