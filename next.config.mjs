/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.gstatic.com',
        port: '',
        pathname: '/images/branding/product/1x/gemini_48dp.png',
      },
      {
        protocol: 'https' ,
        hostname: 'raw.githubusercontent.com',
        port: '',
        pathname: '/firebase/firebase-brand-guidelines/main/static/images/brand-guidelines/logo-logomark.svg',
      },
      {
        protocol: 'https',
        hostname: 'upload.wikimedia.org',
        port: '',
        pathname: '/wikipedia/commons/2/20/WordPress_logo.svg',
      },
    ],
  },
};

export default nextConfig;
