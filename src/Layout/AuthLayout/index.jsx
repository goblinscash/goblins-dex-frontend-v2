import Image from "next/image";
import React from "react";
import Link from "next/link";
import logo from "@/Assets/Images/logo.png";
import styled, { keyframes } from "styled-components";

const AuthLayout = ({ Component, pageProps }) => {
  return (
    <>
      <section
        className={` authLayout z-10 py-5 flex items-center justify-center z-10 relative`}
        style={{ minHeight: "100vh " }}
      >
        <div className="container">
          <div className="grid gap-3 grid-cols-12 items-start">
            <div className="lg:col-span-7 col-span-12 contentWrp self-center pb-lg-5">
              <AuthContent className="" style={{ maxWidth: 560 }}>
                <Image
                  src={logo}
                  alt=""
                  height={10000}
                  width={10000}
                  className="logo max-w-full h-auto w-auto object-contain"
                />
                <div className="content pt-5">
                  <h2 className="m-0 font-light text-white text-6xl py-2">
                    Transform AI Text Original{" "}
                    <span className="themeClr underline"> Content</span>
                  </h2>
                  <p className="m-0 py-2">
                    Lorem ipsum dolor sit amet consectetur. Id egestas maecenas
                    lobortis et faucibus nunc. Aliquet vel odio egestas sit.
                    Nunc consequat lorem sit sed nisl et quam blandit
                    ullamcorper. Eleifend quisque placerat nisl eu enim.
                  </p>
                </div>
              </AuthContent>
            </div>
            <div className="lg:col-span-5 col-span-12">
              <Component {...pageProps} />
            </div>
          </div>
        </div>
      </section>
    </>
  );
};

const AuthContent = styled.div`
  @media (max-width: 575px) {
    img.logo {
      height: 100px !important;
    }
    h2 {
      font-size: 35px;
    }
  }
`;

const fadeInOut = keyframes`
  0% { opacity: 1; }
  50% { opacity: 0; }
  100% { opacity: 1; }
`;

// Styled component for the image wrapper
const ImageWrapper = styled.div`
  overflow: hidden;
`;

const FadingImage = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  animation: ${fadeInOut} 10s infinite;
  opacity: 0;
  transition: opacity 6s ease-in-out;

  &:nth-child(1) {
    animation-delay: 0s;
    opacity: 1;
  }

  &:nth-child(2) {
    animation-delay: 3s;
  }
`;
export default AuthLayout;
