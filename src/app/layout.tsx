import type { Metadata } from "next";
// import { Geist, Geist_Mono } from "next/font/google";
import "slick-carousel/slick/slick.css";
import "slick-carousel/slick/slick-theme.css";
import "../assets/styles/globals.css";
import { ThemeProvider } from "@/ContextApi/ThemeContext";
import Header from "@/components/header";
import Footer from "@/components/footer";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";
import { config } from "@/config";
import Web3ModalProvider from "@/context";
import { ToastContainer } from "react-toastify";
import 'react-tooltip/dist/react-tooltip.css'
import "react-toastify/dist/ReactToastify.css";

// const geistSans = Geist({
//   variable: "--font-geist-sans",
//   subsets: ["latin"],
// });

// const geistMono = Geist_Mono({
//   variable: "--font-geist-mono",
//   subsets: ["latin"],
// });

export const metadata: Metadata = {
  title: "Goblins Cash",
  description: "Goblins Cash",
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon.png', type: 'image/png' }
    ],
    apple: [
      { url: '/favicon/apple-touch-icon.png' }
    ],
    shortcut: [
      { url: '/favicon.ico' }
    ],
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieHeader = await headers();
  const initialState = cookieToInitialState(config, cookieHeader.get("cookie"));

  return (
    <html lang="en">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <link rel="manifest" href="/manifest.json" />
        <link rel="icon" href="/favicon.ico" />
        <link rel="apple-touch-icon" href="/favicon/apple-touch-icon.png" />
        <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.7.2/css/all.min.css" integrity="sha512-Evv84Mr4kqVGRNSgIGL/F/aIDqQb7xQ2vcrdIwxfjThSH8CSR7PBEakCr51Ck+w+/U6swU2Im1vVX0SVk9ABhg==" crossOrigin="anonymous" referrerPolicy="no-referrer" />
      </head>
      <body>
        <ThemeProvider>
          <Web3ModalProvider initialState={initialState}>
            <Header />
            {children}
            <Footer />
          </Web3ModalProvider>
          <ToastContainer
            position="top-right"
            autoClose={4000}
            hideProgressBar={false}
            newestOnTop
            closeOnClick
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="dark"
          />
        </ThemeProvider>
      </body>
    </html>
  );
}
