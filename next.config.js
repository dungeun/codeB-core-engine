/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  images: {
    domains: ['localhost'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http',
        hostname: '**',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client'],
  },
  webpack: (config, { isServer }) => {
    // undici의 Private class fields 문법 처리
    config.module.rules.push({
      test: /\.js$/,
      include: /node_modules\/(undici|cheerio)/,
      use: {
        loader: 'babel-loader',
        options: {
          presets: ['@babel/preset-env'],
          plugins: ['@babel/plugin-transform-private-methods', '@babel/plugin-transform-class-properties']
        }
      }
    })
    
    return config
  },
  transpilePackages: ['cheerio', 'undici']
}

module.exports = nextConfig