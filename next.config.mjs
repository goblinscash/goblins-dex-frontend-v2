/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  i18n: {
    locales: ["en", "de"],
    defaultLocale: "en",
  },
  images: {
    domains: [
      "rosondo.s3.us-east-2.amazonaws.com",
      "img.dreamgf.ai",
      "img.dreambf.ai",
    ],
  },
};

export default nextConfig;
