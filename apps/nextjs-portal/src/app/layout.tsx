import React from "react";
import "./globals.css";

export const metadata = {
  title: "cmsMu Next.js Portal",
  description: "Next.js Multi-Client & Multi-Language Server-Driven UI powered by cmsMu Core Engine",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body>{children}</body>
    </html>
  );
}
