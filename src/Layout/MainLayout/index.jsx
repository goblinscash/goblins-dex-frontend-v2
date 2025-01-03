import { React, useState } from "react";
import styled from "styled-components";

// Configure Lexend font with any desired settings

// css
import { useRouter } from "next/router";
import Header from "@/Component/Header";
import Footer from "@/Component/Footer";

const MainLayout = ({ Component, pageProps }) => {
  const router = useRouter();
  const [sidebar, setSidebar] = useState();
  const pageActive = router.pathname.replace("/", "");

  return (
    <>
      <div className={""}>
        <Header sidebar={sidebar} setSidebar={setSidebar} />
        <Component {...pageProps} />
        <Footer />
      </div>
    </>
  );
};

export default MainLayout;
