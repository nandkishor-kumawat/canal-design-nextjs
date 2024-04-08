import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

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
        <div className="canalHead h-full w-full flex items-end lg:pb-[10%] pb-[20%] justify-center border-b border-b-[rgba(0,0,0,0.1)]">
          <h1 className="font-bold w-3/4 text-white text-center select-none">Design of Irrigation Canal</h1>
        </div>
        <div className="h-full content ">
          {children}
        </div>
      </body>
    </html>
  );
}
