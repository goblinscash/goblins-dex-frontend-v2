import { Inter } from "next/font/google";

import { React, useEffect, useState } from "react";
import MainLayout from "./MainLayout";

import { useRouter } from "next/router";
import AuthLayout from "./AuthLayout";
import ExtraLayout from "./ExtraLayout";

const inter = Inter({
  subsets: ["latin"], // Specify character subsets
  weight: ["400", "500", "600", "700"], // Specify font weights (optional)
  variable: "--font-inter", // Optional: use a CSS variable for the font
});

const Layout = ({ Component, pageProps }) => {
  const [isAuth, setIsAuth] = useState(false);

  const router = useRouter();
  useEffect(() => {
    if (Component.isProtected) {
      if (!auth.authToken) {
        router.push("/login");
      } else {
        setIsAuth(true);
      }
    } else {
      setIsAuth(true);
    }
  }, [Component]);

  return (
    <div className={inter.className}>
      {isAuth &&
        (Component.authRoute ? (
          <AuthLayout Component={Component} pageProps={pageProps} />
        ) : Component.extraLayout ? (
          <ExtraLayout Component={Component} pageProps={pageProps} />
        ) : (
          <MainLayout Component={Component} pageProps={pageProps} />
        ))}
    </div>
  );
};

export default Layout;
