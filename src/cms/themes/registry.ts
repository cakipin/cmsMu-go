import SuaraAisyiyah from './suara-aisyiyah';
import NewsroomTheme from './newsroom';

// 1. Daftar Tema yang Tersedia
export const availableThemes = [
  {
    "id": "suara-aisyiyah",
    "name": "CMSMu Magazine & Portal (Default)",
    "version": "1.0.0",
    "author": "CMSMu Core Team",
    "description": "Tema portal berita dan majalah modern dengan hero editorial, grid berita, dan identitas visual CMSMu."
  },
  {
    "id": "newsroom",
    "name": "Newsroom Editorial",
    "version": "1.0.0",
    "author": "CMSMu & Redaksi Jejaring",
    "description": "Tema portal berita modern kelas editorial jurnalisme dengan headline utama, breaking news ticker, dan kanal berita daerah jejaring."
  }
];

// 2. Fungsi Pengambilan Tema Aktif (Default: suara-aisyiyah)
export const getActiveTheme = (id?: string) => {
  const themes: Record<string, any> = {
    'suara-aisyiyah': SuaraAisyiyah,
    'newsroom': NewsroomTheme,
  };
  return (id && themes[id]) ? themes[id] : SuaraAisyiyah;
};

