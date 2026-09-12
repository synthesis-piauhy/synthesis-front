import type { Metadata } from "next";
import "./globals.css";
import { Providers } from "./providers";

// A fresh CSP nonce must accompany every rendered document.
export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "synthesis | Início",
  description: "Relatos semanais",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="pt-BR">
      <body>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
