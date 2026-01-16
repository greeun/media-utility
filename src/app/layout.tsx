import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Media Utility - 파일 변환 도구",
  description: "이미지, 비디오, GIF 변환을 브라우저에서 안전하게 처리하세요. HEIC to JPG, 이미지 자르기, 회전, 비디오를 GIF로 변환 등 다양한 기능을 제공합니다.",
  keywords: ["이미지 변환", "HEIC to JPG", "비디오 변환", "GIF 만들기", "이미지 편집"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen flex flex-col`}
      >
        <Header />
        <main className="flex-1">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
