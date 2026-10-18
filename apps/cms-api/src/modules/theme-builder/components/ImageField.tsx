import React from "react";

export const ImageField = ({ value, onChange, name }: any) => {
  const [isUploading, setIsUploading] = React.useState(false);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    const formData = new FormData();
    formData.append('file', file);
    
    try {
      const token = typeof window !== 'undefined' ? localStorage.getItem('labmu_token') || '' : '';
      const res = await fetch('/api/media', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`
        },
        body: formData
      });
      const data: any = await res.json();
      if (data.url) {
        onChange(data.url);
      } else {
        const msg = "Upload gagal: " + (data.error || "Unknown error");
        if (typeof window !== "undefined" && (window as any).showToast) (window as any).showToast(msg, "error");
      }
    } catch (err: any) {
      const msg = "Error upload: " + err.message;
      if (typeof window !== "undefined" && (window as any).showToast) (window as any).showToast(msg, "error");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontSize: 13, fontWeight: 'bold', marginBottom: 8, color: '#374151', textTransform: 'capitalize' }}>
        {name ? name.replace(/([A-Z])/g, ' $1').trim() : 'Image Upload'}
      </label>
      {value && <img src={value} alt="Preview" style={{ width: '100%', height: 'auto', marginBottom: 8, borderRadius: 4, border: '1px solid #e5e7eb' }} />}
      <input 
        type="file" 
        accept="image/*" 
        onChange={handleUpload} 
        disabled={isUploading}
        style={{ width: '100%', fontSize: 13, display: 'block', marginBottom: 8 }}
      />
      {isUploading && <div style={{ fontSize: 12, color: '#6b7280', marginBottom: 8 }}>Mengunggah...</div>}
      <input 
        type="text" 
        value={value || ''} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder="Atau masukkan URL gambar"
        style={{ width: '100%', padding: '6px 8px', fontSize: 13, border: '1px solid #d1d5db', borderRadius: 4, boxSizing: 'border-box' }}
      />
    </div>
  );
};
