import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "I4I Centre — Coming soon",
  description: "I4I Centre — Innovation for Impact Centre. An initiative of TET Education Group.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
