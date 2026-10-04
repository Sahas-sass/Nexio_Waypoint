import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Waypoint Logistics",
  description: "End-to-End Retail Logistics Platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Manrope:wght@200..800&display=swap" rel="stylesheet" />
      </head>
      {/* Apply the custom background color and font variables globally */}
      <body 
        className="font-sans bg-waypoint-bg text-waypoint-text antialiased" 
        style={{ '--font-manrope': '"Manrope", sans-serif' } as React.CSSProperties}
      >
        {children}
      </body>
    </html>
  );
}