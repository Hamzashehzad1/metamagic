import type {NextConfig} from 'next';

const nextConfig: NextConfig = {
  webpack: (config) => {
    config.externals.push({
      '@tensorflow/tfjs-node': 'commonjs @tensorflow/tfjs-node',
    });
    return config;
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '4.5mb',
    },
  },
  /* config options here */
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'placehold.co',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
