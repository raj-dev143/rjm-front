/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: "/api/:path*",
        // destination: "http://localhost:5000/api/:path*", // Change the port to your backend server's port
        destination: "https://rjm.vercel.app/api/:path*", // Change the port to your backend server's port
      },
    ];
  },
};

export default nextConfig;
