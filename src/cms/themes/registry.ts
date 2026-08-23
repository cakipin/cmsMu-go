// OTOMATIS DIGENERATE OLEH npm run sync-themes
import LabmuDefault from './labmu-default';
import LabmuNews from './labmu-news';
import LabmuPro from './labmu-pro';
import LabmuQuran from './labmu-quran';
import Wikimu from './wikimu';
import Hestia from './hestia';
import NewspaperMu from './newspaper-mu';
import LpekTheme from './lpek';
import SuaraAisyiyah from './suara-aisyiyah';


// 1. Daftar Tema untuk API
export const availableThemes = [
  {
    "id": "labmu-default",
    "name": "labmu-default",
    "description": "No description"
  },
  {
    "id": "labmu-news",
    "name": "LabMu News Premium",
    "version": "1.0.0",
    "author": "LabMu Dev",
    "description": "Tema berita modern untuk ekosistem Muhammadiyah."
  },
  {
    "id": "labmu-pro",
    "name": "labmu-pro",
    "description": "No description"
  },
  {
    "id": "labmu-quran",
    "name": "labmu-quran",
    "description": "No description"
  },
  {
    "id": "wikimu",
    "name": "WikiMu (Wikipedia Clone)",
    "version": "1.0.0",
    "author": "LabMu Dev",
    "description": "Tema ensiklopedia dengan gaya Skin Vector klasik ala Wikipedia."
  },
  {
    "id": "hestia",
    "name": "Hestia Clone",
    "version": "1.0.0",
    "author": "LabMu Dev",
    "description": "Material Design inspired CMS theme clone."
  },
  {
    "id": "newspaper-mu",
    "name": "Newspaper Theme",
    "version": "1.0.0",
    "author": "CmsMu",
    "description": "Clone of the Newspaper WordPress Theme."
  },
  {
    "id": "lpek",
    "name": "LPEK Theme",
    "version": "1.0.0",
    "author": "cmsMu Dev",
    "description": "Tema resmi Lembaga Pariwisata dan Ekonomi Kreatif (LPEK) Muhammadiyah."
  },
  {
    "id": "suara-aisyiyah",
    "name": "Suara 'Aisyiyah Clone",
    "version": "1.0.0",
    "author": "CmsMu",
    "description": "Tema portal majalah perempuan dengan hero editorial dan aksen hijau-oranye."
  }
];

// 2. Fungsi Render
export const getActiveTheme = (id: string) => {
  const themes: any = {
  'labmu-default': LabmuDefault,
  'labmu-news': LabmuNews,
  'labmu-pro': LabmuPro,
  'labmu-quran': LabmuQuran,
  'wikimu': Wikimu,
  'hestia': Hestia,
  'newspaper-mu': NewspaperMu,
  'lpek': LpekTheme,
  'suara-aisyiyah': SuaraAisyiyah,
  };
  return themes[id] || themes['labmu-default'];
};
