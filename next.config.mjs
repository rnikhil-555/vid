/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "image.tmdb.org",
        port: "",
        pathname: "/*/**",
      },
      {
        protocol: "https",
        hostname: "s4.anilist.co",
        port: "",
        pathname: "/*/**",
      },
      {
        protocol: "https",
        hostname: "media.kitsu.app",
        port: "",
        pathname: "/*/**",
      },
      {
        protocol: "https",
        hostname: "i.imgur.com",
        port: "",
        pathname: "/*/**",
      },
      {
        protocol: "https",
        hostname: "d2n0069hmnqmmx.cloudfront.net",
        port: "",
        pathname: "/*/**",
      },
      {
        protocol: "https",
        hostname: "upload.wikimedia.org",
        port: "",
        pathname: "/*/**",
      },
    ],
  },
  productionBrowserSourceMaps: false,
  experimental: {
    staleTimes: {
      dynamic: 360
    }
  },
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://worker.vidlink.pro/proxy/:path*',
      },
    ]
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'Access-Control-Allow-Credentials', value: 'true' },
          { key: 'Access-Control-Allow-Origin', value: '*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,OPTIONS' },
          { key: 'Access-Control-Allow-Headers', value: '*' },
        ]
      }
    ]
  }
};

export default nextConfig;
