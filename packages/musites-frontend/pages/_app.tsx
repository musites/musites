import type { AppProps } from 'next/app'
import React from 'react'
import 'infrastry/lib/styles/index.css'
import '../styles/index.css'

function MyApp({ Component, pageProps }: AppProps) {
  return <Component {...pageProps} />
}

export default MyApp
