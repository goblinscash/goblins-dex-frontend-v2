import { useRouter } from "next/router";

import { useEffect } from "react";
import Layout from "../Layout";
import "react-tooltip/dist/react-tooltip.css";
import "../Assets/styles/globals.css";
import { ThemeProvider } from "@/ContextApi/ThemeContext";

export default function App({ Component, pageProps, session, ...props }) {
  // const auth = useSelector((state) => state.Auth);
  const router = useRouter();

  useEffect(() => {
    // Get the current URL
    const currentUrl = router.pathname;

    // Extract the page name from the URL
    const pageName = currentUrl === "/" ? "home" : currentUrl.substring(1);

    // Add the page name as a class to the body tag
    document.body.className = pageName;
  }, [router.pathname]);
  return (
    <>
      <ThemeProvider>
        <Layout Component={Component} pageProps={pageProps} {...props} />
      </ThemeProvider>
    </>
  );
}
