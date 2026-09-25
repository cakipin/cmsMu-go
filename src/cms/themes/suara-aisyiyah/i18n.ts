/**
 * 🌐 Suara 'Aisyiyah Theme Multi-Language Menu Translator
 * SOP Modular Architecture: Isolasi kamus bahasa dari berkas layout utama
 */

export const EN_MENU_MAP: Record<string, string> = {
  'berita': 'News',
  'kajian': 'Studies',
  'keluarga sakinah': 'Sakinah Family',
  'wawasan': 'Insights',
  'gaya hidup': 'Lifestyle',
  'inspirasi': 'Inspiration',
  'muda': 'Youth',
  'e-majalah': 'E-Magazine',
  'home': 'Home',
  'beranda': 'Home',
  'kirim tulisan': 'Submit Article',
  'berlangganan': 'Subscribe',
  'masuk': 'Login',
  'keluar': 'Logout',
  'inspirasi perempuan berkemajuan': 'Inspiration for Progressive Women',
  'tentang': 'About',
  "redaksi suara 'aisyiyah": "Suara 'Aisyiyah Editorial",
  'konsultasi': 'Consultation',
  'sanggahan': 'Disclaimer',
  'kontak kami': 'Contact Us',
  'informasi': 'Information',
  'layanan': 'Services',
  'info berlangganan': 'Subscription Info',
  "suara 'aisyiyah digital": "Suara 'Aisyiyah Digital",
  "suara 'aisyiyah institute": "Suara 'Aisyiyah Institute",
  'pusat data & pustaka sa': 'SA Data & Library Center',
  'info iklan & advertorial': 'Advertising & Advertorial Info',
  'agen': 'Agents',
  'pedoman media siber': 'Cyber Media Guidelines',
  'kebijakan privasi': 'Privacy Policy',
  'syarat & ketentuan': 'Terms of Service',
  // Child Submenus
  'fikih perempuan': "Women's Jurisprudence",
  'konsultasi agama': 'Religious Consultation',
  'kalam': 'Theology & Kalam',
  'kebijakan politik': 'Political Policy',
  'politik dan hukum': 'Politics & Law',
  'pendidikan': 'Education',
  'sains dan tekno': 'Science & Tech',
  'sosial budaya': 'Socio-Cultural',
  'sejarah': 'History',
  'perempuan': 'Women',
  'finansial': 'Financial',
  'kesehatan': 'Health',
  'wirausaha': 'Entrepreneurship',
  'tokoh': 'Figures',
  'liputan': 'Coverage',
  'lensa organisasi': 'Organizational Lens',
  'hikmah': 'Wisdom',
  'qaryah thayyibah': 'Qaryah Thayyibah',
  'anak': 'Children',
  'aksara': 'Literacy',
  'keluarga': 'Family',
  'parenting': 'Parenting',
  'konsultasi keluarga': 'Family Consultation',
};

export const AR_MENU_MAP: Record<string, string> = {
  'berita': 'الأخبار',
  'kajian': 'الدراسات',
  'keluarga sakinah': 'الأسرة السكينة',
  'wawasan': 'رؤى',
  'gaya hidup': 'أسلوب حياة',
  'inspirasi': 'إلهام',
  'muda': 'شباب',
  'e-majalah': 'المجلة الإلكترونية',
  'home': 'الرئيسية',
  'beranda': 'الرئيسية',
  'kirim tulisan': 'أرسل مقالاً',
  'berlangganan': 'اشتراك',
  'masuk': 'تسجيل الدخول',
  'keluar': 'تسجيل الخروج',
  'inspirasi perempuan berkemajuan': 'إلهام المرأة المتقدمة',
  'tentang': 'حول',
  "redaksi suara 'aisyiyah": 'هيئة تحرير صوت عائشية',
  'konsultasi': 'استشارة',
  'sanggahan': 'إخلاء المسؤولية',
  'kontak kami': 'اتصل بنا',
  'informasi': 'معلومات',
  'layanan': 'خدمات',
  'info berlangganan': 'معلومات الاشتراك',
  "suara 'aisyiyah digital": 'صوت عائشية الرقمية',
  "suara 'aisyiyah institute": 'معهد صوت عائشية',
  'pusat data & pustaka sa': 'مركز البيانات والمكتبة',
  'info iklan & advertorial': 'معلومات الإعلان والتحرير',
  'agen': 'الوكلاء',
  'pedoman media siber': 'إرشادات الإعلام الإلكتروني',
  'kebijakan privasi': 'سياسة الخصوصية',
  'syarat & ketentuan': 'شروط الخدمة',
  // Child Submenus
  'fikih perempuan': 'فقه المرأة',
  'konsultasi agama': 'استشارة دينية',
  'kalam': 'علم الكلام',
  'kebijakan politik': 'السياسة والسياسات',
  'politik dan hukum': 'السياسة والقانون',
  'pendidikan': 'التعليم',
  'sains dan tekno': 'العلوم والتكنولوجيا',
  'sosial budaya': 'الاجتماعية والثقافية',
  'sejarah': 'التاريخ',
  'perempuan': 'المرأة',
  'finansial': 'المالية',
  'kesehatan': 'الصحة',
  'wirausaha': 'ريادة الأعمال',
  'tokoh': 'شخصيات',
  'liputan': 'تغطيات',
  'lensa organisasi': 'عدسة المنظمة',
  'hikmah': 'حكمة',
  'qaryah thayyibah': 'قرية طيبة',
  'anak': 'الأطفال',
  'aksara': 'الأدب والمعرفة',
  'keluarga': 'الأسرة',
  'parenting': 'تربية الأطفال',
  'konsultasi keluarga': 'استشارة أسرية',
};

export function translateMenuLabel(label: string, currentLang: string = 'id'): string {
  if (!label) return '';
  const trimmed = label.trim();
  const lower = trimmed.toLowerCase();

  if (currentLang === 'en') {
    return EN_MENU_MAP[lower] || trimmed;
  }
  if (currentLang === 'ar') {
    return AR_MENU_MAP[lower] || trimmed;
  }
  return trimmed;
}
