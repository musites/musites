/** @type {import('next').NextConfig} */

const withTM = require('next-transpile-modules')(['infrastry'])

const nextConfig = {
  reactStrictMode: true,
}

module.exports = withTM(nextConfig)
