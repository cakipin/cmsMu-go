import DefaultTheme from "./default";

// 1. Daftar Tema yang Tersedia
export const availableThemes = [
  {
    id: "default",
    name: "CMSMu Editorial (Default)",
    version: "1.0.0",
    author: "CMSMu Core Team",
    description:
      "Tema portal berita, opini, dan publikasi resmi CMSMu dengan performa tinggi, desain responsif modern, dan zero-hardcode.",
  },
];

// 2. Fungsi Pengambilan Tema Aktif (Default: default)
export const getActiveTheme = (id?: string) => {
  const themes: Record<string, any> = {
    default: DefaultTheme,
  };
  return id && themes[id] ? themes[id] : DefaultTheme;
};
