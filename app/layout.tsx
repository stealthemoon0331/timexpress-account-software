import type { Metadata } from "next";
import "./globals.css";
import { SessionProviderWrapper } from "./session-provider";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { UserProvider } from "./contexts/UserContext";
import { PayPalScriptProvider } from "@paypal/react-paypal-js";

export const metadata: Metadata = {
  title: "v0 App",
  description: "Created with v0",
  generator: "v0.dev",
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
          <UserProvider>
            {/* <PayPalScriptProvider
              options={{
                clientId: process.env.NEXT_PUBLIC_PAYPAL_CLIENT_ID!,
                currency: "USD",
                intent: "subscription", // Important for subscriptions
                vault: true, // Required for recurring payments
                components: "buttons", // ✅ Fixes the error
              }}
            > */}
              {children}
            {/* </PayPalScriptProvider> */}
          </UserProvider>
          <ToastContainer position="top-right" autoClose={3000} />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
