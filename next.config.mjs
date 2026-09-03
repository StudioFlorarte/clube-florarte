/** @type {import('next').NextConfig} */
const config = {
  distDir: process.env.NODE_ENV === 'development' ? '.next-dev' : '.next',
}
export default config
