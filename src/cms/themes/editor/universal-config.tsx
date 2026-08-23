import React from 'react';
import type { Config } from '@puckeditor/core';

const DynamicPreview = ({ title, detail }: { title: string; detail: string }) => <section style={{ maxWidth: 1100, margin: '24px auto', padding: 28, border: '2px dashed #94a3b8', borderRadius: 12, background: '#f8fafc', textAlign: 'center' }}><strong>{title}</strong><p style={{ margin: '8px 0 0', color: '#64748b' }}>{detail}</p></section>;

export const universalHomeConfig: Config = {
  components: {
    HomeHero: {
      fields: {
        eyebrow: { type: 'text' }, title: { type: 'text' }, description: { type: 'textarea' },
        buttonText: { type: 'text' }, buttonUrl: { type: 'text' }, background: { type: 'text' }, textColor: { type: 'text' }
      },
      defaultProps: { eyebrow: 'Selamat datang', title: 'Bangun halaman utama Anda', description: 'Edit teks, susunan, dan bagian homepage langsung dari Theme Editor.', buttonText: 'Pelajari lebih lanjut', buttonUrl: '/about', background: '#0f766e', textColor: '#ffffff' },
      render: ({ eyebrow, title, description, buttonText, buttonUrl, background, textColor }: any) => (
        <section style={{ padding: '80px 24px', textAlign: 'center', background, color: textColor }}>
          <small style={{ textTransform: 'uppercase', letterSpacing: '.14em', fontWeight: 700 }}>{eyebrow}</small>
          <h1 style={{ fontSize: 'clamp(2rem,5vw,4rem)', margin: '14px auto', maxWidth: 900 }}>{title}</h1>
          <p style={{ maxWidth: 720, margin: '0 auto 28px', fontSize: 18 }}>{description}</p>
          {buttonText && <a href={buttonUrl} style={{ display: 'inline-block', padding: '12px 22px', borderRadius: 8, background: textColor, color: background, fontWeight: 700 }}>{buttonText}</a>}
        </section>
      )
    },
    HomeText: {
      fields: { title: { type: 'text' }, content: { type: 'textarea' }, align: { type: 'select', options: [{ label: 'Kiri', value: 'left' }, { label: 'Tengah', value: 'center' }] } },
      defaultProps: { title: 'Tentang Kami', content: 'Tuliskan informasi utama organisasi atau website Anda di sini.', align: 'left' },
      render: ({ title, content, align }: any) => <section style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px', textAlign: align }}><h2 style={{ fontSize: 32 }}>{title}</h2><p style={{ fontSize: 17, lineHeight: 1.8, whiteSpace: 'pre-wrap' }}>{content}</p></section>
    },
    HomeLatestPosts: {
      fields: { title: { type: 'text' }, limit: { type: 'number' } },
      defaultProps: { title: 'Artikel Terbaru', limit: 6 },
      render: ({ title, limit }: any) => <section style={{ maxWidth: 1100, margin: '0 auto', padding: '48px 24px' }}><h2>{title}</h2><div style={{ padding: 32, border: '2px dashed #cbd5e1', borderRadius: 12, color: '#64748b', textAlign: 'center' }}>Preview {limit} artikel terbaru akan ditampilkan di website.</div></section>
    },
    HomeCallToAction: {
      fields: { title: { type: 'text' }, description: { type: 'textarea' }, buttonText: { type: 'text' }, buttonUrl: { type: 'text' }, background: { type: 'text' } },
      defaultProps: { title: 'Mari berkolaborasi', description: 'Hubungi kami untuk informasi lebih lanjut.', buttonText: 'Hubungi Kami', buttonUrl: '/contact', background: '#f1f5f9' },
      render: ({ title, description, buttonText, buttonUrl, background }: any) => <section style={{ padding: '64px 24px', background, textAlign: 'center' }}><h2>{title}</h2><p>{description}</p><a href={buttonUrl} style={{ display: 'inline-block', marginTop: 12, padding: '11px 20px', background: '#0f172a', color: '#fff', borderRadius: 8 }}>{buttonText}</a></section>
    },
    NewsBreakingBar: {
      fields: { label: { type: 'text' }, text: { type: 'text' }, url: { type: 'text' }, background: { type: 'text' } },
      defaultProps: { label: 'Breaking News', text: 'Berita terbaru dan terpenting hari ini', url: '#', background: '#b91c1c' },
      render: ({ label, text, url, background }: any) => <div style={{ padding: '11px 24px', background, color: '#fff', textAlign: 'center' }}><strong style={{ marginRight: 14 }}>{label}</strong><a href={url} style={{ color: '#fff' }}>{text}</a></div>
    },
    NewsFeatured: {
      fields: { title: { type: 'text' }, category: { type: 'text' }, limit: { type: 'number' } },
      defaultProps: { title: 'Pilihan Redaksi', category: '', limit: 4 },
      render: ({ title, category, limit }: any) => <DynamicPreview title={title} detail={`${limit} berita unggulan${category ? ` dari kategori ${category}` : ''}`} />
    },
    NewsGrid: {
      fields: { title: { type: 'text' }, category: { type: 'text' }, limit: { type: 'number' }, columns: { type: 'select', options: [{ label: '2 kolom', value: '2' }, { label: '3 kolom', value: '3' }, { label: '4 kolom', value: '4' }] } },
      defaultProps: { title: 'Berita Terkini', category: '', limit: 6, columns: '3' },
      render: ({ title, category, limit, columns }: any) => <DynamicPreview title={title} detail={`${limit} artikel, ${columns} kolom${category ? `, kategori ${category}` : ''}`} />
    },
    NewsList: {
      fields: { title: { type: 'text' }, category: { type: 'text' }, limit: { type: 'number' }, showExcerpt: { type: 'radio', options: [{ label: 'Ya', value: 'yes' }, { label: 'Tidak', value: 'no' }] } },
      defaultProps: { title: 'Berita per Kategori', category: 'Berita', limit: 5, showExcerpt: 'yes' },
      render: ({ title, category, limit }: any) => <DynamicPreview title={title} detail={`${limit} artikel dari ${category || 'semua kategori'}`} />
    },
    NewsPopular: {
      fields: { title: { type: 'text' }, limit: { type: 'number' } }, defaultProps: { title: 'Terpopuler', limit: 5 },
      render: ({ title, limit }: any) => <DynamicPreview title={title} detail={`${limit} artikel dengan pembaca terbanyak`} />
    },
    NewsNewsletter: {
      fields: { title: { type: 'text' }, description: { type: 'textarea' }, buttonText: { type: 'text' }, background: { type: 'text' } },
      defaultProps: { title: 'Berlangganan Newsletter', description: 'Dapatkan berita pilihan langsung melalui email.', buttonText: 'Berlangganan', background: '#0f172a' },
      render: ({ title, description, buttonText, background }: any) => <section style={{ padding: 48, background, color: '#fff', textAlign: 'center' }}><h2>{title}</h2><p>{description}</p><div><input aria-label="Email" placeholder="email@contoh.com" style={{ padding: 12, width: 260 }} disabled /><button style={{ padding: 13 }}>{buttonText}</button></div></section>
    },
    LandingLogoCloud: {
      fields: { title: { type: 'text' }, logos: { type: 'array', arrayFields: { name: { type: 'text' }, imageUrl: { type: 'text' }, url: { type: 'text' } } } },
      defaultProps: { title: 'Dipercaya oleh', logos: [{ name: 'Partner 1', imageUrl: '', url: '#' }, { name: 'Partner 2', imageUrl: '', url: '#' }] },
      render: ({ title, logos }: any) => <section style={{ padding: '48px 24px', textAlign: 'center' }}><p>{title}</p><div style={{ display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 30 }}>{logos.map((logo: any, i: number) => logo.imageUrl ? <img key={i} src={logo.imageUrl} alt={logo.name} style={{ maxWidth: 130, height: 50, objectFit: 'contain' }} /> : <strong key={i}>{logo.name}</strong>)}</div></section>
    },
    LandingFeatures: {
      fields: { title: { type: 'text' }, description: { type: 'textarea' }, items: { type: 'array', arrayFields: { icon: { type: 'text' }, title: { type: 'text' }, description: { type: 'textarea' } } } },
      defaultProps: { title: 'Keunggulan Kami', description: 'Solusi yang dibuat untuk kebutuhan Anda.', items: [{ icon: '⚡', title: 'Cepat', description: 'Performa optimal.' }, { icon: '🔒', title: 'Aman', description: 'Keamanan terjaga.' }, { icon: '📱', title: 'Responsif', description: 'Nyaman di semua perangkat.' }] },
      render: ({ title, description, items }: any) => <section style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}><h2>{title}</h2><p>{description}</p><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(210px,1fr))', gap: 20 }}>{items.map((item: any, i: number) => <article key={i} style={{ padding: 24, border: '1px solid #e2e8f0', borderRadius: 12 }}><b style={{ fontSize: 30 }}>{item.icon}</b><h3>{item.title}</h3><p>{item.description}</p></article>)}</div></section>
    },
    LandingStats: {
      fields: { items: { type: 'array', arrayFields: { value: { type: 'text' }, label: { type: 'text' } } }, background: { type: 'text' } },
      defaultProps: { items: [{ value: '10K+', label: 'Pengguna' }, { value: '99.9%', label: 'Uptime' }, { value: '24/7', label: 'Dukungan' }], background: '#ecfdf5' },
      render: ({ items, background }: any) => <section style={{ padding: '50px 24px', background, display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 70, textAlign: 'center' }}>{items.map((item: any, i: number) => <div key={i}><strong style={{ fontSize: 36 }}>{item.value}</strong><div>{item.label}</div></div>)}</section>
    },
    LandingTestimonials: {
      fields: { title: { type: 'text' }, items: { type: 'array', arrayFields: { quote: { type: 'textarea' }, name: { type: 'text' }, role: { type: 'text' } } } },
      defaultProps: { title: 'Apa Kata Mereka', items: [{ quote: 'Layanan yang sangat membantu.', name: 'Nama Pelanggan', role: 'CEO' }] },
      render: ({ title, items }: any) => <section style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px' }}><h2 style={{ textAlign: 'center' }}>{title}</h2><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(260px,1fr))', gap: 20 }}>{items.map((item: any, i: number) => <blockquote key={i} style={{ margin: 0, padding: 24, background: '#f8fafc', borderRadius: 12 }}><p>“{item.quote}”</p><strong>{item.name}</strong><small style={{ display: 'block' }}>{item.role}</small></blockquote>)}</div></section>
    },
    LandingPricing: {
      fields: { title: { type: 'text' }, plans: { type: 'array', arrayFields: { name: { type: 'text' }, price: { type: 'text' }, features: { type: 'textarea' }, buttonText: { type: 'text' }, buttonUrl: { type: 'text' } } } },
      defaultProps: { title: 'Pilih Paket', plans: [{ name: 'Starter', price: 'Gratis', features: 'Fitur dasar\nDukungan komunitas', buttonText: 'Mulai', buttonUrl: '#' }] },
      render: ({ title, plans }: any) => <section style={{ maxWidth: 1100, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}><h2>{title}</h2><div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(240px,1fr))', gap: 20 }}>{plans.map((plan: any, i: number) => <article key={i} style={{ padding: 28, border: '1px solid #cbd5e1', borderRadius: 12 }}><h3>{plan.name}</h3><strong style={{ fontSize: 30 }}>{plan.price}</strong><p style={{ whiteSpace: 'pre-line' }}>{plan.features}</p><a href={plan.buttonUrl}>{plan.buttonText}</a></article>)}</div></section>
    },
    LandingFaq: {
      fields: { title: { type: 'text' }, items: { type: 'array', arrayFields: { question: { type: 'text' }, answer: { type: 'textarea' } } } },
      defaultProps: { title: 'Pertanyaan Umum', items: [{ question: 'Bagaimana cara memulai?', answer: 'Hubungi tim kami atau pilih paket yang sesuai.' }] },
      render: ({ title, items }: any) => <section style={{ maxWidth: 850, margin: '0 auto', padding: '64px 24px' }}><h2>{title}</h2>{items.map((item: any, i: number) => <details key={i} style={{ padding: 16, borderBottom: '1px solid #e2e8f0' }}><summary style={{ fontWeight: 700 }}>{item.question}</summary><p>{item.answer}</p></details>)}</section>
    },
    LandingContact: {
      fields: { title: { type: 'text' }, description: { type: 'textarea' }, email: { type: 'text' }, phone: { type: 'text' }, address: { type: 'textarea' } },
      defaultProps: { title: 'Hubungi Kami', description: 'Kami siap membantu kebutuhan Anda.', email: 'halo@contoh.id', phone: '+62 812 3456 7890', address: 'Indonesia' },
      render: ({ title, description, email, phone, address }: any) => <section style={{ maxWidth: 900, margin: '0 auto', padding: '64px 24px', textAlign: 'center' }}><h2>{title}</h2><p>{description}</p><p><a href={`mailto:${email}`}>{email}</a> · <a href={`tel:${phone}`}>{phone}</a></p><p>{address}</p></section>
    },
    LayoutSpacer: {
      fields: { height: { type: 'number' }, background: { type: 'text' } }, defaultProps: { height: 40, background: 'transparent' },
      render: ({ height, background }: any) => <div aria-hidden="true" style={{ height, background }} />
    }
  }
};

export const universalHomeDefault = (themeId: string) => ({
  content: [
    { type: 'HomeHero', props: { id: 'HomeHero-1' } },
    { type: 'HomeText', props: { id: 'HomeText-1' } },
    { type: 'HomeLatestPosts', props: { id: 'HomeLatestPosts-1' } },
    { type: 'HomeCallToAction', props: { id: 'HomeCallToAction-1' } }
  ],
  root: { props: { title: 'Beranda', editorTheme: themeId, editorType: 'universal-home' } }, zones: {}
});
