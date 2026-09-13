import NewsroomTheme from './newsroom';

// 1. Daftar Tema untuk API (Hanya Newsroom)
export const availableThemes = [
  {
    "id": "newsroom",
    "name": "Newsroom Editorial",
    "version": "1.0.0",
    "author": "CMSMu & Redaksi Jejaring",
    "description": "Tema portal berita modern kelas editorial jurnalisme dengan headline utama, breaking news ticker, dan kanal berita daerah jejaring."
  }
];

// 2. Fungsi Render
export const getActiveTheme = (_id?: string) => {
  return NewsroomTheme;
};
