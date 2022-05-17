import { mdiBrightness6, mdiClose, mdiCodeTags, mdiMusic } from '@mdi/js'
import Icon from '@mdi/react'
import {
  App,
  Button,
  Flex,
  Header,
  Link,
  Main,
  Section,
  useDarkMode,
} from 'infrastry'
import { Database, DatabaseData } from 'musites'
import type { NextPage } from 'next'
import { useEffect, useState } from 'react'
import { Musites } from '../components'

export interface SiteConfig {
  database: string
  about: string
  source: string
}

const Home: NextPage = () => {
  // Dark mode
  const { toggle: toggleDark } = useDarkMode()

  // Loading
  const [loading, setLoading] = useState<boolean>(true)

  // Data
  const [config, setConfig] = useState<SiteConfig | null>(null)
  const [baseUrl, setBaseUrl] = useState<string>('/')
  const [database, setDatabase] = useState<Database | null>(null)

  // About panel
  const [showAbout, setShowAbout] = useState(false)

  useEffect(() => {
    ;(async () => {
      try {
        // Fetch site config
        const siteConfigRaw = await fetch('/musites.json')
        const siteConfig: SiteConfig = await siteConfigRaw.json()
        let configBaseUrl = siteConfig.database
        if (!configBaseUrl.endsWith('/')) configBaseUrl += '/'

        // Fetch database
        const databaseRaw = await fetch(`/${configBaseUrl}index.json`)
        const databaseData: DatabaseData = await databaseRaw.json()

        // Set state
        setConfig(siteConfig)
        setBaseUrl(configBaseUrl)
        setDatabase(new Database(databaseData))
        setLoading(false)
      } catch (error) {
        // Handle error
        return
      }
    })()
  }, [])

  return (
    <App>
      <Header
        className="musites-index-container"
        left={[
          <Link key="home" href="/">
            <Icon path={mdiMusic} size={1.2} />
          </Link>,
        ]}
        center={[]}
        right={[
          <Link key="source" href={config?.source}>
            <Icon path={mdiCodeTags} size={1.2} />
          </Link>,
          <Button key="dark" plain onClick={toggleDark}>
            <Icon path={mdiBrightness6} size={1.2} />
          </Button>,
        ]}
      />
      <Main className="musites-index-container">
        {loading ? (
          <Section className="inf-flex inf-flex-column inf-justify-center inf-align-center inf-t-align-center">
            <p className="inf-s-lll inf-c-acc-dd">Loading...</p>
          </Section>
        ) : (
          <Musites baseUrl={baseUrl} data={database as Database} />
        )}
      </Main>
      <footer className="inf-base musites-index-container musites-index-footer">
        <Link onClick={() => setShowAbout(true)}>About</Link>
        <span> | Created using </span>
        <Link href="https://github.com/musites/musites">Musites</Link>
      </footer>
      {showAbout && (
        <div className="inf-base musites-index-about musites-index-container">
          <div className="musites-index-about-content">
            {config?.about.split('\n').map((x, i) => (
              <p key={i}>
                {x}
                <br></br>
              </p>
            ))}
          </div>

          <Flex align="center" className="musites-index-about-close">
            <Button plain onClick={() => setShowAbout(false)}>
              <Icon path={mdiClose} size={1.2} />
            </Button>
          </Flex>
        </div>
      )}
    </App>
  )
}

export default Home
