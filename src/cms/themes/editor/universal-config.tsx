import React from 'react';
import type { Config } from '@puckeditor/core';

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
