/** @type {import('next').NextConfig} */

const withTM = require('next-transpile-modules')([])

const nextConfig = {
  reactStrictMode: true,
}

module.exports = withTM(nextConfig)
