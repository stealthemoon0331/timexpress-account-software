import type { Metadata } from "next";
import "./globals.css";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ToastContainer } from "react-toastify";

import "react-toastify/dist/ReactToastify.css";
import { UserProvider } from "./contexts/UserContext";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import AdminPage from "./admin/dashboard/page";
import { useEffect } from "react";
import { SessionProviderWrapper } from "./session-provider";
export const metadata: Metadata = {
  title: "Shiper",
  description: "Shiper",
  generator: "takuma",
  icons: {
    icon: [
      { url: '/favicon.ico' },
    ]
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {

 return (
    <html lang="en">
      <head>
        <link href="https://fonts.googleapis.com/css2?family=Caveat:wght@700&display=swap" rel="stylesheet"/>
        <link rel="shortcut icon" href="/favicon.ico" />
      </head>
      <body className="scroll-smooth">
          <SessionProviderWrapper>
              {children}
            <ToastContainer position="top-right" autoClose={3000} />
          </SessionProviderWrapper>
      </body>
    </html>
  );
}
