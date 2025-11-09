"use client";

import "./globals.css";
import { useEffect } from "react";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"] });

function useDisableRightClick() {
  useEffect(() => {
    const handler = (event: MouseEvent) => {
      if ((event.target as HTMLElement)?.nodeName !== "INPUT") {
        event.preventDefault();
      }
    };
    document.addEventListener("contextmenu", handler);
    return () => document.removeEventListener("contextmenu", handler);
  }, []);
}

export default function RootLayout({
  children
}: {
  children: React.ReactNode;
}) {
  useDisableRightClick();

  return (
    <html lang="en" className="bg-slate-950 text-slate-100 antialiased">
      <head>
        <title>Jarvis Commerce Agent</title>
        <meta
          name="description"
          content="Voice-driven assistant to manage catalog operations across Amazon, Flipkart, Meesho, and Myntra."
        />
      </head>
      <body className={`${inter.className} min-h-screen`}>
        <main className="max-w-7xl mx-auto px-4 py-8">{children}</main>
      </body>
    </html>
  );
}
