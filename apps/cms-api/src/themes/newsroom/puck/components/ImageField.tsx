import React from "react";

function getAuthToken(): string {
  if (typeof window === "undefined") return "";
  try {
    const cookies = document.cookie.split(";");
    for (let i = 0; i < cookies.length; i++) {
      const c = cookies[i].trim();
      if (c.indexOf("labmu_token=") === 0) {
        return decodeURIComponent(c.substring("labmu_token=".length));
      }
    }
    if ((window as any).getCmsToken) {
      const t = (window as any).getCmsToken();
      if (t) return t;
    }
    return (
      localStorage.getItem("labmu_token") ||
      localStorage.getItem("admin_token") ||
      ""
    );
  } catch (e) {
    return "";
  }
}

export const ImageField = ({ value, onChange, name }: any) => {
  const [isUploading, setIsUploading] = React.useState(false);
  const [statusMsg, setStatusMsg] = React.useState<{
    text: string;
    isError: boolean;
  } | null>(null);

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsUploading(true);
    setStatusMsg(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = getAuthToken();
      const headers: Record<string, string> = {};
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch("/api/media", {
        method: "POST",
        headers,
        credentials: "include",
        body: formData,
      });
      const data = await res.json();
      if (res.ok && data.url) {
        onChange(data.url);
        setStatusMsg({ text: "Gambar berhasil diunggah!", isError: false });
      } else {
        setStatusMsg({
          text: "Gagal: " + (data.error || "Gagal mengunggah gambar"),
          isError: true,
        });
      }
    } catch (err: any) {
      setStatusMsg({
        text: "Error upload: " + (err.message || "Gagal menghubungi server"),
        isError: true,
      });
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div style={{ marginBottom: 16 }}>
      <label
        style={{
          display: "block",
          fontSize: 13,
          fontWeight: "bold",
          marginBottom: 8,
          color: "#374151",
          textTransform: "capitalize",
        }}
      >
        {name ? name.replace(/([A-Z])/g, " $1").trim() : "Image Upload"}
      </label>

      {value && (
        <div style={{ position: "relative", marginBottom: 8 }}>
          <img
            src={value}
            alt="Preview"
            style={{
              width: "100%",
              maxHeight: 120,
              objectFit: "contain",
              background: "#f8fafc",
              borderRadius: 6,
              border: "1px solid #e2e8f0",
              padding: 4,
            }}
          />
          <button
            type="button"
            onClick={() => {
              onChange("");
              setStatusMsg(null);
            }}
            style={{
              position: "absolute",
              top: 4,
              right: 4,
              background: "#ef4444",
              color: "#ffffff",
              border: "none",
              borderRadius: 4,
              padding: "2px 6px",
              fontSize: 11,
              cursor: "pointer",
            }}
            title="Hapus Logo"
          >
            Hapus
          </button>
        </div>
      )}

      <input
        type="file"
        accept="image/*"
        onChange={handleUpload}
        disabled={isUploading}
        style={{
          width: "100%",
          fontSize: 13,
          display: "block",
          marginBottom: 8,
        }}
      />

      {isUploading && (
        <div
          style={{
            fontSize: 12,
            color: "#0284c7",
            marginBottom: 8,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}
        >
          <span>Mengunggah file...</span>
        </div>
      )}

      {statusMsg && (
        <div
          style={{
            fontSize: 12,
            color: statusMsg.isError ? "#dc2626" : "#16a34a",
            marginBottom: 8,
          }}
        >
          {statusMsg.text}
        </div>
      )}

      <input
        type="text"
        value={value || ""}
        onChange={e => {
          onChange(e.target.value);
          setStatusMsg(null);
        }}
        placeholder="Atau tempelkan URL gambar (contoh: /logo-cmsmu.webp)"
        style={{
          width: "100%",
          padding: "6px 8px",
          fontSize: 13,
          border: "1px solid #d1d5db",
          borderRadius: 4,
          boxSizing: "border-box",
        }}
      />
    </div>
  );
};
