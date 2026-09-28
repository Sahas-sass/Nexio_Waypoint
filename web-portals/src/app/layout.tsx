import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";

// Load Manrope from Google Fonts
const manrope = Manrope({
  subsets: ["latin"],
  variable: "--font-manrope",
  display: "swap",
});

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
      {/* Apply the custom background color and font variables globally */}
      <body className={`${manrope.variable} font-sans bg-waypoint-bg text-waypoint-text antialiased`}>
        {children}
      </body>
    </html>
  );
}