import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Banner from "@/components/banner";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Canal Design",
  description: "Design canal by Kennedy's and Lacy's theory",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={'scrollbar'}>
        <Banner />
        <div className="h-full content ">
          {children}
        </div>
      </body>
    </html>
  );
}
