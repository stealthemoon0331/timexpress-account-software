import type { Metadata } from "next";
import "./globals.css";
import { SessionProviderWrapper } from "./session-provider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserProvider } from "./contexts/UserContext";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";
import AdminPage from "./admin/dashboard/page";

export const metadata: Metadata = {
  title: "Shiper",
  description: "Shiper",
  generator: "takuma",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
          <SessionProviderWrapper>
              {children}
            <ToastContainer position="top-right" autoClose={3000} />
          </SessionProviderWrapper>
      </body>
    </html>
  );
}
