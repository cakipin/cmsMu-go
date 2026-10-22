"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

interface LanguageSwitcherProps {
  currentLocale: string;
}

const LOCALES = [
  { code: "id", label: "ID", name: "Bahasa Indonesia" },
  { code: "en", label: "EN", name: "English" },
  { code: "ar", label: "العربية", name: "العربية" },
];

export function LanguageSwitcher({ currentLocale }: LanguageSwitcherProps) {
  const pathname = usePathname();

  // Ganti segment bahasa pada pathname saat ini
  const getLocalePath = (targetLocale: string) => {
    if (!pathname) return `/${targetLocale}`;
    const segments = pathname.split("/").filter(Boolean);
    if (segments.length === 0) return `/${targetLocale}`;
    if (["id", "en", "ar"].includes(segments[0])) {
      segments[0] = targetLocale;
      return `/${segments.join("/")}`;
    }
    return `/${targetLocale}/${segments.join("/")}`;
  };

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        backgroundColor: "var(--border-subtle)",
        borderRadius: "9999px",
        padding: "3px",
        gap: "4px",
      }}
    >
      {LOCALES.map(loc => {
        const isActive = loc.code === currentLocale;
        return (
          <Link
            key={loc.code}
            href={getLocalePath(loc.code)}
            title={loc.name}
            style={{
              padding: "4px 10px",
              borderRadius: "9999px",
              fontSize: "0.8125rem",
              fontWeight: isActive ? 700 : 500,
              color: isActive ? "#ffffff" : "var(--text-secondary)",
              backgroundColor: isActive ? "var(--accent-primary)" : "transparent",
              transition: "all 0.15s ease",
            }}
          >
            {loc.label}
          </Link>
        );
      })}
    </div>
  );
}
