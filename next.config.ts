import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'export', // Generates static HTML/CSS/JS in the 'out' folder
  images: {
    unoptimized: true, // Disables server-side image optimization for static hosting
  },
  // If your site is hosted at username.github.io/repo-name, uncomment and set your repository name below:
  // basePath: '/repo-name',
};

export default nextConfig;
