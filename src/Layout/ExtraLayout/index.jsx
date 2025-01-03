import React from "react";

const ExtraLayout = ({ Component, pageProps }) => {
  return (
    <>
      <Component {...pageProps} />
    </>
  );
};

export default ExtraLayout;
